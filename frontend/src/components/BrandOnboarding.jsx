import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";

export default function BrandOnboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand_name: "",
    website_social: "",
    description: "",
    primary_goal: "",
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

      const res = await fetch(`${API_BASE}/brand-onboarding/`, {
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

      setSuccess("Brand profile submitted successfully!");
      localStorage.setItem("brandData", JSON.stringify(data));

      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="onboard glass">
      <h2>🏢 Brand Onboarding</h2>
      <p>Tell us about your brand and your upcoming campaigns.</p>

      <form className="onboard-form" onSubmit={handleSubmit}>
        <input
          name="brand_name"
          type="text"
          placeholder="Brand Name"
          value={formData.brand_name}
          onChange={handleChange}
          required
        />
        <input
          name="website_social"
          type="text"
          placeholder="Website / Social Link"
          value={formData.website_social}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Describe your brand focus"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          name="primary_goal"
          type="text"
          placeholder="Primary Campaign Goal"
          value={formData.primary_goal}
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
