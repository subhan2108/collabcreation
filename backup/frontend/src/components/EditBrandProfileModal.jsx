import { useState } from "react";


export default function EditBrandProfileModal({ profile, onClose, onUpdated }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("access");

  const [form, setForm] = useState({
    brand_name: profile.brand_name || "",
    industry: profile.industry || "",
    website_social: profile.website_social || "",
    description: profile.description || "",
  });

  const submit = async () => {
    const res = await fetch(`${API_BASE}/brand-profile/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) return alert("Update failed");
    onUpdated(await res.json());
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Edit Brand Profile</h3>
        <input value={form.brand_name} onChange={e=>setForm({...form,brand_name:e.target.value})}/>
        <input value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})}/>
        <input value={form.website_social} onChange={e=>setForm({...form,website_social:e.target.value})}/>
        <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <button onClick={submit}>Save</button>
      </div>
    </div>
  );
}
