// src/components/BrandDashboard.jsx
import { useEffect, useState } from "react";

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
    <div className="dashboard">
      <section id="brand" className="section">
        <h1 className="section-title">Brand Dashboard</h1>

        {/* ===== Profile Box ===== */}
        <div className="profile-card glass">
          <img src={profile.profile_image || "/default-avatar.png"} alt="Brand" className="profile-pic" />
          <div>
            <h2>{profile.brand_name || profile.company_name || profile.user?.username}</h2>
            <p>{profile.primary_goal || profile.industry || ""}</p>
            {profile.website_social && (
              <a href={profile.website_social} target="_blank" rel="noreferrer">
                {profile.website_social}
              </a>
            )}
            <p>{profile.description}</p>
          </div>
        </div>

        {/* ===== Post Project ===== */}
        <div className="post-project glass">
          <h2>Post a New Project</h2>
          <form onSubmit={handleCreate}>
            <input type="text" placeholder="Project Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
            <textarea placeholder="Project Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
            <input type="text" placeholder="Skills Required (e.g. Instagram, YouTube)" value={newProject.skills_required || ""} onChange={(e) => setNewProject({ ...newProject, skills_required: e.target.value })} />
            <div className="two-col">
              <input type="text" placeholder="Budget (₹)" value={newProject.budget} onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })} />
              <input type="date" value={newProject.deadline} onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })} />
            </div>
            <button type="submit">Create Project</button>
          </form>
        </div>

        {/* ===== Your Projects ===== */}
        <div className="projects">
          <h2>Your Projects</h2>
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
            <p>No projects created yet.</p>
          )}
        </div>

        {/* ===== Creator Applications ===== */}
        <div className="applications">
          <h2>Creator Applications</h2>
          {applications.length > 0 ? (
            applications.map((a) => (
              <div key={a.id} className="application-card glass">
                <div>
                  <h3>
                    {a.creator?.full_name || a.creator?.username || `User ${a.creator?.id || a.creator}`} – {a.creator?.followers_count ?? 0} Followers
                  </h3>
                  <p>Portfolio: <a href={a.creator?.portfolio || "#"} className="link">{a.creator?.portfolio || "#"}</a></p>
                  <p>Pitch: {a.pitch}</p>
                </div>
                <div className="actions">
                  <button className="btn-primary" onClick={() => handleHire(a.id)}>Hire</button>
                  <button className="btn-outline" onClick={() => handleReject(a.id)}>Reject</button>
                </div>
              </div>
            ))
          ) : (
            <p>No applications yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
