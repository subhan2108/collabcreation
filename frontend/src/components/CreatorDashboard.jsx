import { useEffect, useState } from "react";
import { Bell } from "lucide-react"; // ✅ Notification icon (Lucide or use any icon lib)


export default function CreatorDashboard() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(false); // ✅ for red dot indicator
  const [showDropdown, setShowDropdown] = useState(false);
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  // ==========================================================
  // 📨 FETCH NOTIFICATIONS
  // ==========================================================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;
        const data = await res.json();
        setNotifications(data);
        setUnread(data.length > 0); // ✅ show red dot if any notification
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [API_BASE, token]);

  // ==========================================================
  // 🧭 FETCH DASHBOARD DATA
  // ==========================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE}/creator-profile/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileRes.ok) throw new Error(`Profile fetch failed`);

        const profileData = await profileRes.json();
        setProfile(profileData);

        const projectsRes = await fetch(`${API_BASE}/projects/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!projectsRes.ok) throw new Error(`Projects fetch failed`);

        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_BASE, token]);

  // ==========================================================
  // 📝 APPLY FOR PROJECT
  // ==========================================================
  const handleApply = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/applications/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project: projectId,
          pitch: "I would love to collaborate on this project!",
        }),
      });

      if (!res.ok) throw new Error("Failed to apply for this project");

      setAppliedProjects((prev) => [...prev, projectId]);
      alert("✅ Applied successfully!");
    } catch (err) {
      alert("Could not apply. Check console for details.");
    }
  };

  // ==========================================================
  // 🎨 RENDER LOGIC
  // ==========================================================
  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div className="dashboard">
      {/* === Header with Notification Icon === */}
      <header className="dashboard-header glass">
        <h1 className="section-title">Creator Dashboard</h1>

        
      </header>

      {/* === Profile Section === */}
      <section id="creator" className="section">
        <div className="profile-card glass">
          <img
            src={profile.profile_image || "/default-avatar.png"}
            alt="Profile"
            className="profile-pic"
          />
          <div>
            <h2>{profile.full_name || "Unnamed Creator"}</h2>
            <p>@{profile.username || "unknown"}</p>
            <p><strong>Platform:</strong> {profile.primary_platform || "N/A"}</p>
            <p><strong>Followers:</strong> {profile.followers_count || 0}</p>
            {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card glass">
            <p>Projects Applied</p>
            <h2>{profile.projects_applied || 0}</h2>
          </div>
          <div className="stat-card glass">
            <p>Active Projects</p>
            <h2>{profile.active_projects || 0}</h2>
          </div>
          <div className="stat-card glass">
            <p>Wallet Balance</p>
            <h2>₹{profile.wallet_balance || 0}</h2>
          </div>
        </div>
        

        {/* === Browse Projects === */}
        <div className="projects">
          <h2>Browse Projects</h2>
          <div className="project-list">
            {projects.length > 0 ? (
              projects.map((p) => (
                <div key={p.id} className="project-card glass">
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <div className="meta">
                      <span>💰 Budget: ₹{p.budget}</span>
                      <span>📅 Deadline: {p.deadline}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApply(p.id)}
                    disabled={appliedProjects.includes(p.id)}
                  >
                    {appliedProjects.includes(p.id) ? "Applied" : "Apply"}
                  </button>
                </div>
              ))
            ) : (
              <p>No projects available right now.</p>
            )}
          </div>
        </div>
        <div className="notification-wrapper">
          <button
            className="notification-btn"
            onClick={() => {
              setShowDropdown(!showDropdown);
              setUnread(false); // ✅ mark as read when opened
            }}
          >
            <Bell size={22} color="white" />
            {unread && <span className="notification-dot"></span>}
          </button>

          {showDropdown && (
            <div className="notification-dropdown glass">
              <h4>Notifications</h4>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <p key={n.id} className="notification-item">
                    📩 {n.message}
                  </p>
                ))
              ) : (
                <p className="empty-msg">No new notifications</p>
              )}
            </div>
          )}
        </div>
      </section>
      
    </div>
  );
}

