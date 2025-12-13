import { useEffect, useState } from "react";

export default function Ratings() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access"); // <- consistent token key
  const me = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  // UI state
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [filterRating, setFilterRating] = useState(0);
  const reviewsPerPage = 5;

  // Dispute state
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [loadingDisputes, setLoadingDisputes] = useState(false);

  // Params from URL: ?user=123 (reviewee user id) and/or ?collab=456 (collaboration id)
  const params = new URLSearchParams(window.location.search);
  const paramUserId = params.get("user");
  const paramCollabId = params.get("collab");

  const [collabId, setCollabId] = useState(paramCollabId || null);
  const [revieweeId, setRevieweeId] = useState(paramUserId || null); // the user being reviewed (creator/brand)
  const [error, setError] = useState(null);

  // If revieweeId missing but collabId present, fetch collaboration to derive participants
  useEffect(() => {
    const deriveRevieweeFromCollab = async () => {
      if (!collabId || revieweeId) return;

      if (!token) {
        console.warn("No auth token found while deriving reviewee from collab");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/collabs/${collabId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.warn("Could not fetch collaboration to derive reviewee", res.status);
          return;
        }

        const c = await res.json();
        // c.brand and c.creator expected based on your backend
        // Determine the other user (the reviewee) — choose the participant that's NOT current user
        if (!me) {
          // if we don't know current user, default to creator if present
          setRevieweeId(c.creator?.id || c.brand?.id || null);
        } else {
          const myId = me.id;
          if (String(c.brand?.id) === String(myId)) setRevieweeId(c.creator?.id || null);
          else setRevieweeId(c.brand?.id || c.creator?.id || null);
        }
      } catch (err) {
        console.error("Error deriving reviewee from collab:", err);
      }
    };

    deriveRevieweeFromCollab();
  }, [collabId, revieweeId, API_BASE, token, me]);

  // Fetch reviews & average rating
  useEffect(() => {
    if (!revieweeId) return;
    fetchReviews();
    fetchAverageRating();
    // eslint-disable-next-line
  }, [revieweeId, currentPage, filterRating]);

  const fetchReviews = async () => {
    if (!revieweeId) return;
    setLoadingReviews(true);
    try {
      const res = await fetch(
        `${API_BASE}/reviews/?reviewee=${revieweeId}&page=${currentPage}&rating=${filterRating}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch reviews", res.status);
        setReviews([]);
        return;
      }

      const data = await res.json();
      // data may be paginated (results) or array
      setReviews(data.results || data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchAverageRating = async () => {
    if (!revieweeId) return;
    try {
      const res = await fetch(`${API_BASE}/reviews/average-rating/${revieweeId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.warn("Average rating fetch returned", res.status);
        setAverageRating(0);
        setReviewCount(0);
        return;
      }

      const data = await res.json();
      setAverageRating(Number(data.average_rating || 0));
      setReviewCount(Number(data.review_count || 0));
    } catch (err) {
      console.error("Error fetching average rating:", err);
      setAverageRating(0);
      setReviewCount(0);
    }
  };

  // Submit a review
  const submitReview = async () => {
    if (!revieweeId) {
      alert("Missing reviewee ID. You must open this page from a collaboration or profile link.");
      return;
    }
    if (!rating) {
      alert("Please select a rating first.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/reviews/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewee: revieweeId,
          rating,
          review_text: reviewText,
          project: collabId || null, // optional
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Review submit failed", res.status, txt);
        alert("Failed to submit review.");
        return;
      }

      alert("Review submitted!");
      setRating(0);
      setReviewText("");
      // refresh
      fetchReviews();
      fetchAverageRating();
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Network error while submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ------- DISPUTES --------
  // Fetch disputes for collaboration
  useEffect(() => {
    if (!collabId) return;
    fetchDisputes();
    // eslint-disable-next-line
  }, [collabId]);

  const fetchDisputes = async () => {
    if (!collabId) return;
    setLoadingDisputes(true);
    try {
      const res = await fetch(`${API_BASE}/collabs/${collabId}/disputes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch disputes", res.status);
        setDisputes([]);
        return;
      }

      const data = await res.json();
      setDisputes(data);
    } catch (err) {
      console.error("Error loading disputes:", err);
      setDisputes([]);
    } finally {
      setLoadingDisputes(false);
    }
  };

  const submitDispute = async () => {
    if (!collabId) {
      alert("Missing collaboration id. Cannot submit dispute.");
      return;
    }
    if (!disputeReason || !disputeDesc) {
      alert("Please fill reason and description.");
      return;
    }

    setSubmittingDispute(true);
    const formData = new FormData();
    formData.append("reason", disputeReason);
    formData.append("description", disputeDesc);
    if (evidenceFile) formData.append("evidence", evidenceFile);

    try {
      const res = await fetch(`${API_BASE}/collabs/${collabId}/disputes/create/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // DO NOT set Content-Type with FormData
        },
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Dispute submit failed", res.status, txt);
        alert("Failed to submit dispute.");
        return;
      }

      alert("Dispute submitted!");
      setDisputeReason("");
      setDisputeDesc("");
      setEvidenceFile(null);
      fetchDisputes();
    } catch (err) {
      console.error("Error submitting dispute:", err);
      alert("Network error while submitting dispute.");
    } finally {
      setSubmittingDispute(false);
    }
  };

  // Helpers
  const renderStars = (r) =>
    [1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={`star ${r >= s ? "active" : ""}`}>
        ★
      </span>
    ));

  const filteredReviews = reviews.filter((rev) => filterRating === 0 || rev.rating === filterRating);

  return (
    <div className="ratings-page">
      <main className="main">
        {/* ===== RATE & REVIEW ===== */}
        <section className="section">
          <h2>🌟 Project Completion – Rate & Review</h2>
          <div className="card glass">
            <h3>Rate Your Collaboration</h3>

            {/* Star Rating */}
            <div className="stars" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${(hover || rating) >= star ? "active" : ""}`}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              placeholder="Write your review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <div style={{ marginTop: 8 }}>
              <button className="btn-primary" onClick={submitReview} disabled={submittingReview}>
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </section>

        {/* ===== PROFILE RATINGS ===== */}
        <section className="section">
          <h2>👤 Creator Profile Ratings</h2>

          {/* Average Rating */}
          <div className="avg-rating glass">
            <div className="stars-display">{renderStars(Math.round(averageRating || 0))}</div>
            <p>
              <strong>{(averageRating || 0).toFixed(1)} / 5.0</strong>{" "}
              <span className="sub">({reviewCount || 0} reviews)</span>
            </p>
          </div>

          {/* Filter */}
          <div className="filter">
            <label>Filter by rating:</label>
            <select value={filterRating} onChange={(e) => setFilterRating(parseInt(e.target.value || "0"))}>
              <option value={0}>All</option>
              <option value={5}>5 stars</option>
              <option value={4}>4 stars</option>
              <option value={3}>3 stars</option>
              <option value={2}>2 stars</option>
              <option value={1}>1 star</option>
            </select>
          </div>

          {/* Review List */}
          <div className="reviews">
            {loadingReviews ? (
              <p>Loading reviews...</p>
            ) : filteredReviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              filteredReviews.map((review) => (
                <div key={review.id} className="review-card glass">
                  <div className="review-header">
                    <p className="name">{review.reviewer_name || review.reviewer?.username || "Anonymous"}</p>
                    <p className="date">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="stars-small">{renderStars(review.rating)}</div>
                  <p className="text">{review.review_text}</p>
                  {review.project_title && <p className="project">Project: {review.project_title}</p>}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Previous
            </button>
            <span style={{ margin: "0 8px" }}>Page {currentPage}</span>
            <button onClick={() => setCurrentPage((p) => p + 1)} disabled={reviews.length < reviewsPerPage}>
              Next
            </button>
          </div>
        </section>

        {/* ===== DISPUTE MANAGEMENT ===== */}
        <section className="section">
          <h2>⚖️ Dispute Management</h2>

          <div className="form glass">
            <h3>Raise a Dispute</h3>

            <select value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}>
              <option value="">Select Reason</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Work Quality">Work Quality</option>
              <option value="Deadline Missed">Deadline Missed</option>
              <option value="Other">Other</option>
            </select>

            <textarea placeholder="Describe the issue..." value={disputeDesc} onChange={(e) => setDisputeDesc(e.target.value)} />

            <input type="file" onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)} />

            <div style={{ marginTop: 8 }}>
              <button className="btn-primary" onClick={submitDispute} disabled={submittingDispute}>
                {submittingDispute ? "Submitting..." : "Submit Dispute"}
              </button>
            </div>
          </div>

          {/* Dispute Tickets */}
          <div style={{ marginTop: 12 }}>
            {loadingDisputes ? (
              <p>Loading disputes...</p>
            ) : disputes.length === 0 ? (
              <p>No dispute tickets found for this collaboration.</p>
            ) : (
              disputes.map((ticket) => (
                <div key={ticket.id} className={`ticket glass ${ticket.status}`}>
                  <div className="ticket-header" style={{ display: "flex", justifyContent: "space-between" }}>
                    <p>Ticket ID: #{ticket.id}</p>
                    <p className={`status ${ticket.status}`}>{ticket.status}</p>
                  </div>

                  <p className="text">Reason: {ticket.reason}</p>
                  <p className="note">{ticket.admin_notes ? `Admin Notes: ${ticket.admin_notes}` : "No admin notes yet"}</p>

                  {ticket.evidence ? (
                    <p>
                      Evidence:{" "}
                      <a href={ticket.evidence} target="_blank" rel="noreferrer">
                        View File
                      </a>
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}
