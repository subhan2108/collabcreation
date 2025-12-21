import { useState } from "react";

export default function EditProfileModal({ profile, onClose, onUpdated }) {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  const [form, setForm] = useState({
    full_name: profile.full_name || "",
    username_handle: profile.username_handle || "",
    primary_platform: profile.primary_platform || "",
    followers_count: profile.followers_count || "",
    bio: profile.bio || "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (profileImage) {
      formData.append("profile_image", profileImage);
    }

    try {
      const res = await fetch(`${API_BASE}/creator-profile/`, {
        method: "PATCH", // ✅ IMPORTANT
        headers: {
          Authorization: `Bearer ${token}`, // ❌ no Content-Type
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }

      // ✅ re-fetch updated profile
      const profileRes = await fetch(`${API_BASE}/creator-profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedProfile = await profileRes.json();
      onUpdated(updatedProfile);
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
