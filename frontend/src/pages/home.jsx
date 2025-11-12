import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupModal from "../components/SignupModal";
import LoginModal from "../components/LoginModal";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const { user, guestRole, selectGuestRole } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else if (guestRole) {
      navigate(`/${guestRole === "creator" ? "creators" : "projects"}`);
    } else {
      setShowSignup(true);
    }
  };

  const handleRoleSelect = (role) => {
    selectGuestRole(role);
    navigate(`/${role === "creator" ? "creators" : "projects"}`);
    setShowSignup(false);
  };

  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section id="hero" className="hero">
        <h1>CollabCreation – Connect Brands & Creators</h1>
        <p>A new way to collaborate, grow, and get paid securely with our escrow system.</p>
        <button className="cta-btn" onClick={handleGetStarted}>Get Started Free</button>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="how">
        <h2>How it Works</h2>
        <p className="subtitle">
          Brands post projects → Creators apply → Work gets done → Payments are released safely through escrow.
        </p>
        <div className="card-grid">
          <div className="card glass"><h3>1️⃣ Post a Project</h3><p>Brands describe their campaign, deliverables & budget.</p></div>
          <div className="card glass"><h3>2️⃣ Apply as Creator</h3><p>Verified creators apply with their portfolio & pricing.</p></div>
          <div className="card glass"><h3>3️⃣ Collaborate & Earn</h3><p>Once approved, collaborate and get paid automatically on delivery.</p></div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="pricing">
        <h2>Pricing Plans</h2>
        <p className="subtitle">Free for creators under 80K followers. Unlock more with Pro plans.</p>
        <div className="card-grid">
          <div className="card glass"><h3>Starter</h3><p>Free Access</p><span className="price">₹0</span></div>
          <div className="card glass highlight"><h3>Pro Creator</h3><p>Access to brands &gt; 80K followers</p><span className="price">₹199 / creator</span></div>
          <div className="card glass"><h3>Brand Plus</h3><p>Unlimited access + premium support</p><span className="price">₹999 / month</span></div>
        </div>
      </section>

      {/* POPUPS */}
      {showSignup && (
        <SignupModal onClose={() => setShowSignup(false)} onSelectRole={handleRoleSelect} />
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
