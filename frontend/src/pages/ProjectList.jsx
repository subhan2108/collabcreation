import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const headers = {};
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    fetch(`${API_BASE}/projects/`, { headers })
      .then((res) => res.json())
      .then(setProjects)
      .catch(console.error);
  }, []);


  const handleApply = (projectId) => {
    const payload = { project: projectId, pitch: "Excited to work on this project!" };
    fetch(`${API_BASE}/applications/create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: JSON.stringify(payload),
    }).then(() => alert("✅ Applied successfully!"));
  };

  return (
    <div className="project-list">
      {projects.map((project) => (
        <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
          <h2>{project.title}</h2>
          <p className="description">{project.description}</p>
          <p>💰 Budget: ${project.budget}</p>
          <p>🕒 Deadline: {project.deadline}</p>
          <button onClick={(e) => { e.preventDefault(); handleApply(project.id); }} className="apply-button">
        Apply Now
      </button>
        </Link>
      ))}
    </div>
  );
};

export default ProjectList;
