
import { useState, useEffect } from "react";

export default function Ratings() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRating, setFilterRating] = useState(0);
  const reviewsPerPage = 5;

  // Assume user ID is stored in localStorage or context
  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id || 1; // Replace with actual user ID from auth context
  const revieweeId = new URLSearchParams(window.location.search).get('user') || 2; // Get from URL param, e.g., ?user=2

  useEffect(() => {
    fetchReviews();
    fetchAverageRating();
  }, [revieweeId, currentPage, filterRating]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/reviews/?reviewee=${revieweeId}&page=${currentPage}&rating=${filterRating}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/reviews/average-rating/${revieweeId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAverageRating(data.average_rating);
        setReviewCount(data.review_count);
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewee: revieweeId,
          rating: rating,
          review_text: reviewText,
          project: null, // Optional
        }),
      });
      if (response.ok) {
        alert('Review submitted successfully!');
        setRating(0);
        setReviewText("");
        fetchReviews();
        fetchAverageRating();
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={`star ${rating >= star ? "active" : ""}`}>
        ★
      </span>
    ));
  };

  const filteredReviews = reviews.filter(review => filterRating === 0 || review.rating === filterRating);

  return (
    <div className="ratings-page">
      <main className="main">
        {/* ===== RATE & REVIEW ===== */}
        <section className="section">
          <h2>🌟 Project Completion – Rate & Review</h2>
          <div className="card glass">
            <h3>Rate Your Collaboration</h3>

            {/* Star Rating */}
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${(hover || rating) >= star ? "active" : ""}`}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder="Write your review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button className="btn-primary" onClick={submitReview} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </section>

        {/* ===== PROFILE RATINGS ===== */}
        <section className="section">
          <h2>👤 Creator Profile Ratings</h2>

          {/* Average Rating */}
          <div className="avg-rating glass">
            <div className="stars-display">{renderStars(Math.round(averageRating))}</div>
            <p>
              <strong>{averageRating.toFixed(1)} / 5.0</strong>{" "}
              <span className="sub">({reviewCount} reviews)</span>
            </p>
          </div>

          {/* Filter */}
          <div className="filter">
            <label>Filter by rating:</label>
            <select value={filterRating} onChange={(e) => setFilterRating(parseInt(e.target.value))}>
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
            {loading ? (
              <p>Loading reviews...</p>
            ) : filteredReviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              filteredReviews.map((review) => (
                <div key={review.id} className="review-card glass">
                  <div className="review-header">
                    <p className="name">{review.reviewer_name}</p>
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
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={filteredReviews.length < reviewsPerPage}
            >
              Next
            </button>
          </div>
        </section>

        {/* ===== DISPUTE MANAGEMENT ===== */}
        <section className="section">
          <h2>⚖️ Dispute Management</h2>

          <div className="form glass">
            <h3>Raise a Dispute</h3>
            <select>
              <option>Select Reason</option>
              <option>Payment Issue</option>
              <option>Work Quality</option>
              <option>Deadline Missed</option>
              <option>Other</option>
            </select>
            <textarea placeholder="Describe the issue..."></textarea>
            <input type="file" />
            <button className="btn-primary">Submit Dispute</button>
          </div>

          {/* Dispute Tickets */}
          <div className="ticket glass border-warning">
            <div className="ticket-header">
              <p>Ticket ID: #DSP-2035</p>
              <p className="status warning">Pending</p>
            </div>
            <p className="text">
              Reason: Payment not received after project completion.
            </p>
            <p className="note">
              Admin Notes: Our team is reviewing the case. Expected resolution
              in 48 hours.
            </p>
          </div>

          <div className="ticket glass border-success">
            <div className="ticket-header">
              <p>Ticket ID: #DSP-2034</p>
              <p className="status success">Resolved</p>
            </div>
            <p className="text">Reason: Deadline missed by creator.</p>
            <p className="note">
              Admin Notes: Refund processed to Brand Wallet.
            </p>
          </div>

          <div className="ticket glass border-danger">
            <div className="ticket-header">
              <p>Ticket ID: #DSP-2033</p>
              <p className="status danger">Rejected</p>
            </div>
            <p className="text">Reason: Invalid proof submission.</p>
            <p className="note">
              Admin Notes: Please provide valid evidence next time.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
