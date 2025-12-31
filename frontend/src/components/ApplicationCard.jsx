import PropTypes from "prop-types";
import CreatorCard from "./CreatorCard";

export default function ApplicationCard({ application }) {
  return (
    <div className="card application-card">
      <p className="pitch">"{application.pitch}"</p>

      {application.creator && (
        <>
          <h5>Creator</h5>
          <CreatorCard creator={application.creator} />
        </>
      )}
    </div>
  );
}

ApplicationCard.propTypes = {
  application: PropTypes.shape({
    id: PropTypes.number.isRequired,
    pitch: PropTypes.string.isRequired,
    creator: PropTypes.object,
  }).isRequired,
};
