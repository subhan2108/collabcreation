import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreatorOnboarding from "../components/CreatorOnboarding";
import BrandOnboarding from "../components/BrandOnboarding";

export default function Onboarding() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !role) {
      navigate("/");
    }
  }, [role, loading, navigate]);

  if (loading || !role) return null;

  return (
    <div className="onboarding">
      {role === "creator" ? <CreatorOnboarding /> : <BrandOnboarding />}
    </div>
  );
}
