import { useAuth } from "../context/AuthContext";
import CreatorDashboard from "../components/CreatorDashboard";
import BrandDashboard from "../components/BrandDashboard";

export default function Dashboard() {
  const { role, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!role) {
    return (
      <div className="onboarding-error">
        <h2>⚠️ No role found</h2>
        <p>Please sign up and select a role.</p>
      </div>
    );
  }

  return <>{role === "creator" ? <CreatorDashboard /> : <BrandDashboard />}</>;
}
