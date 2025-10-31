import { useEffect, useState, useRef } from "react";

export default function ChatApp() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editInput, setEditInput] = useState("");
  const ws = useRef(null);
  const typingTimeoutRef = useRef(null);

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
    id: msg.id,
    text: msg.message,
    self: msg.self,  // use API-provided flag
    sender: msg.self ? "You" : msg.sender_username,
    edited_at: msg.edited_at,
    is_deleted: msg.is_deleted,
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

  // Handle typing indicators
  if (data.type === 'typing_start') {
    setTypingUser(data.sender_username);
    return;
  } else if (data.type === 'typing_stop') {
    setTypingUser(null);
    return;
  }

  // Handle message edits
  if (data.type === 'message_edited') {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === data.message_id
          ? { ...msg, text: data.new_message, edited_at: data.edited_at }
          : msg
      )
    );
    return;
  }

  // Handle message deletions
  if (data.type === 'message_deleted') {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === data.message_id ? { ...msg, is_deleted: true } : msg
      )
    );
    return;
  }

  // Handle user status updates
  if (data.type === 'user_online') {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === data.user_id ? { ...user, is_online: true } : user
      )
    );
    if (selectedUser && selectedUser.id === data.user_id) {
      setSelectedUser((prev) => ({ ...prev, is_online: true }));
    }
    return;
  } else if (data.type === 'user_offline') {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === data.user_id ? { ...user, is_online: false } : user
      )
    );
    if (selectedUser && selectedUser.id === data.user_id) {
      setSelectedUser((prev) => ({ ...prev, is_online: false }));
    }
    return;
  }

  // Handle messages
  // Ignore own messages (already added locally)
  if (Number(data.sender_id) === Number(currentUser.id)) return;

  // Add incoming message to state
  setMessages((prev) => [
    ...prev,
    { id: data.id, text: data.message, self: false, sender: data.sender_username, edited_at: null, is_deleted: false },
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

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    ws.current.send(JSON.stringify({ type: 'typing_stop', sender_id: currentUser.id, receiver_id: selectedUser.id }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const saveEdit = () => {
    if (!editInput.trim() || !editingMessage || !ws.current) return;

    ws.current.send(JSON.stringify({
      type: 'edit_message',
      message_id: editingMessage.id,
      new_message: editInput.trim(),
    }));

    setEditingMessage(null);
    setEditInput("");
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditInput("");
  };

  const deleteMessage = (messageId) => {
    if (!ws.current) return;

    ws.current.send(JSON.stringify({
      type: 'delete_message',
      message_id: messageId,
    }));
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
              <div className={`status ${user.is_online ? "online" : "offline"}`}></div>
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
                    <div className="status-text">{selectedUser.is_online ? "Online" : "Offline"}</div>
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className={`msg ${msg.self ? "self" : "other"} relative group`}>
                    <div className={`bubble ${msg.self ? "primary" : ""}`}>
                      {msg.is_deleted ? (
                        <em>Message deleted</em>
                      ) : (
                        <>
                          {msg.text}
                          {msg.edited_at && <small> (edited)</small>}
                        </>
                      )}
                    </div>
                    {msg.self && !msg.is_deleted && (
                      <div className="message-actions absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                        <button
                          className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                          onClick={() => {
                            setEditingMessage(msg);
                            setEditInput(msg.text);
                          }}
                          title="Edit message"
                        >
                          ✏️
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                          onClick={() => deleteMessage(msg.id)}
                          title="Delete message"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {editingMessage && (
                  <div className="edit-message">
                    <input
                      type="text"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </div>
                )}
                {typingUser && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);

                    // Send typing start
                    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                      ws.current.send(JSON.stringify({ type: 'typing_start', sender_id: currentUser.id, receiver_id: selectedUser.id }));

                      // Clear existing timeout
                      if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                      }

                      // Set timeout to stop typing after 2 seconds of inactivity
                      typingTimeoutRef.current = setTimeout(() => {
                        ws.current.send(JSON.stringify({ type: 'typing_stop', sender_id: currentUser.id, receiver_id: selectedUser.id }));
                        typingTimeoutRef.current = null;
                      }, 2000);
                    }
                  }}
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
