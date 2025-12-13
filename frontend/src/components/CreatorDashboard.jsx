// src/components/CreatorDashboard.jsx
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreatorDashboard() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  // helper to ensure brand field is object (project.brand may be id)
  const fetchBrandIfNeeded = async (brandField) => {
    if (!brandField) return null;
    if (typeof brandField === "object") return brandField;
    try {
      const res = await fetch(`${API_BASE}/brands/${brandField}/`, { headers });
      if (!res.ok) return { id: brandField, username: `brand_${brandField}` };
      const data = await res.json();
      return {
        id: brandField,
        brand_name: data.brand_name || data.user?.username || `brand_${brandField}`,
        website: data.website_social || data.website || "",
        description: data.description || "",
        profile_image: data.profile_image || data.user?.profile_image || null,
        user: data.user || null,
      };
    } catch (err) {
      console.error("Error fetching brand:", err);
      return { id: brandField, brand_name: `brand_${brandField}` };
    }
  };

  // --- notifications fetch and enrichment
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications/`, { headers });
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();

        // if notification.data.collaboration_id is present as id, keep as-is (we navigate using it)
        setNotifications(data);
        const unreadExists = data.some((n) => !n.is_read);
        setUnread(unreadExists);
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [API_BASE, token]);

  // apply for project
  const handleApply = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/applications/create/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ project: projectId, pitch: "I would love to collaborate on this project!" }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to apply");
      }

      setAppliedProjects((prev) => [...prev, projectId]);
      const updated = [...appliedProjects, projectId];
      localStorage.setItem("appliedProjects", JSON.stringify(updated));
      alert("✅ Applied successfully!");
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Could not apply. Check console for details.");
    }
  };

  // fetch dashboard data and enrich nested brand objects if needed
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // PROFILE
        const profileRes = await fetch(`${API_BASE}/creator-profile/`, { headers });
        if (!profileRes.ok) throw new Error("Profile fetch failed");
        const profileData = await profileRes.json();

        // PROJECTS (may include brand as id)
        const projectsRes = await fetch(`${API_BASE}/projects/`, { headers });
        if (!projectsRes.ok) throw new Error("Projects fetch failed");
        let projectsData = await projectsRes.json();

        // enrich each project's brand if needed
        projectsData = await Promise.all(
          projectsData.map(async (p) => {
            if (!p.brand) return p;
            const brandObj = await fetchBrandIfNeeded(p.brand);
            return { ...p, brand: brandObj };
          })
        );

        // STORED APPLIED PROJECTS
        const savedApplied = JSON.parse(localStorage.getItem("appliedProjects")) || [];

        // APPLICATIONS FROM BACKEND (to compute applied project ids)
        const applicationsRes = await fetch(`${API_BASE}/applications/`, { headers });
        let appliedIds = [...savedApplied];
        if (applicationsRes.ok) {
          const appData = await applicationsRes.json();
          appliedIds = [...new Set([...appliedIds, ...appData.map((a) => a.project)])];
        }

        setProfile({ ...profileData, projects_applied: appliedIds.length });
        setProjects(projectsData);
        setAppliedProjects(appliedIds);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE, token]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_BASE}/creator/summary/`, { headers });
        if (!res.ok) throw new Error("Failed to fetch summary");
        const summaryData = await res.json();
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

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div className="dashboard">
      <header className="dashboard-header glass">
        <h1 className="section-title">Creator Dashboard</h1>
      </header>

      <section id="creator" className="section">
        <div className="profile-card glass">
          <img src={profile.profile_image || "/default-avatar.png"} alt="Profile" className="profile-pic" />
          <div>
            <h2>{profile.full_name || "Unnamed Creator"}</h2>
            <p>@{profile.username || "unknown"}</p>
            <p><strong>Platform:</strong> {profile.primary_platform || "N/A"}</p>
            <p><strong>Followers:</strong> {profile.followers_count || 0}</p>
            {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card glass"><p>Projects Applied</p><h2>{profile.projects_applied || 0}</h2></div>
          <div className="stat-card glass"><p>Active Projects</p><h2>{profile.active_projects || 0}</h2></div>
          <div className="stat-card glass"><p>Wallet Balance</p><h2>₹{profile.wallet_balance || 0}</h2></div>
        </div>

        <div className="projects-header">
          <h2>Browse Projects</h2>
          <button className="btn glass" onClick={() => navigate("/projects")} style={{ marginLeft: "auto", background: "#00bfa6", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", transition: "0.3s ease" }}>
            See All Projects →
          </button>
        </div>

        <div className="projects">
          <h2>Your Projects</h2>
          <div className="project-list">
            {projects.length > 0 ? (
              projects.map((p) => (
                <div key={p.id} className="project-card glass">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="meta">
                    <span>💰 Budget: ₹{p.budget}</span>
                    <span>📅 Deadline: {p.deadline}</span>
                    <span>🏢 Brand: {p.brand?.brand_name || p.brand?.user?.username || p.brand || "Unknown"}</span>
                  </div>
                  <button disabled={appliedProjects.includes(p.id)} onClick={() => handleApply(p.id)}>
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
          <button className="notification-btn" onClick={() => { setShowDropdown(!showDropdown); setUnread(false); }}>
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
                      <button className="btn glass" style={{ marginTop: "6px", background: "#00bfa6", color: "white", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "0.9rem", transition: "0.3s ease" }} onClick={() => navigate(`/mutual/${n.data.collaboration_id}`)}>
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
