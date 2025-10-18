import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Chat({ roomName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);

  // Generate roomName if not provided
  const chatRoom = roomName || "default_room";

  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${chatRoom}/`);

    ws.current.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.message) {
        setMessages((prev) => [...prev, { text: data.message, self: false }]);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.current.close();
    };
  }, [chatRoom]);

  const sendMessage = () => {
    if (!input) return;

    // Send to WebSocket
    ws.current.send(JSON.stringify({ message: input }));
    setMessages((prev) => [...prev, { text: input, self: true }]);
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
