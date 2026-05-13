import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import WorkflowVisualizer from "../components/WorkflowVisualizer";
import WorkflowEditor from "../components/WorkflowEditor";
import "./mutual.css"

export default function MutualPage() {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [deliverableNote, setDeliverableNote] = useState("");
  const [chatDisabled, setChatDisabled] = useState(false);

  const [selectedCollab, setSelectedCollab] = useState(null);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [showDisputePopup, setShowDisputePopup] = useState(false);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [evidence, setEvidence] = useState(null);

  const [showWorkflowEditor, setShowWorkflowEditor] = useState(false);
  const [workflowData, setWorkflowData] = useState(null);

  const { collabId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --------------------------------------------------
  // FETCH COLLABORATIONS
  // --------------------------------------------------
  // --------------------------------------------------
  // FETCH COLLABORATIONS
  // --------------------------------------------------
  const fetchCollabs = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Fetch raw hired applications
      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .eq("status", "hired");

      if (appsError) throw appsError;
      if (!apps || apps.length === 0) {
        setCollabs([]);
        return;
      }

      // 2. Fetch all raw projects involved
      const projectIds = [...new Set(apps.map(a => a.project_id))];
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds);

      // 3. Fetch all raw brand profiles
      const brandIds = [...new Set(projectsData?.map(p => p.brand_id) || [])];
      const { data: bProfiles } = await supabase
        .from("brand_profiles")
        .select("*")
        .in("user_id", brandIds);

      // 4. Fetch all raw creator profiles
      const creatorIds = [...new Set(apps.map(a => a.creator_id))];
      const { data: cProfiles } = await supabase
        .from("creator_profiles")
        .select("*")
        .in("user_id", creatorIds);

      // 5. Fetch core profiles for backup names
      const allUserIds = [...new Set([...brandIds, ...creatorIds])];
      const { data: coreProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", allUserIds);

      // 6. Manual Stitching (The MNC way)
      const merged = apps.map(app => {
        const project = projectsData?.find(p => p.id === app.project_id);
        const creator = cProfiles?.find(p => p.user_id === app.creator_id) ||
          coreProfiles?.find(p => p.id === app.creator_id);
        const brand = bProfiles?.find(p => p.user_id === project?.brand_id) ||
          coreProfiles?.find(p => p.id === project?.brand_id);

        return {
          ...app,
          project_details: project,
          creator_info: creator,
          brand_info: brand
        };
      });

      setCollabs(merged);

      // Load workflow data if exists in active collab
      const currentActive = collabId ? merged.find(c => String(c.id) === String(collabId)) : null;
      if (currentActive?.workflow_data) {
        setWorkflowData(currentActive.workflow_data);
      }
    } catch (err) {
      console.error("Fetch Collabs Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🛑 Prevent re-fetching if we already have collaborations
    if (collabs.length > 0) return;
    fetchCollabs();
  }, [user]);

  // --------------------------------------------------
  // ACTIVE COLLAB
  // --------------------------------------------------
  const activeCollab = collabId
    ? collabs.find((c) => String(c.id) === String(collabId))
    : null;

  // --------------------------------------------------
  // DEADLINE TIMER
  // --------------------------------------------------
  useEffect(() => {
    if (!activeCollab?.project_details?.deadline) return;

    const deadline = new Date(activeCollab.project_details.deadline + "T23:59:59");

    const timer = setInterval(() => {
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        clearInterval(timer);
        setIsExpired(true);
        setTimeLeft("00:00:00");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${days}d ${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCollab]);

  // --------------------------------------------------
  // AUTO LOCK + FORCE RATING
  // --------------------------------------------------
  useEffect(() => {
    if (isExpired) {
      setChatDisabled(true);
      setShowRatingPopup(true);
    }
  }, [isExpired]);

  // --------------------------------------------------
  // SUBMIT REVIEW
  // --------------------------------------------------
  const handleSubmitReview = async () => {
    if (!rating) return alert("Please give a rating");
    if (!activeCollab) return;

    try {
      setLoading(true);

      // 1. Insert review into Supabase
      const { error: reviewError } = await supabase
        .from("reviews")
        .insert([{
          project_id: activeCollab.project_id,
          reviewer_id: user.id,
          reviewee_id: otherUserId,
          rating,
          review_text: reviewText
        }]);

      if (reviewError) throw reviewError;

      // 2. Lock the collaboration (Update status in applications)
      const { error: lockError } = await supabase
        .from("applications")
        .update({ is_locked: true })
        .eq("id", activeCollab.id);

      if (lockError) throw lockError;

      alert("Review submitted and collaboration finalized!");
      setShowRatingPopup(false);
      fetchCollabs(); // Refresh UI
    } catch (err) {
      console.error("Review error:", err);
      alert("Failed to submit review: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // WORK WORKFLOW (SUBMIT / APPROVE)
  // --------------------------------------------------
  const handleSubmitWork = async () => {
    if (!deliverableUrl) return alert("Please provide a link to your work.");
    try {
      setLoading(true);
      const { error } = await supabase
        .from("applications")
        .update({
          work_status: "review",
          deliverable_url: deliverableUrl,
          deliverable_note: deliverableNote,
          submitted_at: new Date().toISOString()
        })
        .eq("id", activeCollab.id);

      if (error) throw error;
      alert("Work submitted for review!");
      fetchCollabs();
    } catch (err) {
      alert("Submission failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWork = async () => {
    if (!window.confirm("Are you sure you want to approve this work? This will mark the project as completed.")) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from("applications")
        .update({
          work_status: "completed",
          approved_at: new Date().toISOString()
        })
        .eq("id", activeCollab.id);

      if (error) throw error;
      alert("Work approved! Project completed.");
      fetchCollabs();
    } catch (err) {
      alert("Approval failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async (data) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("applications")
        .update({ workflow_data: data })
        .eq("id", activeCollab.id);

      if (error) {
        if (error.code === 'PGRST100' || error.message.includes('column "workflow_data" does not exist')) {
          alert("Database Error: Please add a JSONB column 'workflow_data' to your 'applications' table in Supabase.");
        } else {
          throw error;
        }
      } else {
        setWorkflowData(data);
        setShowWorkflowEditor(false);
        alert("Workflow saved successfully!");
      }
    } catch (err) {
      alert("Failed to save workflow: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOADING / ERROR
  // --------------------------------------------------
  if (loading) return <p>Loading collaboration...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!activeCollab) return <p>No active collaboration found.</p>;

  // Detect if current user is the brand or the creator
  const isBrand = user.id === activeCollab.project_details?.brand_id;
  const otherUser = isBrand ? activeCollab.creator_info : activeCollab.brand_info;
  const otherUserId = isBrand ? activeCollab.creator_id : activeCollab.project_details?.brand_id;  // Status Helpers
  const status = activeCollab.work_status || "in_progress";
  const step = status === "in_progress" ? 1 : status === "review" ? 2 : 3;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="mutual-page glass">
      <h1 className="section-title">🤝 Collaboration Hub</h1>

      {/* 1. PROGRESS PIPELINE */}
      <div className="pipeline-container glass">
        <WorkflowVisualizer
          workflowData={workflowData}
          currentStepId={String(step)}
        />
      </div>

      <div className="header-actions">
        <div className={`deadline-timer ${isExpired ? "expired" : ""}`}>
          ⏱️ {isExpired ? "Deadline Passed" : `Time Remaining: ${timeLeft}`}
        </div>
        <button className="btn btn-outline" onClick={() => setShowBrief(!showBrief)}>
          {showBrief ? "Hide Brief" : "View Project Brief"}
        </button>
      </div>

      {showBrief && (
        <div className="brief-box glass">
          <h3>Project Requirements</h3>
          <p>{activeCollab.project_details?.description || "No description provided."}</p>
          <div className="brief-meta">
            <span>💰 Budget: ${activeCollab.project_details?.budget || "N/A"}</span>
            <span>📅 Deadline: {activeCollab.project_details?.deadline || "N/A"}</span>
          </div>
        </div>
      )}

      <div className="collab-card glass">
        <h2>{activeCollab.project_details?.title || "Untitled Project"}</h2>

        <p>👔 Brand: {activeCollab.brand_info?.brand_name || "Unknown"} ({activeCollab.brand_info?.full_name || activeCollab.brand_info?.username || "Owner"})</p>
        <p>🎨 Creator: {activeCollab.creator_info?.full_name || activeCollab.creator_info?.username || "Unknown"}</p>

        <div className="collab-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/chat/${otherUserId}`)}
            disabled={chatDisabled || activeCollab.is_locked}
          >
            💬 Open Chat
          </button>

          <button
            className="btn btn-outline"
            onClick={() => setShowRatingPopup(true)}
            disabled={activeCollab.is_locked}
          >
            ⭐ Rate {isBrand ? "Creator" : "Brand"}
          </button>

          <button
            className="btn btn-outline"
            onClick={() => setShowDisputePopup(true)}
          >
            ⚖️ Raise Dispute
          </button>

          {isBrand && (
            <button
              className="btn btn-primary"
              onClick={() => setShowWorkflowEditor(true)}
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              🏗️ Customize Workflow
            </button>
          )}
        </div>
      </div>

      {/* 2. ROLE-SPECIFIC WORKFLOW SECTION */}
      <div className="workflow-section glass">
        {!isBrand && status === "in_progress" && (
          <div className="creator-submit">
            <h3>Submit Your Deliverables</h3>
            <p>Paste the link to your final work (Google Drive, Video, etc.) below.</p>
            <input
              type="url"
              placeholder="https://link-to-your-work.com"
              value={deliverableUrl}
              onChange={(e) => setDeliverableUrl(e.target.value)}
            />
            <textarea
              placeholder="Add a note for the brand..."
              value={deliverableNote}
              onChange={(e) => setDeliverableNote(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleSubmitWork} disabled={loading}>
              {loading ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        )}

        {isBrand && status === "review" && (
          <div className="brand-review">
            <h3>Review Deliverables</h3>
            <div className="submission-data glass">
              <p><strong>Link:</strong> <a href={activeCollab.deliverable_url} target="_blank" rel="noreferrer">{activeCollab.deliverable_url}</a></p>
              <p><strong>Note:</strong> {activeCollab.deliverable_note || "No note provided."}</p>
            </div>
            <div className="approval-btns">
              <button className="btn btn-primary" onClick={handleApproveWork} disabled={loading}>
                Approve Work
              </button>
              <button className="btn btn-outline" onClick={() => navigate(`/chat/${otherUserId}`)}>
                Request Changes
              </button>
            </div>
          </div>
        )}

        {status === "review" && !isBrand && (
          <div className="status-waiting">
            <h3>Work Submitted</h3>
            <p>Waiting for the brand to review and approve your work.</p>
          </div>
        )}

        {status === "completed" && (
          <div className="status-completed">
            <h3>🎉 Collaboration Completed</h3>
            <p>This project has been successfully finalized. You can now leave a rating if you haven't already.</p>
          </div>
        )}
      </div>

      {/* ---------------- RATING POPUP ---------------- */}
      {showRatingPopup && (
        <div className="modal-overlay">
          <div className="modal glass">
            <h2>⭐ Rate Collaboration</h2>

            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={rating >= s ? "star active" : "star"}
                  onClick={() => setRating(s)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder="Write a review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <button className="btn-primary" onClick={handleSubmitReview}>
              Submit Review
            </button>
          </div>
        </div>
      )}

      {/* ---------------- DISPUTE POPUP ---------------- */}
      {showDisputePopup && (
        <div className="modal-overlay">
          <div className="modal glass">
            <h2>⚖ Raise Dispute</h2>

            <select
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            >
              <option value="">Select reason</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Quality Issue">Quality Issue</option>
              <option value="Deadline Missed">Deadline Missed</option>
              <option value="Other">Other</option>
            </select>

            <textarea
              placeholder="Describe the issue"
              value={disputeDesc}
              onChange={(e) => setDisputeDesc(e.target.value)}
            />

            <input type="file" onChange={(e) => setEvidence(e.target.files[0])} />

            <button
              className="btn-primary"
              disabled={loading}
              onClick={async () => {
                if (!disputeReason || !disputeDesc) return alert("Fill all fields");

                try {
                  setLoading(true);
                  let evidenceUrl = "";

                  // 1. Upload evidence if exists
                  if (evidence) {
                    const fileName = `${Date.now()}_${evidence.name}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                      .from("creator_showcase") // Reusing this bucket for now
                      .upload(`${user.id}/disputes/${fileName}`, evidence);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                      .from("creator_showcase")
                      .getPublicUrl(`${user.id}/disputes/${fileName}`);

                    evidenceUrl = publicUrl;
                  }

                  // 2. Create dispute record
                  const { error: disputeError } = await supabase
                    .from("disputes")
                    .insert([{
                      project_id: activeCollab.project_id,
                      raised_by_id: user.id,
                      reason: disputeReason,
                      description: disputeDesc,
                      evidence_url: evidenceUrl
                    }]);

                  if (disputeError) throw disputeError;

                  alert("Dispute raised successfully. Our team will review it.");
                  setShowDisputePopup(false);
                } catch (err) {
                  console.error("Dispute error:", err);
                  alert("Failed to raise dispute: " + err.message);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Submitting..." : "Submit Dispute"}
            </button>
          </div>
        </div>
      )}
      {/* ---------------- WORKFLOW EDITOR MODAL ---------------- */}
      {showWorkflowEditor && (
        <div className="modal-overlay">
          <WorkflowEditor
            onSave={handleSaveWorkflow}
            onClose={() => setShowWorkflowEditor(false)}
            initialData={workflowData}
          />
        </div>
      )}
    </div>
  );
}
