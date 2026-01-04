// src/components/CreatorDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "./Notification";
import EditProfileModal from "./EditProfileModal";
import ProfileImageUploader from "./ProfileImageUploader";

export default function CreatorDashboard() {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  /* ===================== STATE ===================== */
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [appliedProjectIds, setAppliedProjectIds] = useState([]);
  const [stats, setStats] = useState({
    applied: 0,
    pending: 0,
    hired: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  /* ===================== AUTH GUARD ===================== */
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  /* ===================== FETCH DASHBOARD ===================== */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        /* PROFILE */
        const profileRes = await fetch(`${API_BASE}/creator-profile/`, {
          headers: authHeaders,
        });
        if (profileRes.status === 401) return navigate("/login");
        if (!profileRes.ok) throw new Error("Profile fetch failed");
        const profileData = await profileRes.json();

        /* APPLICATIONS */
        const appsRes = await fetch(`${API_BASE}/applications/`, {
          headers: authHeaders,
        });
        const appsData = appsRes.ok ? await appsRes.json() : [];
        /* CREATOR PROJECT VIEW (STATUS BADGES SOURCE) */
        const projectRes = await fetch(`${API_BASE}/projects/creator-view/`, {
          headers: authHeaders,
        });
        const projectData = projectRes.ok ? await projectRes.json() : [];
        setProjects(projectData);

        setProfile(profileData);
        setApplications(appsData);
        setAppliedProjectIds(appsData.map((a) => a.project));

        /* STATS */
        const statsRes = await fetch(`${API_BASE}/creator/stats/`, {
          headers: authHeaders,
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [API_BASE, navigate, token]);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/projects/creator-view/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load projects");

      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [API_BASE, token]);

  /* ===================== APPLY ===================== */
  const handleApply = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/applications/create/`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project: projectId,
          pitch: "I would love to collaborate on this project!",
        }),
      });

      if (!res.ok) throw new Error("Apply failed");

      // re-fetch applications (single source of truth)
      const appsRes = await fetch(`${API_BASE}/applications/`, {
        headers: authHeaders,
      });
      const appsData = await appsRes.json();
      setApplications(appsData);
      setAppliedProjectIds(appsData.map((a) => a.project));
    } catch (err) {
      alert("Could not apply. Try again.");
    }
  };

  /* ===================== SHOWCASE SLOT ===================== */
  function ShowcaseSlot({ index, image }) {
    const uploadImage = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append(`image_${index}`, file);

      const res = await fetch(`${API_BASE}/creator-profile/showcase/`, {
        method: "PATCH",
        headers: authHeaders,
        body: formData,
      });

      if (!res.ok) return alert("Upload failed");
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
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

  /* ===================== UI STATES ===================== */
  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return null;

  /* ===================== RENDER ===================== */
  return (
    <div className="dashboard-wrapper">
      <Notification />

      <section className="dashboard-panel">
        <h2>Creator Dashboard</h2>

        {/* ================= PROFILE ================= */}
        <div className="card profile-card">
          <ProfileImageUploader
            image={profile.profile_image}
            endpoint="creator-profile/image"
            onUpdated={(img) =>
              setProfile((p) => ({ ...p, profile_image: img }))
            }
          />

          <div className="profile-info">
            <h3>{profile.full_name || profile.username}</h3>
            <p className="muted">
              @{profile.username_handle} <br /> {profile.primary_platform} ·{" "}
              {profile.followers_count} <br /> {profile.bio}
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
          <EditProfileModal
            profile={profile}
            onClose={() => setShowEditProfile(false)}
            onUpdated={(updatedProfile) => {
              setProfile(updatedProfile);
              setShowEditProfile(false);

              setNotifications((prev) => [
                {
                  id: Date.now(),
                  type: "success",
                  message: "Applied successfully!",
                },
                ...prev,
              ]);
            }}
          />
        )}

        {/* ================= STATS ================= */}
        <div className="stats-row">
          <div className="stat-card">
            <p>Applied</p>
            <h4>{stats.applied}</h4>
          </div>
          <div className="stat-card blue">
            <p>Pending</p>
            <h4>{stats.pending}</h4>
          </div>
          <div className="stat-card green">
            <p>Hired</p>
            <h4>{stats.hired}</h4>
          </div>
          <div className="stat-card red">
            <p>Rejected</p>
            <h4>{stats.rejected}</h4>
          </div>
        </div>

        {/* ================= SHOWCASE ================= */}
        <section className="showcase-section">
          <h4>Showcase Your Best Work</h4>
          <p className="muted">
            Brands see these images before sending invites.
          </p>

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

        {/* ================= MY APPLICATIONS ================= */}
        <h4>My Applications</h4>

        {projects.length === 0 && (
          <p className="muted">
            You haven’t applied yet.{" "}
            <Link to="/projects">Browse projects →</Link>
          </p>
        )}

        {projects
          .filter((p) => p.status)
          .map((p) => (
            <div key={p.id} className="application-card">
              <h5>{p.title}</h5>

              {/* STATUS BADGE */}
              <span className={`badge ${p.status}`}>
                {p.status === "pending" && "Pending"}
                {p.status === "hired" && "Active"}
                {p.status === "rejected" && "Rejected"}
              </span>

              {/* COLLAB LINK */}
              {p.status === "hired" && (
                <Link to={`/mutual/${p.collaboration_id}`} className="go-link">
                  Go to Collaboration →
                </Link>
              )}
            </div>
          ))}

        <Link className="browse-projects-link" to="/projects">
          Browse Available Projects →
        </Link>
      </section>
    </div>
  );
}
