import PropTypes from "prop-types";

export default function CreatorCard({ creator }) {
  return (
    <div className="card creator-card">
      <h4>{creator.full_name || creator.username}</h4>

      {creator.followers_count && (
        <p>Followers: {creator.followers_count}</p>
      )}

      {creator.portfolio && (
        <a href={creator.portfolio} target="_blank" rel="noreferrer">
          View Portfolio
        </a>
      )}
    </div>
  );
}

CreatorCard.propTypes = {
  creator: PropTypes.shape({
    id: PropTypes.number.isRequired,
    full_name: PropTypes.string,
    username: PropTypes.string,
    followers_count: PropTypes.number,
    portfolio: PropTypes.string,
  }).isRequired,
};
