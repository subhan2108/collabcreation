

export default function Wallet() {
  return (
    <div className="wallet-page">
      <main className="wallet-main">
        {/* ===== BRAND WALLET ===== */}
        <section id="brand-wallet" className="wallet-section">
          <h2>💼 Brand Wallet – Add Funds</h2>

          <div className="balance glass">
            <p>Current Balance</p>
            <h3>₹25,000</h3>
          </div>

          <div className="form glass">
            <h3>Add Funds</h3>
            <input type="number" placeholder="Enter amount (₹)" />
            <select>
              <option>Select Payment Method</option>
              <option>Razorpay</option>
              <option>PayPal</option>
              <option>Stripe</option>
            </select>
            <button className="btn-primary">Add Funds</button>
          </div>

          <div className="history glass">
            <h3>Transaction History</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Oct 01 2025</td>
                  <td>Add</td>
                  <td>₹10,000</td>
                  <td className="success">Successful</td>
                </tr>
                <tr>
                  <td>Oct 03 2025</td>
                  <td>Escrow Hold</td>
                  <td>₹5,000</td>
                  <td className="pending">Pending</td>
                </tr>
                <tr>
                  <td>Oct 10 2025</td>
                  <td>Release</td>
                  <td>₹5,000</td>
                  <td className="success">Released</td>
                </tr>
                <tr>
                  <td>Oct 12 2025</td>
                  <td>Withdraw</td>
                  <td>₹2,000</td>
                  <td className="danger">Failed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== ESCROW PREVIEW ===== */}
        <section id="escrow" className="wallet-section">
          <h2>🔒 Project Escrow Preview</h2>

          <div className="escrow-card glass">
            <div>
              <h3>Tech Product Review</h3>
              <p>
                Budget: <span className="primary">₹12,000</span>
              </p>
              <p>
                Escrow Status: <span className="success">In Escrow</span>
              </p>
            </div>
            <button className="btn-primary disabled" disabled>
              Release Payment
            </button>
          </div>

          <div className="escrow-card glass">
            <div>
              <h3>Fashion Reel Campaign</h3>
              <p>
                Budget: <span className="primary">₹6,000</span>
              </p>
              <p>
                Escrow Status: 
                <span className="success">Completed – Ready to Release</span>
              </p>
            </div>
            <button className="btn-success">Release Payment</button>
          </div>
        </section>

        {/* ===== CREATOR WALLET ===== */}
        <section id="creator-wallet" className="wallet-section">
          <h2>💰 Creator Wallet – Withdraw Funds</h2>

          <div className="balance glass">
            <p>Available Balance</p>
            <h3>₹7,500</h3>
          </div>

          <div className="form glass">
            <h3>Withdraw Funds</h3>
            <input type="number" placeholder="Enter amount (₹)" />
            <select>
              <option>Select Withdrawal Method</option>
              <option>PayPal</option>
              <option>UPI</option>
              <option>Paytm</option>
              <option>Razorpay</option>
            </select>
            <button className="btn-primary">Withdraw Now</button>
          </div>

          <div className="confirm glass">
            <p>Withdrawal Request Status:</p>
            <p className="success big">✅ Successful</p>
            <p className="note">
              ₹5,000 transferred to PayPal (Transaction ID: #TXN82934)
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
