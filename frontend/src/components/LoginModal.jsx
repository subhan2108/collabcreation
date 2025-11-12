import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SignupModal from "./SignupModal";


export default function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();
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

    // ✅ Save user tokens and role
    login(data);
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("userRole", data.role);

    setSuccess("Login successful! Redirecting...");

    // ✅ Fetch onboarding status from backend
    const statusRes = await fetch(`${API_BASE}/onboarding-status/`, {
      headers: { Authorization: `Bearer ${data.access}` },
    });
    const statusData = await statusRes.json();

    setTimeout(() => {
      if (onClose) onClose();

      if (statusData.completed) navigate("/dashboard");
      else navigate("/onboarding");
    }, 1000);

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
          <span style={{ color: "#007bff", cursor: "pointer" }} onClick={() => setShowSignup(true)}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
