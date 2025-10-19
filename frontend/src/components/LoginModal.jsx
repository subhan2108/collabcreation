import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupModal from "./SignupModal"; 
import "./Modal.css";

export default function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      // Store tokens & user info
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userRole", data.role);

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        onClose();

        // ✅ Check if onboarding is complete
        const onboardingComplete =
          (data.role === "creator" && localStorage.getItem("creatorData")) ||
          (data.role === "brand" && localStorage.getItem("brandData"));

        if (onboardingComplete) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    }
  };
  

  if (showSignup) return <SignupModal onClose={onClose} />;

  return (
    <div className="modal-overlay">
      <div className="modal glass">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={handleChange}
            required
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "10px",
                cursor: "pointer",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <button type="submit" className="btn-primary">Sign In</button>
        </form>

        <p style={{ marginTop: "15px" }}>
          Don’t have an account?{" "}
          <span
            style={{ color: "#007bff", cursor: "pointer" }}
            onClick={() => setShowSignup(true)}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
