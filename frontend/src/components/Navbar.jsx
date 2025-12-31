import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";


export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout, isGuest, continueAsGuest } = useAuth() || {};

  const handleGuestClick = () => {
    continueAsGuest();
    navigate("/guest");
    setMenuOpen(false);
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-container">

        {/* LOGO */}
        <Link to="/" className="logo">
          Collab<span>Creation</span>
        </Link>

        {/* DESKTOP NAV */}
        <ul className="nav-links">
          {[
            { to: "/", label: "Home" },
            { to: "/onboarding", label: "Onboarding" },
            { to: "/dashboard", label: "Dashboard" },
            { to: "/chat", label: "Chat" },
            { to: "/wallet", label: "Wallet" },
            { to: "/ratings", label: "Ratings" },
            { to: "/security", label: "Security" },
          ].map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={pathname === to ? "active" : ""}
              >
                {label}
              </Link>
            </li>
          ))}

          {/* AUTH SECTION */}
          {user ? (
            <>
              <li>
                <span className="nav-user">👤 {user.username}</span>
              </li>
              <li>
                <button onClick={logout} className="signup-btn">
                  Logout
                </button>
              </li>
            </>
          ) : isGuest ? (
            <li>
              <span className="guest-label">Guest Mode</span>
            </li>
          ) : (
            <li>
              <button onClick={handleGuestClick} className="signup-btn">
                Continue as Guest
              </button>
            </li>
          )}
        </ul>

        {/* HAMBURGER */}
        <div
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <ul>
          {[
            { to: "/", label: "Home" },
            { to: "/onboarding", label: "Onboarding" },
            { to: "/dashboard", label: "Dashboard" },
            { to: "/chat", label: "Chat" },
            { to: "/wallet", label: "Wallet" },
            { to: "/ratings", label: "Ratings" },
            { to: "/security", label: "Security" },
          ].map(({ to, label }) => (
            <li key={to}>
              <Link to={to} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            </li>
          ))}

          <li style={{ marginTop: "20px" }}>
            {user ? (
              <>
                <span style={{ color: "#aaa" }}>👤 {user.username}</span>
                <button
                  onClick={logout}
                  className="signup-btn"
                  style={{ marginTop: "12px" }}
                >
                  Logout
                </button>
              </>
            ) : isGuest ? (
              <span style={{ color: "#aaa" }}>Guest Mode</span>
            ) : (
              <button onClick={handleGuestClick} className="signup-btn">
                Continue as Guest
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
