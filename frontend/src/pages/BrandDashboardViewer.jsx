import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function BrandDashboardViewer() {
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
        // Fetch brand profile
        const profileRes = await fetch(`${API_BASE}/brands/${id}/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!profileRes.ok) throw new Error("Profile fetch failed");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Fetch projects by this brand
        const projectsRes = await fetch(`${API_BASE}/brands/${id}/projects/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!projectsRes.ok) throw new Error("Projects fetch failed");
        const brandProjects = await projectsRes.json();
        setProjects(brandProjects);
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
      <section id="brand" className="section">
        <h1 className="section-title">Brand Dashboard</h1>

        {/* Profile Box */}
        <div className="profile-card glass">
          <img
            src={profile.profile_image || "/default-avatar.png"}
            alt="Brand"
            className="profile-pic"
          />
          <div>
            <h2>{profile.company_name || profile.full_name}</h2>
            <p>{profile.industry}</p>
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer">
                {profile.website}
              </a>
            )}
            <p>{profile.description}</p>
          </div>
        </div>

        {/* Projects */}
        <div className="projects">
          <h2>Projects</h2>
          {projects.length > 0 ? (
            projects.map((p) => (
              <div key={p.id} className="project-card glass">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="meta">
                  <span>💰 Budget: ₹{p.budget}</span>
                  <span>📅 Deadline: {p.deadline}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No projects.</p>
          )}
        </div>
      </section>
    </div>
  );
}
