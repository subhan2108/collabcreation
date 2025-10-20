import { useEffect, useState, useRef } from "react";

export default function ChatApp() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const ws = useRef(null);

 const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  // Load logged-in user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setCurrentUser(storedUser);
  }, []);

  // Fetch all users except current
  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/chat/users/`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.filter((u) => u.id !== currentUser.id));
      } catch (err) {
        console.error("❌ Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [currentUser]);

  // Fetch chat history & setup WebSocket
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const fetchHistory = async () => {
  try {
    const res = await fetch(`${BASE_URL}/chat/history/${selectedUser.id}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch chat history");
    const data = await res.json();

    setMessages(
  data.map((msg) => ({
    text: msg.message,
    self: msg.self,  // use API-provided flag
    sender: msg.self ? "You" : msg.sender_username,
  }))
);

  } catch (err) {
    console.error("❌ Failed to fetch chat history:", err);
  }
};

    fetchHistory();

    // Setup WebSocket
    if (ws.current) ws.current.close();
    const token = localStorage.getItem("access");
    if (!token) return;

    const WS_URL = `${import.meta.env.VITE_WS_BASE_URL}/chat/${selectedUser.id}/?token=${token}`;
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("✅ WebSocket connected");
      setWsConnected(true);
    };

    ws.current.onmessage = (e) => {
  const data = JSON.parse(e.data);

  // Ignore own messages (already added locally)
  if (Number(data.sender_id) === Number(currentUser.id)) return;

  // Add incoming message to state
  setMessages((prev) => [
    ...prev,
    { text: input, self: true, sender: "You" },
  ]);
};


    ws.current.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setWsConnected(false);
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [selectedUser, currentUser]);

  // Send message
  const sendMessage = () => {
    if (!input || !selectedUser || !currentUser || !ws.current) return;

    const messageObj = {
      message: input,
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
    };

    // Send via WebSocket
    ws.current.send(JSON.stringify(messageObj));

    // Show immediately in chat
    setMessages((prev) => [
      ...prev,
      { text: input, self: true, sender: "You" },
    ]);

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-page">
      <div className="chat-section">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <h2>Chats</h2>
          {users.map((user) => (
            <div
              key={user.id}
              className={`chat-item ${selectedUser?.id === user.id ? "active" : ""}`}
              onClick={() => setSelectedUser(user)}
            >
              <div>
                <div className="name">{user.username}</div>
                <div className="message">Click to chat</div>
              </div>
              <div className="status online"></div>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="user-info">
                  <div className="avatar">
                    {selectedUser.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="username">{selectedUser.username}</div>
                    <div className="status-text">Online</div>
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`msg ${msg.self ? "self" : "other"}`}>
                    <div className={`bubble ${msg.self ? "primary" : ""}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button className="btn-primary" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat">
              <h3>Select a user to start chatting</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
