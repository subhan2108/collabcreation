import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupModal from "../components/SignupModal";
import LoginModal from "../components/LoginModal";

export default function Home() {

  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === "creator") navigate("/onboarding?role=creator");
    else navigate("/onboarding?role=brand");
  };

  return (
    <div className="home">
     

      {/* ===== HERO ===== */}
      <section id="hero" className="hero">
        <h1>CollabCreation – Connect Brands & Creators</h1>
        <p>
          A new way to collaborate, grow, and get paid securely with our escrow system.
        </p>
        <a href="#signup" className="cta-btn" onClick={() => setShowSignup(true)}>Get Started Free</a>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="how">
        <h2>How it Works</h2>
        <p className="subtitle">
          Brands post projects → Creators apply → Work gets done → Payments are released safely through escrow.
        </p>
        <div className="card-grid">
          <div className="card glass">
            <h3>1️⃣ Post a Project</h3>
            <p>Brands describe their campaign, deliverables & budget.</p>
          </div>
          <div className="card glass">
            <h3>2️⃣ Apply as Creator</h3>
            <p>Verified creators apply with their portfolio & pricing.</p>
          </div>
          <div className="card glass">
            <h3>3️⃣ Collaborate & Earn</h3>
            <p>Once approved, collaborate and get paid automatically on delivery.</p>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="pricing">
        <h2>Pricing Plans</h2>
        <p className="subtitle">
          Free for creators under 80K followers. Unlock more with Pro plans.
        </p>
        <div className="card-grid">
          <div className="card glass">
            <h3>Starter</h3>
            <p>Free Access</p>
            <span className="price">₹0</span>
          </div>
          <div className="card glass highlight">
            <h3>Pro Creator</h3>
            <p>Access to brands &gt; 80K followers</p>
            <span className="price">₹199 / creator</span>
          </div>
          <div className="card glass">
            <h3>Brand Plus</h3>
            <p>Unlimited access + premium support</p>
            <span className="price">₹999 / month</span>
          </div>
        </div>
      </section>

      {/* POPUPS */}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSelectRole={handleRoleSelect}
        />
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>

      /* ===== LOGIN ===== 
      <section id="login" className="login glass">
        <h2>Login</h2>
        <form>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">Sign In</button>
        </form>
      </section>*/

      /* ===== SIGNUP ===== 
      <section id="signup" className="signup glass">
        <h2>Sign Up Free</h2>
        <p>Join as a Brand or Creator and start collaborating today.</p>
        <form>
          <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Email" />
          <select>
            <option>I'm a Creator</option>
            <option>I'm a Brand</option>
          </select>
          <button type="submit">Create Account</button>
        </form>
      </section>

     
    </div>*/
  );
}
