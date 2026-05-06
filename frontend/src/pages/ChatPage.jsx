import React, { useState, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { FaBrain } from "react-icons/fa";
import api from "../services/api";
import toast from "react-hot-toast";

const QUICK = ["What are my weak subjects?", "Give me a study tip", "How does spaced repetition work?", "How is my schedule generated?"];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your AI study assistant. Ask me about your schedule, weak subjects, study tips, or anything academic! 🎓" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");

    const history = messages
      .filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0)
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const { data } = await api.post("/chat", { message: msg, history });
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch {
      toast.error("Chat unavailable");
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I'm having trouble responding right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 4rem)" }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "#EBF4FF", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <FaBrain size={20} color="#4A90D9" />
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>AI Study Assistant</div>
          <div style={{ fontSize: "0.8rem", color: "#48bb78" }}>● Online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="card" style={{ flex: 1, overflowY: "auto", marginBottom: "1rem", padding: "1rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            marginBottom: "0.75rem"
          }}>
            <div style={{
              maxWidth: "70%", padding: "0.7rem 1rem", borderRadius: 12,
              background: m.role === "user" ? "#4A90D9" : "#f7fafc",
              color: m.role === "user" ? "#fff" : "#1a202c",
              fontSize: "0.9rem", lineHeight: 1.5,
              borderBottomRightRadius: m.role === "user" ? 4 : 12,
              borderBottomLeftRadius:  m.role === "user" ? 12 : 4,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 6, padding: "0.5rem" }}>
            {[0,1,2].map((i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", background: "#4A90D9",
                animation: `bounce 1s ease ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div style={{ display: "flex", gap: 8, marginBottom: "0.75rem", flexWrap: "wrap" }}>
        {QUICK.map((q) => (
          <button key={q} onClick={() => sendMessage(q)} style={{
            padding: "0.35rem 0.85rem", borderRadius: 20, border: "1px solid #4A90D9",
            background: "#fff", color: "#4A90D9", cursor: "pointer", fontSize: "0.8rem"
          }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div className="card" style={{ display: "flex", gap: 10, padding: "0.75rem 1rem" }}>
        <input
          className="input"
          placeholder="Ask anything about your studies..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
          disabled={loading}
        />
        <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          <FiSend size={16} />
        </button>
      </div>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}
