import { useEffect, useState } from "react";
import CreatorDashboard from "../components/CreatorDashboard";
import BrandDashboard from "../components/BrandDashboard";

export default function Dashboard() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    console.log("Stored Role:", storedRole); // ✅ Debug
    setRole(storedRole);
  }, []);

  if (!role) {
    return (
      <div className="onboarding-error">
        <h2>⚠️ No role found</h2>
        <p>Please complete signup and onboarding first.</p>
      </div>
    );
  }

  console.log("Rendering Dashboard for:", role); // ✅ Debug

  return (
    <div className="dashboard">
      {role === "creator" ? <CreatorDashboard /> : <BrandDashboard />}
    </div>
  );
}
