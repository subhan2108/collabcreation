import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CreatorDashboardViewer() {
  const { token } = useAuth();
  const { id } = useParams(); // creator ID

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);        // public projects
  const [myProjects, setMyProjects] = useState([]);    // brand-owned projects
  const [invitedProjects, setInvitedProjects] = useState([]); // project IDs already invited

  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // ----------------------------------------------------
  // LOAD ALL DATA
  // ----------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        /* ---------------------------
           1️⃣ Fetch creator profile
        --------------------------- */
        const profileRes = await fetch(`${API_BASE}/creators/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) throw new Error("Creator profile fetch failed");
        const profileData = await profileRes.json();
        setProfile(profileData);

        /* ---------------------------
           2️⃣ Fetch ALL public projects
        --------------------------- */
        const projectsRes = await fetch(`${API_BASE}/projects/`);
        if (!projectsRes.ok) throw new Error("Projects fetch failed");
        const allProjects = await projectsRes.json();
        setProjects(allProjects);

        /* ---------------------------
           3️⃣ Fetch ONLY logged-in brand projects
        --------------------------- */
        const myProjRes = await fetch(`${API_BASE}/my-projects/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (myProjRes.ok) {
          const myData = await myProjRes.json();
          setMyProjects(myData);
        }

        /* ---------------------------
           4️⃣ Fetch invitation history
        --------------------------- */
        const invitesRes = await fetch(`${API_BASE}/applications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (invitesRes.ok) {
          const invites = await invitesRes.json();
          const alreadyInvited = invites
            .filter(
              (app) =>
                app.creator?.id == id &&
                app.project &&
                app.project.id
            )
            .map((app) => app.project.id);

          setInvitedProjects(alreadyInvited);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, API_BASE, token]);

  // ----------------------------------------------------
  // SEND INVITATION
  // ----------------------------------------------------
  const sendInvitation = async () => {
    if (!selectedProject) return alert("Select a project first!");

    const res = await fetch(`${API_BASE}/invite/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creator_id: id,
        project_id: selectedProject,
        message: inviteMessage,
      }),
    });

    if (res.ok) {
      alert("Invitation sent successfully!");
      setInvitedProjects((prev) => [...prev, Number(selectedProject)]);
      setShowInvitePopup(false);
      setSelectedProject("");
      setInviteMessage("");
    } else {
      alert("Failed to send invitation");
    }
  };

  // ----------------------------------------------------
  // UI RENDER
  // ----------------------------------------------------
  if (loading) return <p>Loading creator details...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!profile) return <p>No profile found.</p>;

  return (
    <div className="dashboard">
      <section className="section">
        <h1 className="section-title">Creator Profile</h1>

        {/* ================= PROFILE ================= */}
        <div className="profile-card glass">
          <img
            src={profile.profile_image || "/default-avatar.png"}
            alt="Profile"
            className="profile-pic"
          />

          <div>
            <h2>{profile.full_name || profile.username}</h2>
            <p>@{profile.username}</p>
            <p><strong>Platform:</strong> {profile.primary_platform}</p>
            <p><strong>Followers:</strong> {profile.followers_count}</p>

            {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}

            <button
              className="btn glass"
              onClick={() => setShowInvitePopup(true)}
            >
              ✉ Invite Creator
            </button>
          </div>
        </div>

        {/* ================= PROJECTS ================= */}
        <div className="projects">
          <h2>Projects</h2>

          <div className="project-list">
            {projects.length > 0 ? (
              projects.map((p) => (
                <div key={p.id} className="project-card glass">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="meta">
                    <span>💰 ₹{p.budget}</span>
                    <span>📅 {p.deadline}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No projects available.</p>
            )}
          </div>
        </div>
      </section>

      {/* ================= INVITE POPUP ================= */}
      {showInvitePopup && (
        <div className="modal-overlay">
          <div className="modal glass">
            <h2>Invite Creator to Your Project</h2>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select your project</option>

              {myProjects.length === 0 && (
                <option disabled>No projects found</option>
              )}

              {myProjects.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  disabled={invitedProjects.includes(p.id)}
                >
                  {p.title}
                  {invitedProjects.includes(p.id) ? " (Invited)" : ""}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Optional message..."
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
            />

            <button
              className="btn-primary"
              onClick={sendInvitation}
              disabled={invitedProjects.includes(Number(selectedProject))}
            >
              {invitedProjects.includes(Number(selectedProject))
                ? "Already Invited"
                : "Send Invitation"}
            </button>

            <button
              className="btn-outline"
              onClick={() => setShowInvitePopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
