import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function EditBrandProfileModal({ profile, onClose, onUpdated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    brand_name: profile.brand_name || "",
    industry: profile.industry || "",
    website_social: profile.website_social || "",
    description: profile.description || "",
    primary_goal: profile.primary_goal || "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("brand_profiles")
        .update(form)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      
      onUpdated(data);
      onClose();
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3>Edit Brand Profile</h3>
        
        <div className="form-group">
          <label>Brand Name</label>
          <input 
            value={form.brand_name} 
            onChange={e => setForm({...form, brand_name: e.target.value})}
            placeholder="Brand Name"
          />
        </div>

        <div className="form-group">
          <label>Industry</label>
          <input 
            value={form.industry} 
            onChange={e => setForm({...form, industry: e.target.value})}
            placeholder="e.g. Technology, Fashion"
          />
        </div>

        <div className="form-group">
          <label>Website / Social</label>
          <input 
            value={form.website_social} 
            onChange={e => setForm({...form, website_social: e.target.value})}
            placeholder="https://..."
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Tell creators about your brand"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Marketing Goals / Primary Goal</label>
          <textarea 
            value={form.primary_goal} 
            onChange={e => setForm({...form, primary_goal: e.target.value})}
            placeholder="What are your marketing goals?"
            rows={3}
          />
        </div>

        <div className="modal-actions">
          <button className="btn outline" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
