import { useState } from "react";

import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function EditProfileModal({ profile, onClose, onUpdated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: profile.full_name || "",
    username_handle: profile.username_handle || "",
    primary_platform: profile.primary_platform || "",
    followers_count: profile.followers_count || "",
    bio: profile.bio || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("creator_profiles")
        .update({
          full_name: form.full_name,
          username_handle: form.username_handle,
          primary_platform: form.primary_platform,
          followers_count: parseInt(form.followers_count) || 0,
          bio: form.bio,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      onUpdated(data);
      onClose();
    } catch (err) {
      console.error("Profile update error:", err);
      alert("❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Edit Profile</h2>

        <label>Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfileImage(e.target.files[0])}
        />

        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="Full Name"
        />

        <input
          name="username_handle"
          value={form.username_handle}
          onChange={handleChange}
          placeholder="Username Handle"
        />

        <input
          name="primary_platform"
          value={form.primary_platform}
          onChange={handleChange}
          placeholder="Primary Platform"
        />

        <input
          type="number"
          name="followers_count"
          value={form.followers_count}
          onChange={handleChange}
          placeholder="Followers Count"
        />

        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Bio"
        />

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" onClick={handleSubmit}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
