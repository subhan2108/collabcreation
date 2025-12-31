import PropTypes from "prop-types";

export default function ProfileCard({ profile }) {
  if (!profile) return null;

  return (
    <div className="card profile-card">
      <h3>{profile.brand_name || profile.company_name}</h3>

      {profile.user && (
        <p className="muted">Owner: @{profile.user.username}</p>
      )}

      {profile.industry && <p><strong>Industry:</strong> {profile.industry}</p>}
      {profile.primary_goal && <p><strong>Goal:</strong> {profile.primary_goal}</p>}
      {profile.website_social && (
        <p>
          <a href={profile.website_social} target="_blank" rel="noreferrer">
            {profile.website_social}
          </a>
        </p>
      )}
      {profile.description && <p>{profile.description}</p>}
    </div>
  );
}

ProfileCard.propTypes = {
  profile: PropTypes.shape({
    brand_name: PropTypes.string,
    company_name: PropTypes.string,
    primary_goal: PropTypes.string,
    industry: PropTypes.string,
    website_social: PropTypes.string,
    description: PropTypes.string,
    profile_image: PropTypes.string,
    user: PropTypes.shape({
      username: PropTypes.string,
    }),
  }),
};
