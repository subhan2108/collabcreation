import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function MutualPage() {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [chatDisabled, setChatDisabled] = useState(false);

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

  // --------------------------------------------------
  // FETCH COLLABORATIONS
  // --------------------------------------------------
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
  }, []);

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
    if (!activeCollab?.project?.deadline) return;

    const deadline = new Date(activeCollab.project.deadline + "T23:59:59");

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

    try {
      const res = await fetch(`${API_BASE}/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewee:
            currentUserId === activeCollab.brand.id
              ? activeCollab.creator.id
              : activeCollab.brand.id,
          rating,
          review_text: reviewText,
          project: activeCollab.project.id,
        }),
      });

      if (!res.ok) throw new Error("Review failed");

      // lock collaboration
      await fetch(`${API_BASE}/collaborations/${activeCollab.id}/lock/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_locked: true }),
      });

      alert("Review submitted!");
      setShowRatingPopup(false);
      fetchCollabs();
    } catch (err) {
      alert("Failed to submit review");
    }
  };

  // --------------------------------------------------
  // LOADING / ERROR
  // --------------------------------------------------
  if (loading) return <p>Loading collaboration...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!activeCollab) return <p>No collaboration found.</p>;

  const otherUserId =
    currentUserId === activeCollab.brand.id
      ? activeCollab.creator.id
      : activeCollab.brand.id;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="mutual-page glass">
      <h1 className="section-title">🤝 Collaboration</h1>

      <div className={`deadline-timer ${isExpired ? "expired" : ""}`}>
        {isExpired ? "⛔ Deadline Ended" : `⏳ Time Left: ${timeLeft}`}
      </div>

      <div className="collab-card glass">
        <h2>{activeCollab.project.title}</h2>

        <p>👔 Brand: {activeCollab.brand.username}</p>
        <p>🎨 Creator: {activeCollab.creator.username}</p>

        <div className="collab-actions">
          <button
            className="btn glass"
            onClick={() => navigate(`/chat/${otherUserId}`)}
            disabled={chatDisabled || activeCollab.is_locked}
          >
            💬 Open Chat
          </button>

          <button
            className="btn glass"
            onClick={() => setShowRatingPopup(true)}
          >
            ⭐ Rate User
          </button>

          <button
            className="btn-outline"
            onClick={() => setShowDisputePopup(true)}
          >
            ⚖ Raise Dispute
          </button>
        </div>
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
              onClick={async () => {
                if (!disputeReason || !disputeDesc)
                  return alert("Fill all fields");

                const fd = new FormData();
                fd.append("reason", disputeReason);
                fd.append("description", disputeDesc);
                if (evidence) fd.append("evidence", evidence);

                await fetch(
                  `${API_BASE}/collabs/${activeCollab.id}/disputes/create/`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    body: fd,
                  }
                );

                alert("Dispute submitted");
                setShowDisputePopup(false);
              }}
            >
              Submit Dispute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
