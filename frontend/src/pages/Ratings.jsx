
import { useState } from "react";

export default function Ratings() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

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
                  className={`star ${
                    (hover || rating) >= star ? "active" : ""
                  }`}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea placeholder="Write your review..."></textarea>
            <button className="btn-primary">Submit Review</button>
          </div>
        </section>

        {/* ===== PROFILE RATINGS ===== */}
        <section className="section">
          <h2>👤 Creator Profile Ratings</h2>

          {/* Average Rating */}
          <div className="avg-rating glass">
            <div className="stars-display">★★★★☆</div>
            <p>
              <strong>4.0 / 5.0</strong>{" "}
              <span className="sub">(25 reviews)</span>
            </p>
          </div>

          {/* Review List */}
          <div className="reviews">
            <div className="review-card glass">
              <div className="review-header">
                <p className="name">John Doe</p>
                <p className="date">Oct 03, 2025</p>
              </div>
              <div className="stars-small">★★★★☆</div>
              <p className="text">
                Great experience! The creator was professional and delivered on
                time.
              </p>
            </div>

            <div className="review-card glass">
              <div className="review-header">
                <p className="name">Sara Khan</p>
                <p className="date">Oct 10, 2025</p>
              </div>
              <div className="stars-small">★★★★★</div>
              <p className="text">
                Fantastic collaboration! The content exceeded expectations.
              </p>
            </div>

            <div className="review-card glass">
              <div className="review-header">
                <p className="name">Techify Brand</p>
                <p className="date">Oct 15, 2025</p>
              </div>
              <div className="stars-small">★★★☆☆</div>
              <p className="text">
                Good work overall, but delivery was slightly delayed.
              </p>
            </div>
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
