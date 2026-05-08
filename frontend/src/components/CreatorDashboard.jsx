import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Notification from "./Notification";
import ProfileImageUploader from "./ProfileImageUploader";
import EditProfileModal from "./EditProfileModal";
import "./Dashboard.css";

import { supabase } from "../supabaseClient";

export default function CreatorDashboard() {
  const { user, token } = useAuth();
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
    if (!token && !loading) navigate("/login");
  }, [token, loading, navigate]);

  /* ===================== FETCH DASHBOARD ===================== */
  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);

        /* 1. FETCH PROFILE */
        const { data: profileData, error: profileError } = await supabase
          .from("creator_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        
        if (!profileData) {
          // If no profile found, redirect to onboarding
          navigate("/creator-onboarding");
          return;
        }
        setProfile(profileData);

        /* 2. FETCH APPLICATIONS & PROJECTS */
        const { data: appsData, error: appsError } = await supabase
          .from("applications")
          .select(`
            *,
            projects (*)
          `)
          .eq("creator_id", user.id);

        if (appsError) throw appsError;

        setApplications(appsData || []);
        setAppliedProjectIds(appsData?.map((a) => a.project_id) || []);

        /* 3. FETCH AVAILABLE PROJECTS (Optional: you might want to show all available) */
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .limit(10);
        
        if (projectsError) throw projectsError;
        
        // Map applications to "projects" format expected by the UI for the bottom section
        const dashboardProjects = appsData?.map(app => ({
            id: app.projects.id,
            title: app.projects.title,
            status: app.status, // hired, pending, rejected
            collaboration_id: app.id // temporary until we have real collaborations
        })) || [];
        
        setProjects(dashboardProjects);

        /* 4. COMPUTE STATS */
        const computedStats = {
          applied: appsData?.length || 0,
          pending: appsData?.filter(a => a.status === 'pending').length || 0,
          hired: appsData?.filter(a => a.status === 'hired').length || 0,
          rejected: appsData?.filter(a => a.status === 'rejected').length || 0,
        };
        setStats(computedStats);

      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setError("Failed to load dashboard data from Supabase.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, navigate]);

  /* ===================== APPLY ===================== */
  const handleApply = async (projectId) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("applications")
        .insert([{
          project_id: projectId,
          creator_id: user.id,
          pitch: "I would love to collaborate on this project!",
          status: "pending"
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAppliedProjectIds(prev => [...prev, projectId]);
      setApplications(prev => [...prev, data]);
      setStats(prev => ({ ...prev, applied: prev.applied + 1, pending: prev.pending + 1 }));
      
      alert("Application sent!");
    } catch (err) {
      console.error("Apply Error:", err);
      alert("Could not apply. Try again.");
    }
  };

  /* ===================== SHOWCASE SLOT ===================== */
  function ShowcaseSlot({ index, image }) {
    const uploadImage = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        // For simplicity, we'll store the URL as a string if we have a public URL, 
        // or just use a mock URL for now if storage isn't set up.
        // If you have Supabase Storage configured, we would upload here.
        // For now, let's assume we are updating the text field.
        
        const fieldName = `showcase_image_${index}`;
        const mockUrl = URL.createObjectURL(file); // This is just local, needs real upload

        const { data, error } = await supabase
          .from("creator_profiles")
          .update({ [fieldName]: mockUrl }) // Ideally use public URL after upload
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error("Upload Error:", err);
        alert("Upload failed");
      }
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
