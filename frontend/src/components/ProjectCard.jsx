import PropTypes from "prop-types";

export default function ProjectCard({ project }) {
  return (
    <div className="card project-card">
      <h4>{project.title}</h4>
      <p>{project.description}</p>

      <div className="project-meta">
        <span>💰 ₹{project.budget}</span>
        <span>📅 {project.deadline}</span>
      </div>

      {project.skills_required && (
        <p className="muted">
          Skills: {project.skills_required}
        </p>
      )}
    </div>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    budget: PropTypes.number.isRequired,
    deadline: PropTypes.string.isRequired,
    skills_required: PropTypes.string,
  }).isRequired,
};
