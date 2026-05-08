// src/components/BrandDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "./Notification";
import ProfileImageUploader from "./ProfileImageUploader";
import EditBrandProfileModal from "./EditBrandProfileModal";
import EditProjectModal from "./EditProjectModal";
import "./Dashboard.css";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function BrandDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  /* ===================== STATE ===================== */
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showProjects, setShowProjects] = useState(true);
  const [openProjectApps, setOpenProjectApps] = useState(null);
  const [editProject, setEditProject] = useState(null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    skills_required: "",
    budget: "",
    deadline: "",
  });

  /* ===================== FETCH DASHBOARD ===================== */
  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        // 1. Fetch Brand Profile
        const { data: profileData, error: profileError } = await supabase
          .from("brand_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // If no profile, redirect to onboarding
        if (!profileData) {
          console.log("No brand profile found, redirecting to onboarding...");
          navigate("/onboarding");
          return;
        }

        setProfile(profileData);

        // 2. Fetch Projects created by this brand
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("brand_id", user.id)
          .order("created_at", { ascending: false });

        if (projectError) throw projectError;
        setProjects(projectData || []);

        // 3. Fetch Applications for all projects of this brand
        if (projectData && projectData.length > 0) {
          const projectIds = projectData.map((p) => p.id);
          const { data: appsData, error: appsError } = await supabase
            .from("applications")
            .select(`
              *,
              creator_profiles:creator_id (
                full_name,
                username_handle,
                primary_platform,
                followers_count,
                profile_image
              )
            `)
            .in("project_id", projectIds);

          if (appsError) throw appsError;

          // Format applications to match frontend expectations
          const formattedApps = appsData.map(app => ({
            ...app,
            creator_name: app.creator_profiles?.full_name || "Unknown",
            creator_platform: app.creator_profiles?.primary_platform || "N/A",
            creator_followers: app.creator_profiles?.followers_count || 0,
            creator_profile_image: app.creator_profiles?.profile_image,
            project: app.project_id
          }));

          setApplications(formattedApps);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load brand dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, navigate]);

  /* ===================== PROJECT STATS ===================== */
  const today = new Date();

  const openProjectsCount = projects.filter(
    (p) =>
      new Date(p.deadline) >= today &&
      !applications.some((a) => a.project === p.id && a.status === "hired")
  ).length;

  const activeProjectsCount = applications.filter(
    (a) => a.status === "hired"
  ).length;

  const closedProjectsCount = projects.filter(
    (p) => new Date(p.deadline) < today
  ).length;

  /* ===================== SHOWCASE SLOT ===================== */
  function ShowcaseSlot({ index, image }) {
    const uploadImage = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // In a real app, you'd upload to Supabase Storage first
      // For now, let's simulate updating the profile record
      const mockUrl = URL.createObjectURL(file); 
      
      const updateData = {};
      updateData[`showcase_image_${index}`] = mockUrl;

      const { data, error } = await supabase
        .from("brand_profiles")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Showcase update error:", error);
        alert("Upload failed");
        return;
      }

      setProfile(data);
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

    const { data, error } = await supabase
      .from("projects")
      .insert([{
        ...newProject,
        brand_id: user.id,
        budget: parseFloat(newProject.budget) || 0
      }])
      .select()
      .single();

    if (error) {
      console.error("Project creation error:", error);
      alert("Failed to create project: " + error.message);
      return;
    }

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
    // 1. Update application status
    const { data: app, error: appError } = await supabase
      .from("applications")
      .update({ status: "hired" })
      .eq("id", id)
      .select()
      .single();

    if (appError) {
      alert("Hire failed: " + appError.message);
      return;
    }

    // 2. Refresh applications state
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "hired" } : a));
    
    // In a full implementation, you'd create a collaboration record here
    alert("Creator hired successfully!");
  };

  const handleReject = async (id) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      alert("Reject failed: " + error.message);
      return;
    }

    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  /* ===================== UI STATES ===================== */
  if (loading) return <div className="loading-state"><p>Loading dashboard...</p></div>;
  if (error) return <div className="error-state"><p className="error">{error}</p></div>;
  if (!profile) return null;

  /* ===================== RENDER ===================== */
  return (
    <div className="dashboard-wrapper">
      <Notification />

      <section className="dashboard-panel">
        <div className="dashboard-header-flex">
           <h2>Brand Dashboard</h2>
           <span className="user-badge brand">Brand Account</span>
        </div>

        {/* ================= PROFILE ================= */}
        <div className="card profile-card">
          <ProfileImageUploader
            image={profile.profile_image}
            onUpdated={async (imgUrl) => {
               const { error } = await supabase
                 .from("brand_profiles")
                 .update({ profile_image: imgUrl })
                 .eq("user_id", user.id);
               
               if (!error) setProfile(p => ({ ...p, profile_image: imgUrl }));
            }}
          />

          <div className="profile-info">
            <h3>{profile.brand_name}</h3>
            <div className="profile-meta-tags">
               <span className="meta-tag">{profile.industry}</span>
               {profile.website_social && <span className="meta-tag">{profile.website_social}</span>}
            </div>
            <p className="profile-description">
              {profile.description || "No description provided yet."}
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
              setProfile(updated);
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
            <h4>{openProjectsCount}</h4>
          </div>
          <div className="stat-card green">
            <p>Active Projects</p>
            <h4>{activeProjectsCount}</h4>
          </div>
          <div className="stat-card red">
            <p>Closed Projects</p>
            <h4>{closedProjectsCount}</h4>
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
                placeholder="Skills Required (e.g. Video Editing, UGC)"
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
              <div className="date-input-container">
                <label>Deadline:</label>
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
              </div>

              <button className="btn primary" type="submit">Create Project</button>
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
                      {projectApps.length} Applications
                    </button>
                  </div>

                  {openProjectApps === project.id && (
                    <div className="applications-panel" onClick={(e) => e.stopPropagation()}>
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
                            {app.status === "hired" ? (
                              <button className="btn success" disabled>
                                Hired
                              </button>
                            ) : app.status === "rejected" ? (
                               <button className="btn danger" disabled>Rejected</button>
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
