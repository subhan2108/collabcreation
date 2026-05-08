import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import "./Modal.css";
import { User, Mail, Lock, Eye, EyeOff, Briefcase, X } from "lucide-react";

export default function SignupModal({ onClose }) {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "creator",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Sign up with Supabase
      const data = await signup(formData.email, formData.password, {
        full_name: formData.username,
        role: formData.role,
        username: formData.username // Also include as username for profile trigger
      });

      // 2. Check if we have a session (we won't if email confirmation is enabled)
      if (data.session) {
        setSuccess("Account created! Redirecting...");
        localStorage.setItem("userRole", formData.role);
        
        setTimeout(() => {
          if (onClose) onClose();
          navigate("/onboarding");
        }, 2000);

      } else {
        // Email confirmation required
        setSuccess("Check your email to confirm your account!");
        setLoading(false);
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  if (showLogin) {
    return <LoginModal onClose={onClose} />;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <h2>Sign Up</h2>
        <p>Join as a Brand or Creator and start collaborating.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              name="username"
              placeholder="Full Name"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <User 
              size={18} 
              style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} 
            />
          </div>

          <div className="input-group">
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
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
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
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

          <div className="input-group">
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#fff",
                fontSize: "1rem",
                appearance: "none",
                outline: "none"
              }}
            >
              <option value="creator">I'm a Creator</option>
              <option value="brand">I'm a Brand</option>
            </select>
            <Briefcase 
              size={18} 
              style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} 
            />
          </div>

          {error && <p className="error-message" style={{ whiteSpace: "pre-line" }}>{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "Continue →"}
          </button>
        </form>

        <div className="modal-footer">
          Already have an account?{" "}
          <span className="link-text" onClick={() => setShowLogin(true)}>
            Login
          </span>
        </div>
      </div>
    </div>
  );
}
