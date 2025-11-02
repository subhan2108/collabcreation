import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";


const BrandDetail = () => {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [projects, setProjects] = useState([]);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE}/brands/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setBrand(data);
        fetch(`${API_BASE}/projects/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        })
          .then((res) => res.json())
          .then((allProjects) =>
            setProjects(allProjects.filter((p) => p.brand === data.user))
          );
      });
  }, [id]);

  if (!brand) return <div className="loading">Loading...</div>;

  return (
    <div className="brand-detail">
      <div className="brand-header">
        <img
          src={brand.profile_image || "/default-avatar.png"}
          alt="Brand"
          className="brand-image-large"
        />
        <div>
          <h1>{brand.brand_name}</h1>
          <p>{brand.description}</p>
          <p className="website">{brand.website_social}</p>
        </div>
      </div>

      <h2 className="project-heading">Projects by {brand.brand_name}</h2>
      <div className="brand-projects">
        {projects.map((p) => (
          <Link to={`/projects/${p.id}`} key={p.id} className="brand-project-card">
            <h3>{p.title}</h3>
            <p>{p.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BrandDetail;
