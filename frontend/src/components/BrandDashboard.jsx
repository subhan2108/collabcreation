// src/components/BrandDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Notification from "./Notification";
import ProfileImageUploader from "./ProfileImageUploader";
import EditBrandProfileModal from "./EditBrandProfileModal";
import EditProjectModal from "./EditProjectModal";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

export default function BrandDashboard() {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  /* ===================== STATE ===================== */
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [openProjectId, setOpenProjectId] = useState(null);
  const [showProjects, setShowProjects] = useState(true);
  const [openProjectApps, setOpenProjectApps] = useState(null);
  const [editProject, setEditProject] = useState(null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    skills_required: "",
    budget: "",
    deadline: "",
  });

  /* ===================== FETCH DASHBOARD ===================== */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const profileRes = await fetch(`${API_BASE}/brand-profile/`, {
          headers: authHeaders,
        });
        const projectRes = await fetch(`${API_BASE}/my-projects/`, {
          headers: authHeaders,
        });
        const appsRes = await fetch(`${API_BASE}/applications/`, {
          headers: authHeaders,
        });

        if (!profileRes.ok) throw new Error("Profile fetch failed");

        setProfile(await profileRes.json());
        setProjects(projectRes.ok ? await projectRes.json() : []);
        setApplications(appsRes.ok ? await appsRes.json() : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load brand dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [API_BASE, token]);

  /* ===================== PROJECT STATS ===================== */
  const today = new Date();

  const openProjects = projects.filter(
    (p) =>
      new Date(p.deadline) >= today &&
      !applications.some((a) => a.project === p.id && a.status === "hired")
  ).length;

  const activeProjects = applications.filter(
    (a) => a.status === "hired"
  ).length;

  const closedProjects = projects.filter(
    (p) => new Date(p.deadline) < today
  ).length;

  /* ===================== SHOWCASE SLOT ===================== */
  function ShowcaseSlot({ index, image }) {
    const uploadImage = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append(`image_${index}`, file);

      const res = await fetch(`${API_BASE}/brand-profile/showcase/`, {
        method: "PATCH",
        headers: authHeaders,
        body: formData,
      });

      if (!res.ok) return alert("Upload failed");

      const updated = await res.json();
      setProfile((prev) => ({ ...prev, ...updated }));
    };

    return (
      <label className="showcase-slot" role="button">
        {image ? (
          <img src={image} alt="" />
        ) : (
          <div className="empty-slot">+</div>
        )}
        <input type="file" hidden accept="image/*" onChange={uploadImage} />
        <div className="slot-overlay">{image ? "Change" : "Upload"}</div>
      </label>
    );
  }

  /* ===================== ACTIONS ===================== */
  const handleCreateProject = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE}/projects/create/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProject),
    });

    if (!res.ok) {
      alert("Failed to create project");
      return;
    }

    const data = await res.json();
    setProjects((prev) => [data, ...prev]);

    setNewProject({
      title: "",
      description: "",
      skills_required: "",
      budget: "",
      deadline: "",
    });
  };

  const handleHire = async (id) => {
    const res = await fetch(`${API_BASE}/applications/${id}/hire/`, {
      method: "POST",
      headers: authHeaders,
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Hire failed");
      return;
    }

    setApplications([]);
    if (data.collaboration_id) {
      window.location.href = `/mutual/${data.collaboration_id}`;
    }
  };

  const handleReject = async (id) => {
    await fetch(`${API_BASE}/applications/${id}/reject/`, {
      method: "POST",
      headers: authHeaders,
    });

    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  /* ===================== UI STATES ===================== */
  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!profile) return null;

  /* ===================== RENDER ===================== */
  return (
    <div className="dashboard-wrapper">
      <Notification />

      <section className="dashboard-panel">
        <h2>Brand Dashboard</h2>

        {/* ================= PROFILE ================= */}
        <div className="card profile-card">
          <ProfileImageUploader
            image={profile.profile_image}
            endpoint="brand-profile/image"
            onUpdated={(img) =>
              setProfile((p) => ({ ...p, profile_image: img }))
            }
          />

          <div className="profile-info">
            <h3>{profile.brand_name}</h3>
            <p className="muted">
              {profile.industry}
              <br />
              {profile.website_social}
              <br />
              {profile.description}
            </p>

            <button
              className="btn outline small edit-profile-btn"
              onClick={() => setShowEditProfile(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {showEditProfile && (
          <EditBrandProfileModal
            profile={profile}
            onClose={() => setShowEditProfile(false)}
            onUpdated={(updated) => {
              setProfile((p) => ({ ...p, ...updated }));
              setShowEditProfile(false);
            }}
          />
        )}

        {/* ================= SHOWCASE ================= */}
        <section className="showcase-section">
          <h4>Brand Showcase</h4>
          <p className="muted">Creators see these images before applying.</p>

          <div className="showcase-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ShowcaseSlot
                key={i}
                index={i}
                image={profile[`showcase_image_${i}`]}
              />
            ))}
          </div>
        </section>

        {/* ================= PROJECT STATS ================= */}
        <div className="stats-row">
          <div className="stat-card blue">
            <p>Open Projects</p>
            <h4>{openProjects}</h4>
          </div>
          <div className="stat-card green">
            <p>Active Projects</p>
            <h4>{activeProjects}</h4>
          </div>
          <div className="stat-card red">
            <p>Closed Projects</p>
            <h4>{closedProjects}</h4>
          </div>
        </div>

        {/* ================= CREATE PROJECT ================= */}
        <section className="card create-project-card">
          <h4>Create New Project</h4>
          <p className="muted">
            Post a collaboration opportunity for creators.
          </p>

          <form className="create-project-form" onSubmit={handleCreateProject}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    title: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-row">
              <textarea
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    description: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-row split">
              <input
                type="text"
                placeholder="Skills Required"
                value={newProject.skills_required}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    skills_required: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Budget (₹)"
                value={newProject.budget}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    budget: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-row split">
              <input
                type="date"
                value={newProject.deadline}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    deadline: e.target.value,
                  })
                }
                required
              />

              <button className="btn primary">Create Project</button>
            </div>
          </form>
        </section>

        {/* ================= YOUR PROJECTS ================= */}
        <section className="card my-project-card">
          <div
            className={`dropdown-header ${showProjects ? "open" : ""}`}
            onClick={() => setShowProjects(!showProjects)}
          >
            <h4>Your Projects</h4>
            <svg className="chevron" width="18" height="18" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          <div className={`dropdown-body ${showProjects ? "open" : ""}`}>
            {projects.length === 0 && (
              <p className="muted">No projects created yet.</p>
            )}

            {projects.map((project) => {
              const isClosed = new Date(project.deadline) < today;
              const projectApps = applications.filter(
                (a) => a.project === project.id
              );
              const hiredApp = projectApps.find((a) => a.status === "hired");

              return (
                <div
                  key={project.id}
                  className="project-row clickable"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="project-main">
                    <h5>{project.title}</h5>
                    <p className="muted">{project.skills_required}</p>
                    <span
                      className={`badge ${
                        isClosed ? "closed" : hiredApp ? "active" : "open"
                      }`}
                    >
                      {isClosed ? "Closed" : hiredApp ? "Active" : "Open"}
                    </span>
                  </div>

                  <div className="project-meta">
                    <button
                      className="btn outline small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenProjectApps(
                          openProjectApps === project.id ? null : project.id
                        );
                      }}
                    >
                      View Applications
                    </button>

                    <br />
                  </div>

                  {openProjectApps === project.id && (
                    <div className="applications-panel">
                      {projectApps.length === 0 && (
                        <p className="muted">No applications yet.</p>
                      )}

                      {projectApps.map((app) => (
                        <div key={app.id} className="application-row">
                          <div className="application-left">
                            <img
                              src={app.creator_profile_image || "/avatar.png"}
                              alt=""
                              className="app-avatar"
                            />

                            <div className="app-info">
                              <strong className="app-name">
                                {app.creator_name}
                              </strong>
                              <span className="app-meta">
                                {app.creator_platform} · {app.creator_followers}{" "}
                                followers
                              </span>
                              <p className="app-pitch">{app.pitch}</p>
                            </div>
                          </div>

                          <div className="application-right">
                            {app.status === "hired" || app.status === "accepted" ? (
  <button className="btn success" disabled>
    Hired
  </button>
) : (
  <>
    <button
      className="btn success small"
      onClick={(e) => {
        e.stopPropagation();
        handleHire(app.id);
      }}
    >
      Hire
    </button>

    <button
      className="btn danger small"
      onClick={(e) => {
        e.stopPropagation();
        handleReject(app.id);
      }}
    >
      Reject
    </button>
  </>
)}

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {editProject && (
          <EditProjectModal
            project={editProject}
            onClose={() => setEditProject(null)}
            onUpdated={(updated) =>
              setProjects((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p))
              )
            }
          />
        )}
      </section>
    </div>
  );
}
