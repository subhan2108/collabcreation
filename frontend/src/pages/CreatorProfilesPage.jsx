import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


export default function CreatorProfilesPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await fetch(`${BASE_URL}/creators/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch creators");
        const data = await res.json();
        setCreators(data);
      } catch (err) {
        console.error("❌ Error fetching creators:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [BASE_URL, token]);

  if (loading) return <p>Loading creators...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="profiles-page">
      <h1 className="section-title">Discover Creators</h1>

      <div className="profiles-grid">
        {creators.length > 0 ? (
          creators.map((profile) => (
            <Link key={profile.id} to={`/creators/${profile.id}/dashboard`} className="profile-card glass">
              <img
                src={profile.profile_image || "/default-avatar.png"}
                alt="Profile"
                className="profile-pic"
              />
              <div className="profile-info">
                <h2>{profile.full_name || "Unnamed Creator"}</h2>
                <p>@{profile.username || "unknown"}</p>
                <p><strong>Platform:</strong> {profile.primary_platform || "N/A"}</p>
                <p><strong>Followers:</strong> {profile.followers_count || 0}</p>
                {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
              </div>
            </Link>
          ))
        ) : (
          <p>No creators found.</p>
        )}
      </div>
    </div>
  );
}
