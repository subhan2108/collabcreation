import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
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
  const { user, fetchProfile } = useAuth();
  const [formData, setFormData] = useState({
    brand_name: "",
    website_social: "",
    description: "",
    primary_goal: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!user) {
        setError("You must be logged in first.");
        setLoading(false);
        return;
      }

      // 1. Save to Supabase brand_profiles
      const { data: brandData, error: sbError } = await supabase
        .from("brand_profiles")
        .insert([{
          user_id: user.id,
          brand_name: formData.brand_name,
          website_social: formData.website_social,
          description: formData.description,
          primary_goal: formData.primary_goal
        }])
        .select()
        .single();

      if (sbError) {
        if (sbError.code === "23505") { // Unique violation
           setError("A profile already exists for this account.");
        } else {
           throw sbError;
        }
        setLoading(false);
        return;
      }

      // 2. IMPORTANT: Update the core profile role to 'brand'
      const { error: roleError } = await supabase
        .from("profiles")
        .update({ role: "brand" })
        .eq("id", user.id);

      if (roleError) {
        console.error("Error updating role:", roleError);
        // We continue anyway since brand_profile was created
      }

      // 3. Refresh auth context role
      await fetchProfile(user.id);

      setSuccess("Brand profile submitted successfully!");
      
      // 4. Redirect to dashboard
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
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
                      <input 
                        className="form-input" 
                        id="companyName" 
                        name="brand_name"
                        placeholder="Acme Corporation" 
                        value={formData.brand_name} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="industry">Industry *</label>
                      <input className="form-input" id="industry" placeholder="Technology, Fashion, Food, etc." />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="website">Company Website / Social *</label>
                      <input 
                        className="form-input" 
                        id="website" 
                        placeholder="https://acme.com" 
                        name="website_social" 
                        value={formData.website_social} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="companySize">Company Size</label>
                      <input className="form-input" id="companySize" placeholder="10-50 employees" />
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
                      <label className="form-label" htmlFor="authEmail">Email Address *</label>
                      <input className="form-input" id="authEmail" type="email" placeholder="jane@acme.com" />
                    </div>
                  </div>
                </div>

                {/* Company Documents */}
                <div className="form-section">
                  <h3 className="form-section__title">Company Verification</h3>
                  <div className="form-grid form-grid--two-col">
                    <div className="form-field">
                      <label className="form-label">Company Logo</label>
                      <div className="upload-area">
                        <Upload className="upload-area__icon" />
                        <p className="upload-area__text">High-resolution logo</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marketing Goals */}
                <div className="form-section">
                  <h3 className="form-section__title">Marketing Information</h3>
                  <div className="form-field">
                    <label className="form-label" htmlFor="marketingGoals">Marketing Goals & Target Audience *</label>
                    <textarea 
                      className="form-textarea" 
                      id="marketingGoals" 
                      name="primary_goal"
                      placeholder="Describe your marketing goals and target audience" 
                      rows={3} 
                      onChange={handleChange} 
                      value={formData.primary_goal} 
                      required
                    />
                  </div>
                  
                  <div className="form-field" style={{ marginTop: "1rem" }}>
                    <label className="form-label" htmlFor="description">Brand Description *</label>
                    <textarea
                      className="form-textarea"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tell creators about your brand history and style"
                      rows={4}
                      required
                    />
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

                <button className="submit-button" type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Complete Registration"}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
