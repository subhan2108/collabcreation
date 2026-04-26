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

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // After Supabase login, we still need to check the user role from our backend or metadata
      // For now, let's assume we store the role in user metadata or we fetch it from Django
      const { user } = data;
      
      // Fetch user role and profile status from Django backend using the Supabase JWT
      const res = await fetch(`${API_BASE}/me/`, {
        headers: { 
          Authorization: `Bearer ${data.session.access_token}` 
        },
      });

      const profileData = await res.json();
      
      if (res.ok) {
        login(user, profileData.role);
        setSuccess("Welcome back! Redirecting...");
        
        const statusRes = await fetch(`${API_BASE}/onboarding-status/`, {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        const statusData = await statusRes.json();

        setTimeout(() => {
          if (onClose) onClose();
          if (statusData.completed) navigate("/dashboard");
          else navigate("/onboarding");
        }, 1500);
      } else {
        setError("Could not fetch user profile details.");
        setLoading(false);
      }

    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
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
