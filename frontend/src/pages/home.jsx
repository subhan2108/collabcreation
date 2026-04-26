import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '100px' }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '100px', color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '24px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <Sparkles size={16} /> 
          <span>The future of brand-creator collaboration</span>
        </div>
        
        <h1 style={{ fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '24px', maxWidth: '900px', margin: '0 auto 24px' }}>
          Connect, Create, and <span style={{ background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Collaborate</span> with Trust.
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 40px' }}>
          The all-in-one platform for brands and creators to build meaningful partnerships with secure payments and real-time collaboration.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/onboarding')} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Start Your Journey <ArrowRight size={20} />
          </button>
          <button className="btn btn-glass" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Explore Projects
          </button>
        </div>
      </motion.section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
        {[
          { icon: <Shield size={32} color="#6366f1" />, title: 'Secure Escrow', desc: 'Funds are held safely until the project is delivered and approved.' },
          { icon: <Zap size={32} color="#ec4899" />, title: 'Real-time Chat', desc: 'Direct communication with integrated file sharing and status updates.' },
          { icon: <Sparkles size={32} color="#10b981" />, title: 'Premium Creators', desc: 'Only vetted and approved profiles to ensure the highest quality work.' }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.05 }}
            className="glass" 
            style={{ padding: '40px', textAlign: 'center' }}
          >
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{feature.title}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
