import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";
import {
  Building,
  Upload,
  Shield,
  CheckCircle,
  Users
} from "lucide-react";

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
   <div className="brand-signup">
      <div className="brand-signup__container">
        <div className="brand-signup__header">
          <h1 className="brand-signup__title">Join as a Brand</h1>
          <p className="brand-signup__subtitle">
            Connect with verified creators and grow your business securely
          </p>
        </div>

        <div className="brand-signup__grid">
          {/* Sign Up Form */}
          <form onSubmit={handleSubmit}>
            <div className="brand-card">
              <div className="brand-card__header">
                <h2 className="brand-card__title">
                  <Building className="brand-card__title-icon" />
                  Brand Registration
                </h2>
              </div>
              <div className="brand-card__content">
                {/* Company Information */}
                <div className="form-section">
                  <h3 className="form-section__title">Company Information</h3>
                  <div className="form-grid form-grid--two-col">
                    <div className="form-field">
                      <label className="form-label" htmlFor="companyName">Company Name *</label>
                      <input className="form-input" id="companyName" placeholder="Acme Corporation"  value={formData.brand_name} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="industry">Industry *</label>
                      <input className="form-input" id="industry" placeholder="Technology, Fashion, Food, etc." />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="website">Company Website</label>
                      <input className="form-input" id="website" placeholder="https://acme.com" name="website_social" value={formData.website_social} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="companySize">Company Size</label>
                      <input className="form-input" id="companySize" placeholder="10-50 employees" />
                    </div>
                  </div>
                  <div className="form-field" style={{ marginTop: '1rem' }}>
                    <label className="form-label" htmlFor="address">Company Address *</label>
                    <textarea className="form-textarea" id="address" placeholder="Full company address" rows={2}></textarea>
                  </div>
                  <div className="form-grid form-grid--two-col" style={{ marginTop: '1rem' }}>
                    <div className="form-field">
                      <label className="form-label" htmlFor="gst">GST Number (if applicable)</label>
                      <input className="form-input" id="gst" placeholder="22AAAAA0000A1Z5" />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="cin">CIN Number (if applicable)</label>
                      <input className="form-input" id="cin" placeholder="U72900KA2019PTC123456" />
                    </div>
                  </div>
                </div>

                {/* Authorized Person */}
                <div className="form-section">
                  <h3 className="form-section__title">Authorized Representative</h3>
                  <div className="form-grid form-grid--two-col">
                    <div className="form-field">
                      <label className="form-label" htmlFor="authName">Full Name *</label>
                      <input className="form-input" id="authName" placeholder="Jane Smith" />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="authTitle">Job Title *</label>
                      <input className="form-input" id="authTitle" placeholder="Marketing Director" />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="authEmail">Email Address *</label>
                      <input className="form-input" id="authEmail" type="email" placeholder="jane@acme.com" />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="authPhone">Phone Number *</label>
                      <input className="form-input" id="authPhone" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                  <div className="form-field" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Representative ID Proof (PAN/Driver's License) *</label>
                    <div className="upload-area">
                      <Upload className="upload-area__icon" />
                      <p className="upload-area__text">Click to upload or drag and drop</p>
                    </div>
                  </div>
                </div>

                {/* Company Documents */}
                <div className="form-section">
                  <h3 className="form-section__title">Company Verification</h3>
                  <div className="form-grid form-grid--two-col">
                    <div className="form-field">
                      <label className="form-label">Company Registration Certificate *</label>
                      <div className="upload-area">
                        <Upload className="upload-area__icon" />
                        <p className="upload-area__text">Certificate of Incorporation</p>
                      </div>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Company Logo</label>
                      <div className="upload-area">
                        <Upload className="upload-area__icon" />
                        <p className="upload-area__text">High-resolution logo</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="form-section">
                  <h3 className="form-section__title">Banking Information</h3>
                  <div className="form-grid form-grid--two-col">
                    <div className="form-field">
                      <label className="form-label" htmlFor="bankName">Bank Name *</label>
                      <input className="form-input" id="bankName" placeholder="Bank of America" />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="accountName">Account Name *</label>
                      <input className="form-input" id="accountName" placeholder="Acme Corporation" />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="accountNumber">Account Number *</label>
                      <input className="form-input" id="accountNumber" placeholder="1234567890" />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="routingNumber">Routing Number/IFSC *</label>
                      <input className="form-input" id="routingNumber" placeholder="021000021" />
                    </div>
                  </div>
                </div>

                {/* Marketing Goals */}
                <div className="form-section">
                  <h3 className="form-section__title">Marketing Information</h3>
                  <div className="form-field">
                    <label className="form-label" htmlFor="marketingGoals">Marketing Goals & Target Audience</label>
                    <textarea className="form-textarea" id="marketingGoals" placeholder="Describe your marketing goals and target audience" rows={3} onChange={handleChange} value={formData.primary_goal} name="primary_goal" required></textarea>
                  </div>
                  {/* DESCRIPTION */}
                <div className="form-section">
                  <h3 className="form-section__title">Brand Description</h3>

                  <textarea
                    className="form-textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell creators about your brand"
                    rows={4}
                    required
                  />
                </div>

                  <div className="form-grid form-grid--two-col" style={{ marginTop: '1rem' }}>
                    <div className="form-field">
                      <label className="form-label" htmlFor="monthlyBudget">Monthly Marketing Budget</label>
                      <input className="form-input" id="monthlyBudget" placeholder="$10,000 - $50,000" />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="preferredContent">Preferred Content Types</label>
                      <input className="form-input" id="preferredContent" placeholder="Videos, Reels, Blog posts" />
                    </div>
                  </div>
                </div>

                {/* ✅ ERROR / SUCCESS UI */}
                {error && (
                  <div className="form-alert form-alert--error">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="form-alert form-alert--success">
                    {success}
                  </div>
                )}

                <button className="submit-button">
                  Complete Registration
                </button>
              </div>
            </div>
          </form>

          {/* Benefits Sidebar */}
          <div className="brand-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-card__title">
                <Shield className="sidebar-card__title-icon sidebar-card__title-icon--trust" />
                Brand Benefits
              </h3>
              <ul className="benefits-list">
                <li className="benefits-list__item">
                  <CheckCircle className="benefits-list__icon" />
                  <span>Work only with KYC verified creators</span>
                </li>
                <li className="benefits-list__item">
                  <CheckCircle className="benefits-list__icon" />
                  <span>Escrow protection - pay only after delivery</span>
                </li>
                <li className="benefits-list__item">
                  <CheckCircle className="benefits-list__icon" />
                  <span>Direct communication with creators</span>
                </li>
                <li className="benefits-list__item">
                  <CheckCircle className="benefits-list__icon" />
                  <span>Portfolio review before hiring</span>
                </li>
                <li className="benefits-list__item">
                  <CheckCircle className="benefits-list__icon" />
                  <span>Multi-currency payment support</span>
                </li>
              </ul>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-card__title">
                <Users className="sidebar-card__title-icon sidebar-card__title-icon--primary" />
                Platform Stats
              </h3>
              <div className="stats-list">
                <div className="stats-list__item">
                  <span>Verified Creators:</span>
                  <span className="stats-list__value">10,000+</span>
                </div>
                <div className="stats-list__item">
                  <span>Success Rate:</span>
                  <span className="stats-list__value">98.5%</span>
                </div>
                <div className="stats-list__item">
                  <span>Avg. Project Time:</span>
                  <span className="stats-list__value">7 days</span>
                </div>
                <div className="stats-list__item">
                  <span>Platform Fee:</span>
                  <span className="stats-list__value">7%</span>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-card__title">Security First</h3>
              <p className="security-text">
                All transactions are protected by our escrow system. Your funds are only released when you approve the delivered work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
