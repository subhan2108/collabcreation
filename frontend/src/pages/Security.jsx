export default function Security() {
  return (
    <div className="security-page">
      <main className="main">
        {/* ===== BRAND MONETIZATION ===== */}
        <section id="monetization" className="section">
          <h2>💼 Brand Monetization – Plans & Unlocks</h2>
          <p className="subtext">
            Choose a plan that fits your brand. Unlock creators based on your
            campaign scale and audience goals.
          </p>

          <div className="pricing-grid">
            {/* Free Plan */}
            <div className="plan glass">
              <h3>Free Access</h3>
              <p className="desc">
                View and collaborate with creators having ≤80K followers.
              </p>
              <ul>
                <li>✅ Access to verified creators</li>
                <li>✅ Basic analytics view</li>
                <li>✅ 0% monthly fees</li>
                <li>🚫 No access to less than 80K creators</li>
              </ul>
              <button className="btn-dark">Current Plan</button>
            </div>

            {/* Paid Plan */}
            <div className="plan glass highlight">
              <span className="badge">Recommended</span>
              <h3 className="primary">Paid Access</h3>
              <p className="desc">
                Unlock premium creators with &gt;80K followers.
              </p>
              <ul>
                <li>✅ Access to all creators</li>
                <li>✅ Priority campaign support</li>
                <li>✅ Advanced insights & reports</li>
                <li>✅ Secure Escrow transactions</li>
              </ul>
              <p className="price">₹199 / creator OR ₹999 / month (unlimited)</p>
              <button className="btn-primary">Subscribe Now</button>
            </div>
          </div>
        </section>

        {/* ===== SECURITY & VERIFICATION ===== */}
        <section id="security" className="section">
          <h2>🔒 Security & Verification</h2>

          {/* Profile Verification */}
          <div className="verify-card glass">
            <h3>Profile Verification</h3>
            <div className="status success">
              ✅ <span>KYC Verified</span>
            </div>
            <p>Your profile is successfully verified and eligible for premium access.</p>
          </div>

          {/* Alternate Cards */}
          <div className="status-grid">
            <div className="status-card glass">
              <p className="warning">⏳ KYC Pending</p>
              <p>Your verification documents are under review.</p>
            </div>
            <div className="status-card glass">
              <p className="success">✅ KYC Verified</p>
              <p>Your documents have been successfully verified.</p>
            </div>
            <div className="status-card glass">
              <p className="danger">❌ KYC Rejected</p>
              <p>Verification failed. Please upload valid identification.</p>
            </div>
          </div>

          {/* Security Info */}
          <div className="info glass border-success">
            <h3 className="success">Security Information</h3>
            <ul>
              <li>🛡️ All KYC documents are encrypted & stored securely.</li>
              <li>💰 Payments are held in Escrow until both parties approve.</li>
              <li>📊 Every transaction is audit-ready for full transparency.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
