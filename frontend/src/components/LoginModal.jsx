import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import SignupModal from "./SignupModal";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";

export default function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await login(credentials.email, credentials.password);
      
      if (data) {
        setSuccess("Welcome back! Redirecting...");
        
        // Fetch profile to check onboarding status
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        const userRole = profile?.role || data.user.user_metadata?.role;

        // Also check if creator/brand profile exists to determine onboarding completion
        let detailProfile = null;
        if (userRole) {
          const profileTable = userRole === 'creator' ? 'creator_profiles' : 'brand_profiles';
          const { data: detailData } = await supabase
            .from(profileTable)
            .select("id")
            .eq("user_id", data.user.id)
            .maybeSingle();
          detailProfile = detailData;
        }

        setTimeout(() => {
          if (onClose) onClose();
          if (detailProfile) {
            navigate("/dashboard");
          } else {
            navigate("/onboarding");
          }
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid login credentials.");
      setLoading(false);
    }
  };

  if (showSignup) return <SignupModal onClose={onClose} />;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <h2>Sign In</h2>
        <p>Welcome back! Please enter your details.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={credentials.email}
              onChange={handleChange}
              required
            />
            <Mail 
              size={18} 
              style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} 
            />
          </div>

          <div className="input-group" style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
            <div 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", display: "flex", alignItems: "center", color: "#64748b" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="modal-footer">
          Don’t have an account?{" "}
          <span className="link-text" onClick={() => setShowSignup(true)}>
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
}
