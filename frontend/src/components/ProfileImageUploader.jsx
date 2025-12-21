import { useState, useEffect } from "react";

export default function ProfileImageUploader({ image, onUpdated = () => {} }) {
  const API_ROOT =
    import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
    "http://127.0.0.1:8000";

  const token = localStorage.getItem("access");

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  

  // 🔑 when parent updates image, clear preview safely
  useEffect(() => {
    if (image && preview) {
      setPreview(null);
      setSelectedFile(null);
      setShowConfirm(false);
    }
  }, [image]); // eslint-disable-line

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setShowConfirm(true);
  };

  const handleSave = async () => {
  if (!selectedFile) return;

  const formData = new FormData();
  formData.append("profile_image", selectedFile);

  try {
    setUploading(true);

    const res = await fetch(
  `${API_ROOT}/api/creator-profile/image/`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }
);

const data = await res.json();

// Cloudinary URL – use directly
onUpdated(data.profile_image);
console.log("🟢 IMAGE UPLOADED URL:", data.profile_image);


  } catch (err) {
    alert("❌ Failed to save image");
  } finally {
    setUploading(false);
  }
};


  const handleDiscard = () => {
    setSelectedFile(null);
    setPreview(null);
    setShowConfirm(false);
  };

  return (
    <div className="profile-pic-uploader">
      <label className="profile-pic-label">
        <img
          src={preview || image || "/default-avatar.png"}
          alt="Profile"
          className="profile-pic-large"
        />

        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleSelect}
        />

        <div className="overlay">Change Photo</div>
      </label>

      {showConfirm && (
        <div className="confirm-popup">
          <p>Save this profile photo?</p>
          <div className="actions">
            <button
              className="btn save"
              onClick={handleSave}
              disabled={uploading}
            >
              {uploading ? "Saving..." : "Save"}
            </button>
            <button className="btn cancel" onClick={handleDiscard}>
              Don’t Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
