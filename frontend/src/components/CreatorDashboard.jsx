import { useEffect, useState } from "react";
import { Bell } from "lucide-react"; // ✅ Notification icon (Lucide or use any icon lib)
import { useNavigate } from "react-router-dom";

export default function CreatorDashboard() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(false); // ✅ for red dot indicator
  const [showDropdown, setShowDropdown] = useState(false);
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
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

      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();
      setNotifications(data);

      // ✅ Show red dot only if there's any unread notification
      const unreadExists = data.some((n) => !n.is_read);
      setUnread(unreadExists);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    }
  };

  fetchNotifications();
  // ✅ Refresh every 10 seconds to stay live
  const interval = setInterval(fetchNotifications, 10000);
  return () => clearInterval(interval);
}, [API_BASE, token]);


  // ==========================================================
  // 🧭 FETCH DASHBOARD DATA
  // ==========================================================
  // ==========================================================
  // 📝 APPLY FOR PROJECT (fixed version)
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

      // ✅ Instantly mark as applied
      setAppliedProjects((prev) => [...prev, projectId]);

      // ✅ Optionally store in localStorage for persistence
      const updated = [...appliedProjects, projectId];
      localStorage.setItem("appliedProjects", JSON.stringify(updated));

      alert("✅ Applied successfully!");
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Could not apply. Check console for details.");
    }
  };

  // ==========================================================
  // 🧭 FETCH DASHBOARD DATA (updated for persistence)
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

        const projectsRes = await fetch(`${API_BASE}/projects/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!projectsRes.ok) throw new Error(`Projects fetch failed`);
        const projectsData = await projectsRes.json();

        // ✅ Load locally stored applied projects (for persistence)
        const savedApplied =
          JSON.parse(localStorage.getItem("appliedProjects")) || [];

        // ✅ Fetch applied projects from backend
        const applicationsRes = await fetch(`${API_BASE}/applications/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        let appliedIds = [...savedApplied];
        if (applicationsRes.ok) {
          const applicationsData = await applicationsRes.json();
          appliedIds = [
            ...new Set([
              ...appliedIds,
              ...applicationsData.map((app) => app.project),
            ]),
          ];
        }

        // ✅ Update profile and appliedProjects
        setProfile({
          ...profileData,
          projects_applied: appliedIds.length, // dynamically update the count
        });

        setProjects(projectsData);
        setAppliedProjects(appliedIds);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_BASE, token]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_BASE}/creator/summary/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch summary");
        const summaryData = await res.json();
        console.log("Creator summary:", summaryData);

        // ✅ Merge summary into profile (so your stats update automatically)
        setProfile((prev) => ({
          ...prev,
          projects_applied: summaryData.total_applied,
          hired: summaryData.hired,
          rejected: summaryData.rejected,
          pending: summaryData.pending,
        }));
      } catch (err) {
        console.error("❌ Summary fetch error:", err);
      }
    };

    fetchSummary();
  }, [API_BASE, token]);

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

        <div className="projects-header">
          <h2>Browse Projects</h2>
          <button
            className="btn glass"
            onClick={() => navigate("/projects")}
            style={{
              marginLeft: "auto",
              background: "#00bfa6",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              transition: "0.3s ease",
            }}
          >
            See All Projects →
          </button>
        </div>

        {/* === Your Projects === */}
        <div className="projects">
          <h2>Your Projects</h2>
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
              <h4 className="dropdown-title">Notifications</h4>

             {notifications.length > 0 ? (
  notifications.map((n) => (
    <div key={n.id} className="notification-item glass">
      <p>📩 {n.message}</p>

      {n.data?.collaboration_id && (
        <button
          className="btn glass"
          style={{
            marginTop: "6px",
            background: "#00bfa6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "0.3s ease",
          }}
          onClick={() => navigate(`/mutual/${n.data.collaboration_id}`)}
        >
          View Collaboration →
        </button>
      )}
    </div>
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
