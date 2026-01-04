import { useState } from "react";

export default function EditProjectModal({ project, onClose, onUpdated }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("access");

  const [form, setForm] = useState({
    title: project.title || "",
    description: project.description || "",
    skills_required: project.skills_required || "",
    budget: project.budget || "",
    deadline: project.deadline || "",
  });

  const submit = async () => {
    const res = await fetch(`${API_BASE}/projects/${project.id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("Update failed");
      return;
    }

    const updated = await res.json();
    onUpdated(updated);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Edit Project</h3>

        <input
          placeholder="Project Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <textarea
          placeholder="Project Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <input
          placeholder="Skills Required"
          value={form.skills_required}
          onChange={(e) =>
            setForm({ ...form, skills_required: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Budget (₹)"
          value={form.budget}
          onChange={(e) =>
            setForm({ ...form, budget: e.target.value })
          }
        />

        <input
          type="date"
          value={form.deadline}
          onChange={(e) =>
            setForm({ ...form, deadline: e.target.value })
          }
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
          <button className="btn primary" onClick={submit}>
            Save Changes
          </button>
          <button className="btn outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
