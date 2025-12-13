// src/pages/MutualPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
 
export default function MutualPage() {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCollab, setSelectedCollab] = useState(null);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [showDisputePopup, setShowDisputePopup] = useState(false);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [evidence, setEvidence] = useState(null);

  const { collabId } = useParams();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("access");
  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;

  // Fetch collaborations
  const fetchCollabs = async () => {
    try {
      const res = await fetch(`${API_BASE}/collaborations/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load collaborations");

      const data = await res.json();
      setCollabs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollabs();
  }, [API_BASE, token]);

  // Mark user active
  const activateCurrentUser = async (id) => {
    try {
      await fetch(`${API_BASE}/collaborations/${id}/activate_user/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCollabs();
    } catch (err) {
      console.error("Activation failed:", err);
    }
  };

  useEffect(() => {
    if (collabId) activateCurrentUser(collabId);
  }, [collabId]);

  // ----------------------------
  // submit review + auto-lock
  // ----------------------------
  const handleSubmitReview = async (selectedCollabObj, theRating, theReviewText) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewee: selectedCollabObj.otherUserId,
          rating: theRating,
          review_text: theReviewText,
          collaboration: selectedCollabObj.id,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(()=>null);
        console.error("Review submission failed:", errJson || res.statusText);
        alert("Failed to submit review");
        return;
      }

      alert("Review submitted!");

      // Immediately try to lock collaboration (backend must support this route)
      try {
        const lockRes = await fetch(`${API_BASE}/collaborations/${selectedCollabObj.id}/lock/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_locked: true }),
        });

        if (!lockRes.ok) {
          // not fatal — just warn
          console.warn("Could not lock collaboration automatically. Admin may lock later.");
        } else {
          // refresh UI to reflect lock
          await fetchCollabs();
        }
      } catch (err) {
        console.error("Lock call failed:", err);
      }

      // close + reset
      setShowRatingPopup(false);
      setRating(0);
      setReviewText("");
    } catch (err) {
      console.error("Review submit error:", err);
      alert("Failed to submit review (network).");
    }
  };

  if (loading) return <p>Loading collaborations...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  const filteredCollabs = collabId
    ? collabs.filter((c) => String(c.id) === String(collabId))
    : collabs;

  if (filteredCollabs.length === 0) {
    return (
      <div className="mutual-page glass">
        <h1 className="section-title">🤝 Collaborations</h1>
        <p>No collaborations found.</p>
      </div>
    );
  }

  return (
    <div className="mutual-page glass">
      <h1 className="section-title">🤝 Collaborations</h1>

      <div className="collab-list">
        {filteredCollabs.map((c) => {
          const otherUserId =
            currentUserId === c.brand?.id ? c.creator?.id : c.brand?.id;

          return (
            <div key={c.id} className="collab-card glass">
              <div className="collab-header">
                <h2>{c.project?.title || "Untitled Project"}</h2>
              </div>

              <div className="collab-body">
                <div className="collab-user">
                  <h3>👔 Brand</h3>
                  <p>{c.brand?.username}</p>
                </div>

                <div className="collab-user">
                  <h3>🎨 Creator</h3>
                  <p>{c.creator?.username}</p>
                </div>
              </div>

              <div className="collab-footer">
                {c.is_locked ? (
                  <div className="muted">
                    <p><strong>Collaboration closed (locked)</strong></p>
                    <button className="btn-outline" onClick={() => navigate(`/chat/${c.id}`)} disabled>
                      💬 Open Chat
                    </button>
                  </div>
                ) : (
                  <>
                    <button className="btn glass" onClick={() => navigate(`/chat/${c.id}`)}>💬 Open Chat</button>

                    <button
                      className="btn glass"
                      onClick={() => {
                        setSelectedCollab({ ...c, otherUserId });
                        setShowRatingPopup(true);
                      }}
                    >
                      ⭐ Rate User
                    </button>

                    <button
                      className="btn-outline glass"
                      onClick={() => {
                        setSelectedCollab(c);
                        setShowDisputePopup(true);
                      }}
                    >
                      ⚖ Raise Dispute
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --------------------------------------
          ⭐ RATING POPUP
      -------------------------------------- */}
      {showRatingPopup && selectedCollab && (
        <div className="modal-overlay">
          <div className="modal glass">
            <h2>⭐ Rate Collaboration</h2>

            <div className="stars">
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  className={`star ${rating >= star ? "active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder="Write review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <button
              className="btn-primary"
              onClick={() => handleSubmitReview(selectedCollab, rating, reviewText)}
            >
              Submit Review
            </button>

            <button
              className="btn-outline"
              onClick={() => setShowRatingPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------
          ⚖ DISPUTE POPUP
      -------------------------------------- */}
      {showDisputePopup && selectedCollab && (
        <div className="modal-overlay">
          <div className="modal glass">

            <h2>⚖ Raise a Dispute</h2>

            <select 
              value={disputeReason}
              onChange={(e)=>setDisputeReason(e.target.value)}
            >
              <option value="">Select Reason</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Work Quality">Work Quality</option>
              <option value="Deadline Missed">Deadline Missed</option>
              <option value="Other">Other</option>
            </select>

            <textarea
              placeholder="Describe the issue..."
              value={disputeDesc}
              onChange={(e)=>setDisputeDesc(e.target.value)}
            />

            <input 
              type="file"
              onChange={(e)=>setEvidence(e.target.files[0])}
            />

            <button
              className="btn-primary"
              onClick={async () => {
                if (!disputeReason || !disputeDesc)
                  return alert("Fill all fields!");

                const formData = new FormData();
                formData.append("reason", disputeReason);
                formData.append("description", disputeDesc);
                if (evidence) formData.append("evidence", evidence);

                const res = await fetch(
                  `${API_BASE}/collabs/${selectedCollab.id}/disputes/create/`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                  }
                );

                if (res.ok) {
                  alert("Dispute submitted!");
                  setShowDisputePopup(false);
                  setDisputeReason("");
                  setDisputeDesc("");
                  setEvidence(null);

                  // optionally refresh the list so admin-made actions can be seen
                  fetchCollabs();
                } else {
                  const err = await res.json().catch(()=>null);
                  console.error("Dispute error:", err || res.status);
                  alert("Failed to submit dispute");
                }
              }}
            >
              Submit Dispute
            </button>

            <button
              className="btn-outline"
              onClick={() => setShowDisputePopup(false)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
