import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import "./Modal.css";

export default function SignupModal({ onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "creator",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLogin, setShowLogin] = useState(false); // 👈 toggle between login/signup

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = "";
        for (const key in data) {
          msg += `${key}: ${data[key]}\n`;
        }
        setError(msg || "Signup failed.");
        return;
      }

      setSuccess("Signup successful! Redirecting...");
      localStorage.setItem("userRole", formData.role);

      setTimeout(() => {
        onClose();
        navigate("/onboarding");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    }
  };

  // 👇 Toggle to LoginModal if clicked
  if (showLogin) {
    return <LoginModal onClose={onClose} />;
  }

  return (
    <div className="modal-overlay">
      <div className="modal glass">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <h2>Sign Up Free</h2>
        <p>Join as a Brand or Creator and start collaborating today.</p>

        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Full Name"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div style={{ position: "relative" }}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
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

          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="creator">I'm a Creator</option>
            <option value="brand">I'm a Brand</option>
          </select>

          {error && <p className="error" style={{ whiteSpace: "pre-line" }}>{error}</p>}
          {success && <p className="success">{success}</p>}

          <button type="submit" className="btn-primary">Continue →</button>
        </form>

        {/* 👇 Login link */}
        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#007bff", cursor: "pointer" }}
            onClick={() => setShowLogin(true)}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
