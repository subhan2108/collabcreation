function ShowcaseSlot({ index, image, onUpdate }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("access");

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(`image_${index}`, file);

    const res = await fetch(`${API_BASE}/brand-profile/showcase/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) return alert("Upload failed");
    onUpdate(await res.json());
  };

  return (
    <label className="showcase-slot">
      {image ? <img src={image} /> : <div className="empty-slot">+</div>}
      <input type="file" hidden onChange={upload} />
      <div className="slot-overlay">{image ? "Change" : "Upload"}</div>
    </label>
  );
}