import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function MutualPage() {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { collabId } = useParams();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  // ✅ Fetch collaborations from backend
  useEffect(() => {
    const fetchCollabs = async () => {
      try {
        const res = await fetch(`${API_BASE}/collaborations/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load collaborations");

        const data = await res.json();
        setCollabs(data);
      } catch (err) {
        console.error("❌ Error fetching collaborations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollabs();
  }, [API_BASE, token]);

  if (loading) return <p>Loading collaborations...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  // ✅ Optional: if collabId exists, filter only that collaboration
  const filteredCollabs = collabId
    ? collabs.filter((c) => String(c.id) === String(collabId))
    : collabs;

  if (filteredCollabs.length === 0) {
    return (
      <div className="mutual-page glass">
        <h1 className="section-title">🤝 Collaborations</h1>
        <p>
          No collaborations found. Once you hire or get hired, collaborations
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mutual-page glass">
      <h1 className="section-title">🤝 Collaborations</h1>

      <div className="collab-list">
        {filteredCollabs.map((c) => (
          <div key={c.id} className="collab-card glass">
            <div className="collab-header">
              <h2>{c.project?.title || "Untitled Project"}</h2>
              <p>
                Status:{" "}
                <strong style={{ color: c.status === "active" ? "green" : "gray" }}>
                  {c.status || "pending"}
                </strong>
              </p>
            </div>

            <div className="collab-body">
              <div className="collab-user">
                <h3>👔 Brand</h3>
                <p>{c.brand?.username || "Unknown"}</p>
              </div>
              <div className="collab-user">
                <h3>🎨 Creator</h3>
                <p>{c.creator?.username || "Unknown"}</p>
              </div>
            </div>

            <div className="collab-footer">
              <button
                className="btn glass"
                onClick={() => navigate(`/chat/${c.id}`)}
              >
                💬 Open Chat
              </button>
              <button
                className="btn-outline glass"
                onClick={() => navigate(`/projects/${c.project?.id}`)}
              >
                📁 View Project
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
