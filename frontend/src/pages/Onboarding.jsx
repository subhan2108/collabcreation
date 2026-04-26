import { motion } from 'framer-motion';
import { User, Briefcase, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const handleComplete = () => {
    // In a real app, this would save the role to Supabase
    navigate('/dashboard');
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass" 
        style={{ width: '100%', maxWidth: '600px', padding: '60px', textAlign: 'center' }}
      >
        <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Choose your path on CollabCreation</p>

        <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
          <button 
            onClick={() => setRole('creator')}
            className={`glass ${role === 'creator' ? 'active-role' : ''}`}
            style={{ 
              padding: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '24px', 
              textAlign: 'left',
              cursor: 'pointer',
              border: role === 'creator' ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
              <User size={32} color="#6366f1" />
            </div>
            <div>
              <h3 style={{ marginBottom: '4px' }}>I'm a Creator</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>I want to find brands and collaborate on projects.</p>
            </div>
          </button>

          <button 
            onClick={() => setRole('brand')}
            className={`glass ${role === 'brand' ? 'active-role' : ''}`}
            style={{ 
              padding: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '24px', 
              textAlign: 'left',
              cursor: 'pointer',
              border: role === 'brand' ? '2px solid var(--secondary)' : '1px solid var(--glass-border)',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            <div style={{ padding: '16px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '12px' }}>
              <Briefcase size={32} color="#ec4899" />
            </div>
            <div>
              <h3 style={{ marginBottom: '4px' }}>I'm a Brand</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>I want to hire creators for my campaigns.</p>
            </div>
          </button>
        </div>

        <button 
          disabled={!role}
          onClick={handleComplete}
          className="btn btn-primary" 
          style={{ width: '100%', padding: '16px', justifyContent: 'center', opacity: role ? 1 : 0.5 }}
        >
          Continue <ChevronRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}
