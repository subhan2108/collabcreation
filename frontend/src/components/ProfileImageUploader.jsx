import { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import "./Dashboard.css"


export default function ProfileImageUploader({ image, endpoint, onUpdated = () => {} }) {
  const API_ROOT =
    import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
    "http://127.0.0.1:8000";

  const token = localStorage.getItem("access");

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);



const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.crossOrigin = "anonymous";
    image.src = url;
  });

async function getCroppedImg(imageSrc, crop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], "profile.jpg", { type: "image/jpeg" }));
    }, "image/jpeg");
  });
}

  

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
    if (!preview || !croppedAreaPixels || !user) return;

    try {
      setUploading(true);

      const croppedFile = await getCroppedImg(preview, croppedAreaPixels);

      // In a real app, you'd upload to Supabase Storage first.
      // For now, we'll use a local blob URL or assume a placeholder.
      // If you want real persistence, we'll need a storage bucket named 'avatars'.
      const fileName = `${user.id}-${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, croppedFile, { upsert: true });

      let publicUrl = URL.createObjectURL(croppedFile); // Fallback

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("creator_profiles")
        .update({ profile_image: publicUrl })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      onUpdated(data.profile_image);
      setPreview(null);
      setShowConfirm(false);
    } catch (err) {
      console.error("Save Error:", err);
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
        {preview ? (
  <div className="cropper-wrapper">
    <Cropper
      image={preview}
      crop={crop}
      zoom={zoom}
      aspect={1}
      onCropChange={setCrop}
      onZoomChange={setZoom}
      onCropComplete={(_, croppedPixels) =>
        setCroppedAreaPixels(croppedPixels)
      }
    />
  </div>
) : (
  <img
    src={image || "/default-avatar.png"}
    className="profile-pic-circle"
    alt="Profile"
  />
)}


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
