// src/pages/DisputeDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function DisputeDetail() {
  const { disputeId } = useParams();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchDispute = async () => {
      try {
        const res = await fetch(`${API_BASE}/disputes/${disputeId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load dispute");
        const data = await res.json();
        setDispute(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDispute();
  }, [disputeId]);

  if (loading) return <p>Loading dispute...</p>;
  if (!dispute) return <p>Dispute not found</p>;

  return (
    <div className="dispute-page">
      <h2>⚠️ Dispute #{dispute.id}</h2>

      <div className="card">
        <p><strong>Status:</strong> {dispute.status}</p>
        <p><strong>Reason:</strong> {dispute.reason}</p>
        <p><strong>Description:</strong></p>
        <p>{dispute.description}</p>

        {dispute.evidence && (
          <a href={dispute.evidence} target="_blank" rel="noreferrer">
            📎 View Evidence
          </a>
        )}
      </div>

      <div className="card">
        <h3>Admin Notes</h3>
        <p>{dispute.admin_notes || "No admin response yet."}</p>
      </div>
    </div>
  );
}
