import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SignupModal from "../components/SignupModal";
import LoginModal from "../components/LoginModal";
import { useAuth } from "../context/AuthContext";




export default function Home() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const { user, guestRole, selectGuestRole } = useAuth();

  const CheckCircleIcon = ({ className = "", style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ShieldIcon = ({ className = "", style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const WalletIcon = ({ className = "", style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const MessageCircleIcon = ({ className = "", style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const UsersIcon = ({ className = "", style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const GlobeIcon = ({ className = "", style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const TrendingUpIcon = ({ className = "", style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const DollarSignIcon = ({ className = "", style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const BriefcaseIcon = ({ className = "", style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const StarIcon = ({ className = "", style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ZapIcon = ({ className = "", style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

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
{/* ========== HERO SECTION ========== */}
      <section className="hero-section">
        <div className="hero-bg-elements">
          <div className="hero-bg-circle hero-bg-circle-1 animate-float" />
          <div className="hero-bg-circle hero-bg-circle-2 animate-float" />
          <div className="hero-bg-circle hero-bg-circle-3 animate-float" />
        </div>

        <div className="container hero-content">
          <div className="hero-grid">
            <div className="hero-text animate-fade-up">
              <div className="trust-badge">
                <CheckCircleIcon className="icon-sm" />
                Trusted by 10,000+ creators and brands
              </div>

              <h1 className="hero-title">
                Collaborate. Create.
                <span className="text-gradient"> Get Paid – Securely.</span>
              </h1>

              <p className="hero-description">
                A platform where brands & content creators collaborate safely, transparently, and effectively with escrow payments and KYC verification.
              </p>

              <div className="hero-buttons">
                <button
  className="btn btn-primary btn-lg"
  onClick={handleGetStarted}
>
  Get Started
</button>

                
              </div>

              <div className="hero-trust-indicators">
                <div className="trust-indicator">
                  <ShieldIcon className="icon-md" />
                  <span>Escrow Protected</span>
                </div>
                <div className="trust-indicator">
                  <CheckCircleIcon className="icon-md" />
                  <span>KYC Verified</span>
                </div>
                <div className="trust-indicator">
                  <WalletIcon className="icon-md" />
                  <span>7% Commission</span>
                </div>
              </div>
            </div>

            <div className="hero-image-container animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="card hero-image-card">
                <img src={"https://i.postimg.cc/85jpTxTf/cc.png"} alt="Brands and creators collaborating securely" className="hero-image" />
                <div className="floating-badge floating-badge-top">
                  <CheckCircleIcon className="icon-sm" />
                  <span>Payment Secured</span>
                </div>
                <div className="floating-badge floating-badge-bottom">
                  <MessageCircleIcon className="icon-sm" />
                  <span>Direct Communication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      

      {/* ========== DASHBOARD SECTION ========== */}
      <section className="dashboard-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Your Command Center</h2>
            <p className="section-description">
              Powerful dashboards designed for creators and brands to manage projects, payments, and collaborations seamlessly.
            </p>
          </div>

          <div className="dashboard-grid">
            {/* Creator Dashboard */}
            <div className="dashboard-column">
              <h3>Creator Dashboard</h3>

              <div id="card">
                <div className="card-header">
                  <div className="card-title">
                    <WalletIcon className="icon-md" style={{ color: "var(--primary)" }} />
                    My Wallet
                    <div className="trust-badge ml-auto">
                      <CheckCircleIcon className="icon-sm" />
                      Verified
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  <div className="wallet-balance">
                    <div>
                      <div className="wallet-main-balance">$4,250.00</div>
                      <div className="wallet-label">Available Balance</div>
                    </div>
                    <div className="text-right">
                      <div className="wallet-pending">$850.00</div>
                      <div className="wallet-label">Pending</div>
                    </div>
                  </div>
                  <div className="button-group" style={{ marginTop: "1rem" }}>
                    <button className="btn btn-primary btn-sm">Withdraw</button>
                    <button className="btn btn-outline btn-sm" style={{ color: "var(--foreground)", borderColor: "var(--border)" }}>USD/INR</button>
                  </div>
                </div>
              </div>

              <div id="card">
                <div className="card-header">
                  <div className="card-title">
                    <BriefcaseIcon className="icon-md" style={{ color: "var(--primary)" }} />
                    Active Projects
                  </div>
                </div>
                <div className="card-content">
                  <div className="project-item">
                    <div className="project-info">
                      <p>Instagram Reel Campaign</p>
                      <span>TechCorp Inc.</span>
                    </div>
                    <div className="project-meta">
                      <span className="badge">In Progress</span>
                      <div className="project-price">$500</div>
                    </div>
                  </div>
                  <div className="project-item" style={{ marginTop: "0.75rem" }}>
                    <div className="project-info">
                      <p>Product Review Video</p>
                      <span>Fashion Brand</span>
                    </div>
                    <div className="project-meta">
                      <span className="badge badge-trust">Ready for Review</span>
                      <div className="project-price">$750</div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="card">
                <div className="card-header">
                  <div className="card-title">
                    <MessageCircleIcon className="icon-md" style={{ color: "var(--primary)" }} />
                    Messages
                  </div>
                </div>
                <div className="card-content">
                  <div className="message-item">
                    <div className="message-avatar">TC</div>
                    <div className="message-content">
                      <p>TechCorp Inc.</p>
                      <span>Can we discuss the timeline?</span>
                    </div>
                    <div className="message-indicator" />
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Dashboard */}
            <div className="dashboard-column">
              <h3>Brand Dashboard</h3>

              <div id="card">
                <div className="card-header">
                  <div className="card-title">
                    <TrendingUpIcon className="icon-md" style={{ color: "var(--primary)" }} />
                    Campaign Overview
                    <div className="trust-badge ml-auto">
                      <CheckCircleIcon className="icon-sm" />
                      Verified
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  <div className="campaign-stats">
                    <div>
                      <div className="campaign-stat-value campaign-stat-value-primary">12</div>
                      <div className="campaign-stat-label">Active</div>
                    </div>
                    <div>
                      <div className="campaign-stat-value campaign-stat-value-trust">8</div>
                      <div className="campaign-stat-label">Completed</div>
                    </div>
                    <div>
                      <div className="campaign-stat-value">3</div>
                      <div className="campaign-stat-label">Draft</div>
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>Post New Project</button>
                </div>
              </div>

              <div id="card">
                <div className="card-header">
                  <div className="card-title">
                    <DollarSignIcon className="icon-md" style={{ color: "var(--primary)" }} />
                    Escrow Balance
                  </div>
                </div>
                <div className="card-content">
                  <div className="escrow-amount">$15,750.00</div>
                  <div className="wallet-label">Funds held in escrow</div>
                  <div className="escrow-details" style={{ marginTop: "1rem" }}>
                    <div className="escrow-row">
                      <span>Auto-deducted today:</span>
                      <span>$2,500.00</span>
                    </div>
                    <div className="escrow-row">
                      <span>Pending release:</span>
                      <span style={{ color: "var(--trust)" }}>$1,250.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <div id="card">
                <div className="card-header">
                  <div className="card-title">
                    <UsersIcon className="icon-md" style={{ color: "var(--primary)" }} />
                    Creator Applications
                  </div>
                </div>
                <div className="card-content">
                  <div className="creator-item">
                    <div className="creator-info">
                      <div className="creator-avatar">JS</div>
                      <div>
                        <div className="creator-name">John Smith</div>
                        <div className="creator-stats">
                          <StarIcon className="icon-sm star-icon" />
                          <span>4.9 • 2.3M followers</span>
                        </div>
                      </div>
                    </div>
                    <div className="button-group gap-1">
                      <button className="btn btn-trust btn-sm">Accept</button>
                      <button className="btn btn-outline btn-sm" style={{ color: "var(--foreground)", borderColor: "var(--border)" }}>View</button>
                    </div>
                  </div>
                  <div className="creator-item" style={{ marginTop: "0.75rem" }}>
                    <div className="creator-info">
                      <div className="creator-avatar">SD</div>
                      <div>
                        <div className="creator-name">Sarah Davis</div>
                        <div className="creator-stats">
                          <StarIcon className="icon-sm star-icon" />
                          <span>4.8 • 890K followers</span>
                        </div>
                      </div>
                    </div>
                    <div className="button-group gap-1">
                      <button className="btn btn-trust btn-sm">Accept</button>
                      <button className="btn btn-outline btn-sm" style={{ color: "var(--foreground)", borderColor: "var(--border)" }}>View</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-footer">
            <p>Experience the full power of our platform after registration</p>
            <div className="button-group">
              <button className="btn btn-primary btn-lg">Get Started as Creator</button>
              <button className="btn btn-outline btn-lg" style={{ color: "var(--foreground)", borderColor: "var(--border)" }}>Get Started as Brand</button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CONCLUSION SECTION ========== */}
      <section className="conclusion-section">
        <div className="hero-bg-elements">
          <div className="hero-bg-circle hero-bg-circle-1 animate-float" />
          <div className="hero-bg-circle hero-bg-circle-2 animate-float" />
          <div className="hero-bg-circle hero-bg-circle-3 animate-float" />
        </div>

        <div className="container conclusion-content">
          <h2 className="conclusion-title">
            The Future of
            <span className="text-gradient"> Collaboration is Here</span>
          </h2>
          <p className="conclusion-description">
            A verified way for brands to hire creators—securely, transparently, and fast. Join the revolution that's transforming the creator economy.
          </p>

          <div className="conclusion-features">
            <div className="card conclusion-feature-card">
              <ShieldIcon className="icon-lg" />
              <h3>Escrow</h3>
              <p>100% secure payments</p>
            </div>
            <div className="card conclusion-feature-card">
              <CheckCircleIcon className="icon-lg" />
              <h3>KYC</h3>
              <p>Verified users only</p>
            </div>
            <div className="card conclusion-feature-card">
              <ZapIcon className="icon-lg" />
              <h3>7%</h3>
              <p>Low commission</p>
            </div>
            <div className="card conclusion-feature-card">
              <GlobeIcon className="icon-lg" />
              <h3>Global</h3>
              <p>Worldwide reach</p>
            </div>
          </div>

          <div className="value-propositions">
            <div className="value-prop">
              <div className="value-prop-icon">
                <CheckCircleIcon className="icon-lg" />
              </div>
              <h3>For Creators</h3>
              <p>Get paid guaranteed with our escrow system. Work with verified brands and showcase your portfolio to millions of potential clients.</p>
            </div>
            <div className="value-prop">
              <div className="value-prop-icon">
                <ShieldIcon className="icon-lg" />
              </div>
              <h3>For Brands</h3>
              <p>Eliminate fake sponsorships and fraud. Work only with KYC verified creators and pay only after successful delivery.</p>
            </div>
            <div className="value-prop">
              <div className="value-prop-icon">
                <GlobeIcon className="icon-lg" />
              </div>
              <h3>For Everyone</h3>
              <p>Built-in communication tools, multi-currency support, and a transparent platform that puts trust first.</p>
            </div>
          </div>

          <div className="cta-section">
            <h3>Ready to Transform Your Business?</h3>
            <p>Join thousands of creators and brands already collaborating securely on our platform.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg">Start as Creator</button>
              <button className="btn btn-outline btn-lg">Start as Brand</button>
            </div>
            <div className="cta-trust-indicators">
              <div>
                <CheckCircleIcon className="icon-sm" />
                <span>Free to join</span>
              </div>
              <div>
                <CheckCircleIcon className="icon-sm" />
                <span>No hidden fees</span>
              </div>
              <div>
                <CheckCircleIcon className="icon-sm" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>

          <div className="tagline">
            <p>"Escrow + KYC + 7% commission = The future of collaboration"</p>
          </div>
        </div>
      </section>
    

      {/* ===== MODALS ===== */}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSelectRole={handleRoleSelect}
        />
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
