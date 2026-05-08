import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


export default function BrandProfilesPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${BASE_URL}/brands/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch brands");
        const data = await res.json();
        setBrands(data);
      } catch (err) {
        console.error("❌ Error fetching brands:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [BASE_URL, token]);

  if (loading) return <p>Loading brands...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="profiles-page">
      <h1 className="section-title">Explore Brands</h1>

      <div className="profiles-grid">
        {brands.length > 0 ? (
          brands.map((brand) => (
            <Link key={brand.id} to={`/brands/${brand.id}/dashboard`} className="profile-card glass">
              <img
                src={brand.profile_image || "/default-avatar.png"}
                alt="Brand"
                className="profile-pic"
              />
              <div className="profile-info">
                <h2>{brand.full_name || "Unnamed Brand"}</h2>
                <p>@{brand.username || "unknown"}</p>
                <p><strong>Industry:</strong> {brand.industry || "N/A"}</p>
                <p><strong>Projects:</strong> {brand.projects_count || 0}</p>
                {brand.bio && <p><strong>Bio:</strong> {brand.bio}</p>}
              </div>
            </Link>
          ))
        ) : (
          <p>No brands found.</p>
        )}
      </div>
    </div>
  );
}
