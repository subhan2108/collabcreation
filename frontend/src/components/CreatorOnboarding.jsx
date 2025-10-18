import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";

export default function CreatorOnboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    username_handle: "",
    primary_platform: "",
    followers_count: "",
    bio: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        setError("You must be logged in first.");
        return;
      }

      const res = await fetch(`${API_BASE}/creator-onboarding/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Submission failed. Please try again.");
        return;
      }

      setSuccess("Profile submitted successfully!");
      localStorage.setItem("creatorData", JSON.stringify(data));

      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="onboard glass">
      <h2>🎥 Creator Onboarding</h2>
      <p>Complete your profile to start collaborating with brands.</p>

      <form className="onboard-form" onSubmit={handleSubmit}>
        <input
          name="full_name"
          type="text"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
        <input
          name="username_handle"
          type="text"
          placeholder="Username / Handle"
          value={formData.username_handle}
          onChange={handleChange}
          required
        />
        <input
          name="primary_platform"
          type="text"
          placeholder="Primary Platform (e.g. Instagram)"
          value={formData.primary_platform}
          onChange={handleChange}
          required
        />
        <input
          name="followers_count"
          type="number"
          placeholder="Followers Count"
          value={formData.followers_count}
          onChange={handleChange}
          required
        />
        <textarea
          name="bio"
          placeholder="Bio / Niche Description"
          value={formData.bio}
          onChange={handleChange}
          required
        />
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit" className="btn-primary">
          Continue to Dashboard →
        </button>
      </form>
    </div>
  );
}
