import { useEffect, useState } from "react";

export default function CreatorDashboard() {
  // --- State variables ---
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]); // ✅ fixed
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- API setup ---
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  // ==========================================================
  // 📨 FETCH NOTIFICATIONS (Hire / Reject messages)
  // ==========================================================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log("📡 Fetching notifications...");
        const res = await fetch(`${API_BASE}/notifications/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Notification fetch failed:", text);
          return;
        }

        const data = await res.json();
        setNotifications(data);
        console.log("✅ Notifications from backend:", data);
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      }
    };

    fetchNotifications();

    // Optional: auto-refresh notifications every 10s
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [API_BASE, token]);

  // ==========================================================
  // 🧭 FETCH DASHBOARD DATA (Profile + Projects)
  // ==========================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("📡 Fetching profile & projects...");
        // --- Creator Profile ---
        const profileRes = await fetch(`${API_BASE}/creator-profile/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileRes.ok)
          throw new Error(`Profile fetch failed: ${profileRes.status}`);

        const profileData = await profileRes.json();
        setProfile(profileData);
        console.log("✅ Profile data:", profileData);

        // --- All Projects ---
        const projectsRes = await fetch(`${API_BASE}/projects/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!projectsRes.ok)
          throw new Error(`Projects fetch failed: ${projectsRes.status}`);

        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        console.log("✅ Projects data:", projectsData);
      } catch (err) {
        console.error("❌ Dashboard error:", err);
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
      console.log(`🚀 Applying for project ID: ${projectId}`);
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

      const data = await res.json();
      console.log("📦 Apply response:", data);

      if (!res.ok) throw new Error("Failed to apply for this project");

      setAppliedProjects((prev) => [...prev, projectId]);
      alert("✅ Applied successfully!");
    } catch (err) {
      console.error("❌ Apply error:", err);
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
      <section id="creator" className="section">
        <h1 className="section-title">Creator Dashboard</h1>

        {/* ===== Profile Overview ===== */}
        <div className="profile-card glass">
          <img
            src={profile.profile_image || "/default-avatar.png"}
            alt="Profile"
            className="profile-pic"
          />
          <div>
            <h2>{profile.full_name || "Unnamed Creator"}</h2>
            <p>@{profile.username || "unknown"}</p>
            <p>
              <strong>Platform:</strong> {profile.primary_platform || "N/A"}
            </p>
            <p>
              <strong>Followers:</strong> {profile.followers_count || 0}
            </p>
            {profile.bio && (
              <p>
                <strong>Bio:</strong> {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* ===== Stats Section ===== */}
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

        {/* ===== Browse Projects ===== */}
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
      </section>

      {/* ===== Notifications Section ===== */}
      <div className="notifications glass">
        <h2>Notifications</h2>
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <p key={n.id}>
              📩 <strong>{n.message}</strong>
            </p>
          ))
        ) : (
          <p>No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
