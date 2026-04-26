import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";

import { CheckCircle, Upload, User, DollarSign } from "lucide-react";

export default function CreatorOnboarding() {
  const navigate = useNavigate();

  const skills = [
    { id: 1, label: "Instagram Reels" },
    { id: 2, label: "YouTube Videos" },
    { id: 3, label: "Short-form Content" },
    { id: 4, label: "Photography" },
    { id: 5, label: "Brand Promotions" },
    { id: 6, label: "UGC Content" },
  ];

  const socialPlatforms = [
    {
      id: 1,
      label: "Instagram",
      placeholder: "https://instagram.com/yourusername",
    },
    {
      id: 2,
      label: "YouTube",
      placeholder: "https://youtube.com/@yourchannel",
    },
    {
      id: 3,
      label: "TikTok",
      placeholder: "https://tiktok.com/@yourusername",
    },
    {
      id: 4,
      label: "Twitter / X",
      placeholder: "https://twitter.com/yourusername",
    },
  ];

  // ✅ BACKEND-COMPATIBLE FORM DATA
  const [formData, setFormData] = useState({
    full_name: "",
    username_handle: "",
    primary_platform: "",
    followers_count: "",
    bio: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  // ✅ Generic handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ OLD BACKEND LOGIC (UNCHANGED)
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
        if (data?.detail) {
          setError(data.detail);
        } else {
          setError("Unable to submit profile. Please check your details.");
        }
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
    <div className="creator-container">
      <div className="creator-signup__container">
        <div className="creator-signup__header">
          <h1 className="creator-signup__title">Join as a Creator</h1>
          <p className="creator-signup__subtitle">
            Start earning from your content with verified brands and secure
            payments
          </p>
        </div>

        <div className="creator-signup__grid">
          {/* Sign Up Form */}
          <div>
            <div className="creator-card">
              <div className="creator-card__header">
                <h2 className="creator-card__title">
                  <User className="creator-card__title-icon" />
                  Creator Registration
                </h2>
              </div>
              <form className="creator-card__content" onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="form-section">
                  <h3 className="form-section__title">Personal Information</h3>
                  <div className="form-grid form-grid--two-col">
                    <div className="form-field">
                      <label className="form-label" htmlFor="fullName">
                        Full Name *
                      </label>
                      <input
                        className="form-input"
                        id="fullName"
                        placeholder="John Smith"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        c
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="UserName">
                        Username / Handle *
                      </label>
                      <input
                        className="form-input"
                        id="usernameHandle"
                        name="username_handle"
                        placeholder="john_smith"
                        value={formData.username_handle}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="primaryPlatform">
                        Primary Platform *
                      </label>
                      <input
                        className="form-input"
                        id="primaryPlatform"
                        name="primary_platform"
                        placeholder="Instagram / YouTube"
                        value={formData.primary_platform}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="followersCount">
                        Followers Count *
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        id="followersCount"
                        name="followers_count"
                        placeholder="50000"
                        value={formData.followers_count}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label" htmlFor="email">
                        Email Address *
                      </label>
                      <input
                        className="form-input"
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="phone">
                        Phone Number *
                      </label>
                      <input
                        className="form-input"
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="location">
                        Location *
                      </label>
                      <input
                        className="form-input"
                        id="location"
                        placeholder="New York, USA"
                      />
                    </div>
                  </div>
                  <div className="form-field" style={{ marginTop: "1rem" }}>
                    <label className="form-label" htmlFor="address">
                      Full Address *
                    </label>
                    <textarea
                      className="form-textarea"
                      id="address"
                      placeholder="Street address, City, State, ZIP"
                    />
                  </div>
                </div>

                {/* Identity Verification */}
                <div className="form-section">
                  <h3 className="form-section__title">Identity Verification</h3>
                  <div className="form-grid form-grid--two-col">
                    <div className="form-field">
                      <label className="form-label">
                        Government ID (Aadhar/PAN/Driver's License) *
                      </label>
                      <div className="upload-area">
                        <Upload className="upload-area__icon" />
                        <p className="upload-area__text">
                          Click to upload or drag and drop
                        </p>
                      </div>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Profile Photo *</label>
                      <div className="upload-area">
                        <Upload className="upload-area__icon" />
                        <p className="upload-area__text">
                          Professional headshot
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills & Expertise */}
                <div className="form-section">
                  <h3 className="form-section__title">Skills & Expertise</h3>
                  <div className="form-grid form-grid--two-col">
                    {skills.map((skill) => (
                      <div key={skill.id} className="checkbox-group">
                        <input
                          className="checkbox-input"
                          type="checkbox"
                          id={skill.id}
                        />
                        <label className="checkbox-label" htmlFor={skill.id}>
                          {skill.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="form-section">
                  <h3 className="form-section__title">Social Media Profiles</h3>
                  <div className="social-platforms">
                    {socialPlatforms.map((platform) => (
                      <div key={platform.id} className="form-field">
                        <label className="form-label" htmlFor={platform.id}>
                          {platform.label}
                        </label>
                        <input
                          className="form-input"
                          id={platform.id}
                          placeholder={platform.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Portfolio & Bio */}
                <div className="form-section">
                  <h3 className="form-section__title">Portfolio & Bio</h3>
                  <div className="form-field">
                    <label className="form-label" htmlFor="portfolio">
                      Best Work Links *
                    </label>
                    <textarea
                      className="form-textarea"
                      name="bio"
                      id="portfolio"
                      placeholder="Share links to your best content (YouTube videos, Instagram posts, blog articles, etc.)"
                      onChange={handleChange}
                      value={formData.bio}
                      rows={3}
                    />
                  </div>
                  <div className="form-field" style={{ marginTop: "1rem" }}>
                    <label className="form-label" htmlFor="pitch">
                      Short Pitch *
                    </label>
                    <textarea
                      className="form-textarea"
                      id="pitch"
                      placeholder="Tell brands about yourself, your style, and what makes you unique (1 paragraph)"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Banking Information */}
                <div className="form-section">
                  <h3 className="form-section__title">Banking Information</h3>
                  <div className="form-grid form-grid--two-col">
                    <div className="form-field">
                      <label className="form-label" htmlFor="bankName">
                        Bank Name *
                      </label>
                      <input
                        className="form-input"
                        id="bankName"
                        placeholder="Bank of America"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="accountName">
                        Account Holder Name *
                      </label>
                      <input
                        className="form-input"
                        id="accountName"
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="accountNumber">
                        Account Number *
                      </label>
                      <input
                        className="form-input"
                        id="accountNumber"
                        placeholder="1234567890"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="routingNumber">
                        Routing Number/IFSC *
                      </label>
                      <input
                        className="form-input"
                        id="routingNumber"
                        placeholder="021000021"
                      />
                    </div>
                  </div>
                </div>

                {/* Error / Success Messages */}
                {error && (
                  <div className="form-alert form-alert--error">{error}</div>
                )}

                {success && (
                  <div className="form-alert form-alert--success">
                    {success}
                  </div>
                )}

                <button className="submit-button" type="submit">
                  Complete Registration
                </button>
              </form>
            </div>
          </div>

          {/* Benefits Sidebar */}
          <div className="sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-card__title">
                <CheckCircle className="sidebar-card__icon sidebar-card__icon--trust" />
                Creator Benefits
              </h3>
              <ul className="benefits-list">
                <li className="benefits-list__item">
                  <CheckCircle className="benefits-list__icon" />
                  <span>Secure escrow payments - get paid guaranteed</span>
                </li>
                <li className="benefits-list__item">
                  <CheckCircle className="benefits-list__icon" />
                  <span>Work with verified brands only</span>
                </li>
                <li className="benefits-list__item">
                  <CheckCircle className="benefits-list__icon" />
                  <span>Built-in chat and video calling</span>
                </li>
                <li className="benefits-list__item">
                  <CheckCircle className="benefits-list__icon" />
                  <span>Multi-currency wallet (USD/INR)</span>
                </li>
                <li className="benefits-list__item">
                  <CheckCircle className="benefits-list__icon" />
                  <span>Portfolio showcase with social linking</span>
                </li>
              </ul>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-card__title">
                <DollarSign className="sidebar-card__icon sidebar-card__icon--primary" />
                Earnings Info
              </h3>
              <div className="earnings-info">
                <p>
                  Platform commission: <strong>7%</strong>
                </p>
                <p>
                  You keep: <strong>93%</strong> of project value
                </p>
                <p>
                  Commission is only charged on completed projects. No hidden
                  fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
