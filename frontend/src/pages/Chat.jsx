import { useEffect, useState, useRef } from "react";
import axios from "axios"; // Make sure axios is installed

export default function Chat({ userId, receiverId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);

  const chatRoom = `chat_${Math.min(userId, receiverId)}_${Math.max(userId, receiverId)}`;

  useEffect(() => {
    // Fetch chat history
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/chat/history/${receiverId}/`, {
          withCredentials: true // include cookies if using session auth
        });
        setMessages(
          res.data.map((msg) => ({
            text: msg.message,
            self: msg.sender_id === userId,
            sender: msg.sender_username,
            receiver: msg.receiver_username,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    fetchHistory();

    // Connect to WebSocket
    ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${receiverId}/`);

    ws.current.onopen = () => console.log("Connected to WebSocket");
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.message) {
        setMessages((prev) => [
          ...prev,
          {
            text: data.message,
            self: data.sender_id === userId,
            sender: data.sender_username,
            receiver: data.receiver_username,
          },
        ]);
      }
    };

    ws.current.onclose = () => console.log("WebSocket disconnected");

    return () => ws.current.close();
  }, [receiverId, userId]);

  const sendMessage = () => {
    if (!input) return;

    ws.current.send(
      JSON.stringify({ message: input, sender_id: userId, receiver_id: receiverId })
    );

    setMessages((prev) => [...prev, { text: input, self: true, sender: "You", receiver: "Them" }]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-page">
      <section className="chat-section">
        <div className="chat-window glass">
          <div className="chat-header">
            <h2>Room: {chatRoom}</h2>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.self ? "self" : "other"}`}>
                <div className={`bubble ${msg.self ? "primary" : ""}`}>
                  <strong>{msg.self ? "You" : msg.sender}: </strong>
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
              onKeyPress={handleKeyPress}
            />
            <button className="btn-primary" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
