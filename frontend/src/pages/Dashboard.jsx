import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Active Projects', value: '12', icon: <Clock size={20} />, color: '#6366f1' },
    { label: 'Total Earnings', value: '₹45,000', icon: <DollarSign size={20} />, color: '#10b981' },
    { label: 'Collaborators', value: '8', icon: <Users size={20} />, color: '#ec4899' },
    { label: 'Growth', value: '+24%', icon: <TrendingUp size={20} />, color: '#f59e0b' },
  ];

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 className="section-title">Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass" 
            style={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ padding: '8px', background: `${stat.color}15`, borderRadius: '8px', color: stat.color }}>{stat.icon}</div>
              <span style={{ fontSize: '0.8rem', color: stat.color, fontWeight: 600 }}>{stat.label}</span>
            </div>
            <h3 style={{ fontSize: '1.75rem' }}>{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div className="glass" style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: '24px' }}>Recent Collaborations</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                  <div>
                    <h4 style={{ marginBottom: '4px' }}>Project Alpha Campaign</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>with Brand X • Started 2 days ago</p>
                  </div>
                </div>
                <button className="btn btn-glass" style={{ fontSize: '0.8rem' }}>View Workspace</button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: '24px' }}>Upcoming Deadlines</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
             <div style={{ borderLeft: '4px solid var(--danger)', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.05)' }}>
               <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Video Delivery</h4>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due in 4 hours</p>
             </div>
             <div style={{ borderLeft: '4px solid var(--primary)', padding: '12px 16px', background: 'rgba(99, 102, 241, 0.05)' }}>
               <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Brief Approval</h4>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due tomorrow</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
