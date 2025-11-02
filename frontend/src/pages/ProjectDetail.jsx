import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";


const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [brand, setBrand] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE}/projects/${id}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
        fetch(`${API_BASE}/brands/${data.brand}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        })
          .then((res) => res.json())
          .then(setBrand);
      });
  }, [id]);

  const handleApply = () => {
    const payload = { project: id, pitch: "Excited to work on this project!" };
    fetch(`${API_BASE}/applications/create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: JSON.stringify(payload),
    }).then(() => alert("✅ Applied successfully!"));
  };

  if (!project) return <div className="loading">Loading...</div>;

  return (
    <div className="project-detail">
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      <p><strong>Skills Required:</strong> {project.skills_required}</p>
      <p><strong>Budget:</strong> ${project.budget}</p>
      <p><strong>Deadline:</strong> {project.deadline}</p>

      {brand && (
        <div className="brand-section">
          <Link to={`/brands/${brand.user}/dashboard`} className="brand-link">
            <img
              src={brand.profile_image || "/default-avatar.png"}
              alt="Brand"
              className="brand-image"
            />
            <div>
              <h2>{brand.brand_name}</h2>
              <p>{brand.primary_goal}</p>
            </div>
          </Link>
        </div>
      )}

      <button onClick={handleApply} className="apply-button">
        Apply Now
      </button>
    </div>
  );
};

export default ProjectDetail;
