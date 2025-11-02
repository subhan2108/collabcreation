import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function CreatorDashboardViewer() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch creator profile
        const profileRes = await fetch(`${API_BASE}/creators/${id}/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!profileRes.ok) throw new Error("Profile fetch failed");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Fetch projects (all projects, but we can filter if needed)
        const projectsRes = await fetch(`${API_BASE}/projects/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!projectsRes.ok) throw new Error("Projects fetch failed");
        const allProjects = await projectsRes.json();
        // For viewer, show all projects or filter by creator if applicable
        setProjects(allProjects);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, API_BASE, token]);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div className="dashboard">
      <section id="creator" className="section">
        <h1 className="section-title">Creator Dashboard</h1>

        {/* Profile Section */}
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

        {/* Browse Projects */}
        <div className="projects">
          <h2>Projects</h2>
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
                </div>
              ))
            ) : (
              <p>No projects available.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
