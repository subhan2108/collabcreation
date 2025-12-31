// src/components/BrandDashboard.jsx
import { useEffect, useState } from "react";
import Notification from "./Notification";
import "../styles/dashboard.css"


export default function BrandDashboard() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });

  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  // helper: fetch creator profile if we only have id
  const fetchCreatorProfileIfNeeded = async (creatorField) => {
    // creatorField might be an object or an id
    if (!creatorField) return null;
    if (typeof creatorField === "object") return creatorField;
    try {
      const res = await fetch(`${API_BASE}/creators/${creatorField}/`, { headers });
      if (!res.ok) return { id: creatorField, username: "unknown" };
      const data = await res.json();
      // serializer for CreatorDetail returns CreatorProfile object — map it to expected UI fields:
      // try to provide consistent fields used by UI: full_name, followers_count, portfolio, username
      return {
        id: creatorField,
        full_name: data.full_name || data.user?.username || "",
        followers_count: data.followers_count ?? (data.user?.followers_count ?? 0),
        portfolio: data.portfolio || data.user?.portfolio || "",
        username: data.user?.username || `user_${creatorField}`,
      };
    } catch (err) {
      console.error("Error fetching creator profile:", err);
      return { id: creatorField, username: `user_${creatorField}` };
    }
  };

  // --- Hire / Reject Handlers ---
  const handleHire = async (applicationId) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}/hire/`, {
        method: "POST",
        headers,
      });

      const data = await res.json();
      console.log("Hire response:", data);

      if (!res.ok) throw new Error("Hire failed");

      const openMutual = window.confirm(
        "✅ Creator hired successfully! \n\nDo you want to open the collaboration page?"
      );

      if (openMutual && data.collaboration_id) {
        window.location.href = `/mutual/${data.collaboration_id}`;
      }

      setApplications((prev) => prev.filter((a) => a.id !== applicationId));
    } catch (err) {
      console.error(err);
      alert("❌ Could not hire creator. Check console.");
    }
  };

  const handleReject = async (applicationId) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}/reject/`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      console.log("Reject response:", data);

      if (!res.ok) throw new Error("Reject failed");
      alert("❌ Creator rejected!");
      setApplications((prev) => prev.filter((a) => a.id !== applicationId));
    } catch (err) {
      console.error(err);
      alert("❌ Could not reject creator. Check console.");
    }
  };

  // --- Fetch profile, projects, and applications ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // BRAND PROFILE
        const profileRes = await fetch(`${API_BASE}/brand-profile/`, { headers });
        if (!profileRes.ok) throw new Error("Profile fetch failed");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // PROJECTS
        const projectsRes = await fetch(`${API_BASE}/projects/`, { headers });
        if (!projectsRes.ok) throw new Error("Projects fetch failed");
        const projectsData = await projectsRes.json();
        setProjects(projectsData);

        // APPLICATIONS (may have creator as id or nested object)
        const applicationsRes = await fetch(`${API_BASE}/applications/`, { headers });
        if (!applicationsRes.ok) throw new Error("Applications fetch failed");
        const applicationsData = await applicationsRes.json();

        // Enrich applications: ensure a.creator is an object with fields UI expects
        const enrichedApps = await Promise.all(
          applicationsData.map(async (a) => {
            const creatorObj = await fetchCreatorProfileIfNeeded(a.creator);
            return { ...a, creator: creatorObj };
          })
        );

        setApplications(enrichedApps);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE, token]);

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/projects/create/`, {
        method: "POST",
        headers,
        body: JSON.stringify(newProject),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Create failed:", data);
        alert(`❌ Failed to create project: ${JSON.stringify(data)}`);
        return;
      }

      setProjects((prev) => [...prev, data]);
      setNewProject({
        title: "",
        description: "",
        skills_required: "",
        budget: "",
        deadline: "",
      });
      alert("✅ Project created successfully!");
    } catch (err) {
      console.error("Network or fetch error:", err);
      alert("❌ Failed to create project (network error). Check console.");
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
     <div className="brand-dashboard">
      <section className="dashboard-section">
        <h1 className="section-title">Brand Dashboard</h1>

        {/* Profile Card */}
        <div className="profile-card">
          <img
            src={profile.profile_image || "/default-avatar.png"}
            alt="Brand"
            className="profile-pic"
          />
          <div className="profile-info">
            <h2 className="profile-name">
              {profile.brand_name ||
                profile.company_name ||
                profile.user?.username}
            </h2>
            <p className="profile-industry">
              {profile.primary_goal || profile.industry || ""}
            </p>
            {profile.website_social && (
              <a
                href={profile.website_social}
                target="_blank"
                rel="noreferrer"
                className="profile-link"
              >
                {profile.website_social}
              </a>
            )}
            <p className="profile-description">{profile.description}</p>
          </div>
        </div>

        {/* Post Project Form */}
        <div className="post-project-card">
          <h2 className="card-title">Post a New Project</h2>
          <form onSubmit={handleCreate} className="project-form">
            <input
              type="text"
              placeholder="Project Title"
              value={newProject.title}
              onChange={(e) =>
                setNewProject({ ...newProject, title: e.target.value })
              }
              className="form-input"
            />
            <textarea
              placeholder="Project Description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              className="form-textarea"
            />
            <input
              type="text"
              placeholder="Skills Required (e.g. Instagram, YouTube)"
              value={newProject.skills_required}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  skills_required: e.target.value,
                })
              }
              className="form-input"
            />
            <div className="form-row">
              <input
                type="text"
                placeholder="Budget (₹)"
                value={newProject.budget}
                onChange={(e) =>
                  setNewProject({ ...newProject, budget: e.target.value })
                }
                className="form-input"
              />
              <input
                type="date"
                value={newProject.deadline}
                onChange={(e) =>
                  setNewProject({ ...newProject, deadline: e.target.value })
                }
                className="form-input"
              />
            </div>
            <button type="submit" className="submit-btn">
              Create Project
            </button>
          </form>
        </div>

        {/* Your Projects */}
        <div className="projects-section">
          <h2 className="section-subtitle">Your Projects</h2>
          {projects.length > 0 ? (
            <div className="projects-list">
              {projects.map((p) => (
                <div key={p.id} className="project-card">
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-description">{p.description}</p>
                  <div className="project-meta">
                    <span>💰 Budget: ₹{p.budget}</span>
                    <span>📅 Deadline: {p.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-items">No projects created yet.</p>
          )}
        </div>

        {/* Creator Applications */}
        <div className="applications-section">
          <h2 className="section-subtitle">Creator Applications</h2>
          {applications.length > 0 ? (
            <div className="applications-list">
              {applications.map((a) => (
                <div key={a.id} className="application-card">
                  <div className="application-info">
                    <h3 className="applicant-name">
                      {a.creator?.full_name ||
                        a.creator?.username ||
                        `User ${a.creator?.id}`}{" "}
                      – {a.creator?.followers_count ?? 0} Followers
                    </h3>
                    <p className="applicant-portfolio">
                      Portfolio:{" "}
                      <a
                        href={a.creator?.portfolio || "#"}
                        className="portfolio-link"
                      >
                        {a.creator?.portfolio || "#"}
                      </a>
                    </p>
                    <p className="applicant-pitch">Pitch: {a.pitch}</p>
                  </div>
                  <div className="application-actions">
                    <button
                      className="btn-hire"
                      onClick={() => handleHire(a.id)}
                    >
                      Hire
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(a.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-items">No applications yet.</p>
          )}
        </div>

        <Notification />
      </section>
    </div>  
    );
}
