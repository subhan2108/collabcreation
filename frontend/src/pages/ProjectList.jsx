import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProjectList.css";

import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function ProjectList() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!token && !authLoading) navigate("/login");
  }, [token, authLoading, navigate]);

  /* ================= FETCH PROJECTS (CREATOR VIEW) ================= */
  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // 1. Fetch all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*");

      if (projectsError) throw projectsError;

      // 2. Fetch current user's applications
      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .eq("creator_id", user.id);

      if (appsError) throw appsError;

      // 3. Merge: add status and collaboration_id to project objects
      const mergedProjects = projectsData.map(p => {
        const app = appsData.find(a => a.project_id === p.id);
        return {
          ...p,
          status: app ? app.status : null,
          collaboration_id: app ? app.id : null // Use app ID as collab ID for now
        };
      });

      setProjects(mergedProjects);
    } catch (err) {
      console.error("Fetch Projects Error:", err);
      setError("Failed to load projects from Supabase");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  /* ================= APPLY ================= */
  const handleApply = async (projectId) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("applications")
        .insert([{
          project_id: projectId,
          creator_id: user.id,
          pitch: "Interested in this project",
          status: "pending"
        }]);

      if (error) throw error;
      fetchProjects();
    } catch (err) {
      console.error("Apply Error:", err);
      alert("Failed to apply");
    }
  };

  /* ================= WITHDRAW (PENDING ONLY) ================= */
  const handleWithdraw = async (projectId) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("project_id", projectId)
        .eq("creator_id", user.id);

      if (error) throw error;
      fetchProjects();
    } catch (err) {
      console.error("Withdraw Error:", err);
      alert("Cannot withdraw application");
    }
  };

  /* ================= UI STATES ================= */
  if (loading) return <p className="page-msg">Loading projects…</p>;
  if (error) return <p className="page-msg error">{error}</p>;

  /* ================= RENDER ================= */
  return (
    <div className="projects-page">
      <h2>Available Projects</h2>

      {projects.length === 0 && (
        <p className="muted">No projects available.</p>
      )}

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-info">
              <h4>{project.title}</h4>
              <p className="muted">{project.description}</p>
              <p className="budget">₹{project.budget}</p>
            </div>

            <div className="project-action">
              {/* NOT APPLIED */}
              {project.status === null && (
                <button
                  className="btn primary"
                  onClick={() => handleApply(project.id)}
                >
                  Apply Now
                </button>
              )}

              {/* PENDING */}
              {project.status === "pending" && (
                <div className="pending-actions">
                  <span className="badge pending">Pending</span>
                  <button
                    className="btn withdraw"
                    onClick={() => handleWithdraw(project.id)}
                  >
                    Withdraw
                  </button>
                </div>
              )}

              {/* ACTIVE / HIRED */}
              {project.status === "hired" && (
                <Link
                  to={`/mutual/${project.collaboration_id}`}
                  className="badge hired"
                >
                  Active → Open Collaboration
                </Link>
              )}

              {/* REJECTED */}
              {project.status === "rejected" && (
                <span className="badge rejected">Rejected</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Link className="back-dashboard" to="/dashboard">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
