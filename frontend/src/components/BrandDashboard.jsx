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

  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  // --- Hire / Reject Handlers ---
  const handleHire = async (applicationId) => {
    try {
      const res = await fetch(
        `${API_BASE}/applications/${applicationId}/hire/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      console.log("Hire response:", data);

      if (!res.ok) throw new Error("Hire failed");
      alert("✅ Creator hired!");
      setApplications((prev) => prev.filter((a) => a.id !== applicationId));
    } catch (err) {
      console.error(err);
      alert("❌ Could not hire creator. Check console.");
    }
  };

  const handleReject = async (applicationId) => {
    try {
      const res = await fetch(
        `${API_BASE}/applications/${applicationId}/reject/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
        const profileRes = await fetch(`${API_BASE}/brand-profile/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!profileRes.ok) throw new Error("Profile fetch failed");
        const profileData = await profileRes.json();
        setProfile(profileData);

        const projectsRes = await fetch(`${API_BASE}/projects/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!projectsRes.ok) throw new Error("Projects fetch failed");
        const projectsData = await projectsRes.json();
        setProjects(projectsData);

        const applicationsRes = await fetch(`${API_BASE}/applications/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!applicationsRes.ok) throw new Error("Applications fetch failed");
        const applicationsData = await applicationsRes.json();
        setApplications(applicationsData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE, token]);

  const handleCreate = async (e) => {
    e.preventDefault();

    console.log("Submitting project:", newProject);

    try {
      const res = await fetch(`${API_BASE}/projects/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      });

      const data = await res.json();
      console.log("Project create response:", data);

      if (!res.ok) {
        console.error("Create failed:", data);
        alert(`❌ Failed to create project: ${JSON.stringify(data)}`);
        return;
      }

      // Success
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
          <img
            src={profile.profile_image || "/default-avatar.png"}
            alt="Brand"
            className="profile-pic"
          />
          <div>
            <h2>{profile.company_name}</h2>
            <p>{profile.industry}</p>
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer">
                {profile.website}
              </a>
            )}
            <p>{profile.description}</p>
          </div>
        </div>

        {/* ===== Post Project ===== */}
        <div className="post-project glass">
          <h2>Post a New Project</h2>
          <form onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Project Title"
              value={newProject.title}
              onChange={(e) =>
                setNewProject({ ...newProject, title: e.target.value })
              }
            />
            <textarea
              placeholder="Project Description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Skills Required (e.g. Instagram, YouTube)"
              value={newProject.skills_required || ""}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  skills_required: e.target.value,
                })
              }
            />

            <div className="two-col">
              <input
                type="text"
                placeholder="Budget (₹)"
                value={newProject.budget}
                onChange={(e) =>
                  setNewProject({ ...newProject, budget: e.target.value })
                }
              />
              <input
                type="date"
                value={newProject.deadline}
                onChange={(e) =>
                  setNewProject({ ...newProject, deadline: e.target.value })
                }
              />
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
                    {a.creator.full_name} – {a.creator.followers_count}{" "}
                    Followers
                  </h3>
                  <p>
                    Portfolio:{" "}
                    <a href={a.creator.portfolio || "#"} className="link">
                      {a.creator.portfolio || "#"}
                    </a>
                  </p>
                  <p>Pitch: {a.pitch}</p>
                </div>
                <div className="actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleHire(a.id)}
                  >
                    Hire
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => handleReject(a.id)}
                  >
                    Reject
                  </button>
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
