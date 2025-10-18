import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        {/* LOGO */}
        <Link to="/" className="logo">
          Collab<span>Creation</span>
        </Link>

        {/* DESKTOP LINKS */}
        <ul className="nav-links">
          <li><Link className={pathname === "/" ? "active" : ""} to="/">Home</Link></li>
          <li><Link className={pathname === "/onboarding" ? "active" : ""} to="/onboarding">Onboarding</Link></li>
          <li><Link className={pathname === "/dashboard" ? "active" : ""} to="/dashboard">Dashboard</Link></li>
          <li><Link className={pathname === "/chat" ? "active" : ""} to="/chat">Chat</Link></li>
          <li><Link className={pathname === "/wallet" ? "active" : ""} to="/wallet">Wallet</Link></li>
          <li><Link className={pathname === "/ratings" ? "active" : ""} to="/ratings">Ratings</Link></li>
          <li><Link className={pathname === "/security" ? "active" : ""} to="/security">Security</Link></li>
          
          </ul>

        {/* HAMBURGER ICON */}
        <div
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <ul>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/onboarding" onClick={() => setMenuOpen(false)}>Onboarding</Link></li>
          <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
          <li><Link to="/chat" onClick={() => setMenuOpen(false)}>Chat</Link></li>
          <li><Link to="/wallet" onClick={() => setMenuOpen(false)}>Wallet</Link></li>
          <li><Link to="/ratings" onClick={() => setMenuOpen(false)}>Ratings</Link></li>
          <li><Link to="/security" onClick={() => setMenuOpen(false)}>Security</Link></li>
        </ul>
      </div>
    </nav>
  );
}
