import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(false);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications/`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        setNotifications(data);
        setUnread(data.some((n) => !n.is_read));
      } catch (err) {
        console.error("Notification fetch error", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="notification-wrapper">
      <button
        className="notification-btn"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={22} color="white" />
        {unread && <span className="notification-dot" />}
      </button>

      {open && (
        <div className="notification-dropdown glass">
          <h4 className="dropdown-title">Notifications</h4>

          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${!n.is_read ? "unread" : ""}`}
              >
                <p>{n.message}</p>

                {n.data?.collaboration_id && (
                  <button
                    className="btn glass"
                    onClick={() =>
                      navigate(`/mutual/${n.data.collaboration_id}`)
                    }
                  >
                    View Collaboration →
                  </button>
                )}


                {n.data?.type === "collaboration_invite" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      className="btn glass"
                      onClick={async () => {
                        const res = await fetch(`${API_BASE}/invites/accept/`, {
                          method: "POST",
                          headers,
                          body: JSON.stringify({
                            project_id: n.data.project_id,
                            brand_id: n.data.brand_id,
                          }),
                        });
                        const data = await res.json();
                        navigate(`/mutual/${data.collaboration_id}`);
                      }}
                    >
                      Accept
                    </button>

                    <button
                      className="btn glass danger"
                      onClick={() =>
                        fetch(`${API_BASE}/invites/ignore/`, {
                          method: "POST",
                          headers,
                        })
                      }
                    >
                      Ignore
                    </button>
                  </div>
                )}
                {n.data?.type === "dispute" && (
  <button
    className="btn glass warning"
    onClick={() => navigate(`/disputes/${n.data.dispute_id}`)}
  >
    View Dispute →
  </button>
)}

              </div>
              
            ))
          ) : (
            <p className="empty-msg">No notifications</p>
          )}
        </div>
      )}
    </div>
  );
}
