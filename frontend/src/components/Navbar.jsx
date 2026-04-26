import { Link } from 'react-router-dom';
import { LayoutDashboard, Wallet, Briefcase, User, LogOut } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="glass" style={{ margin: '20px', padding: '12px 24px', position: 'sticky', top: '20px', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 800, textDecoration: 'none', color: 'white', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        CollabCreation
      </Link>
      
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <Link to="/projects" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <Briefcase size={18} /> Projects
        </Link>
        <Link to="/dashboard" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/wallet" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <Wallet size={18} /> Wallet
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/profile" className="btn btn-glass">
          <User size={18} /> Profile
        </Link>
        <button className="btn btn-primary">Get Started</button>
      </div>
    </nav>
  );
}
