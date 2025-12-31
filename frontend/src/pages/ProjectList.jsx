import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProjectList.css";

export default function ProjectList() {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  /* ================= FETCH PROJECTS (CREATOR VIEW) ================= */
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

  /* ================= APPLY ================= */
  const handleApply = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/applications/create/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project: projectId,
          pitch: "Interested in this project",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Apply error:", err);
        alert("Failed to apply");
        return;
      }

      // refresh backend truth
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  /* ================= WITHDRAW (PENDING ONLY) ================= */
  const handleWithdraw = async (projectId) => {
    try {
      const res = await fetch(
        `${API_BASE}/applications/withdraw/${projectId}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        alert("Cannot withdraw application");
        return;
      }

      fetchProjects();
    } catch (err) {
      alert("Network error");
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
