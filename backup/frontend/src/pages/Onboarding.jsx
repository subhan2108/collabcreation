import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatorOnboarding from "../components/CreatorOnboarding";
import BrandOnboarding from "../components/BrandOnboarding";

export default function Onboarding() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (!storedRole) {
      navigate("/"); // redirect to signup/home if role not found
    } else {
      setRole(storedRole);
    }
  }, []);

  if (!role) return null; // avoid rendering before redirect

  return (
    <div className="onboarding">
      {role === "creator" ? <CreatorOnboarding /> : <BrandOnboarding />}
    </div>
  );
}
