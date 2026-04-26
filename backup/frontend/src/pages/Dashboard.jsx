import { useEffect, useState } from "react";
import CreatorDashboard from "../components/CreatorDashboard";
import BrandDashboard from "../components/BrandDashboard";

export default function Dashboard() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    // ⛔ NO AUTH — get role only from localStorage
    const storedRole = localStorage.getItem("userRole");

    if (storedRole) {
      setRole(storedRole);
    } else {
      // fallback — force user to signup/onboard
      setRole(null);
    }
  }, []);

  // ❌ If role missing
  if (!role) {
    return (
      <div className="onboarding-error">
        <h2>⚠️ No role found</h2>
        <p>Please sign up and select a role.</p>
      </div>
    );
  }

  // ✅ Direct load dashboard — NO AUTH REQUIRED
  return <>{role === "creator" ? <CreatorDashboard /> : <BrandDashboard />}</>;
}
