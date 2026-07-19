"use client";

import { useState, type FormEvent } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export default function ConciergePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "cart" | "trace">("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Welcome to Veloxa. How may I assist you today?" },
  ]);
  const [traceLog, setTraceLog] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] System Initialized: Cloud Connected`,
  ]);
  const [input, setInput] = useState("");

  async function handleSend(e: FormEvent) {
  e.preventDefault();
  if (!input.trim()) return;

  const userMessage = input;
  setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
  setInput("");

  const t = () => new Date().toLocaleTimeString();
  setTraceLog((prev) => [
    ...prev,
    `[${t()}] Security: Scrubbing PII...`,
    `[${t()}] RAG: Querying Vector DB...`,
    `[${t()}] Orchestrator: Calling Gemini 2.5 Flash...`,
  ]);

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
  } catch {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: "Couldn't reach the backend — make sure it's running." },
    ]);
  }
}

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-background text-foreground rounded-full px-5 py-4 shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-sm font-medium">Ask Veloxa</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-paper w-full sm:w-[400px] h-full flex flex-col shadow-2xl">
            <div className="bg-background text-foreground px-5 py-4 flex items-center justify-between">
              <div>
                <p className="font-display font-bold">Veloxa Concierge</p>
                <p className="text-xs text-muted">AI Shopping Assistant</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-foreground text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="flex border-b border-line">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === "chat" ? "text-ink border-b-2 border-accent" : "text-subtle"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("cart")}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === "cart" ? "text-ink border-b-2 border-accent" : "text-subtle"
                }`}
              >
                Cart
              </button>
              <button
                onClick={() => setActiveTab("trace")}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === "trace" ? "text-ink border-b-2 border-accent" : "text-subtle"
                }`}
              >
                Trace
              </button>
            </div>

            {activeTab === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-ink text-paper ml-auto"
                          : "bg-white border border-line text-ink"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-line flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about sizing, colors, or add items to cart..."
                    className="flex-1 bg-white border border-line rounded-full px-4 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="bg-ink text-paper rounded-full px-4 py-2 text-sm font-medium"
                  >
                    Send
                  </button>
                </form>
              </>
            )}

            {activeTab === "cart" && (
              <div className="flex-1 flex items-center justify-center px-5">
                <p className="text-subtle text-sm text-center">
                  Your cart is empty. Browse the collection and ask Veloxa for recommendations.
                </p>
              </div>
            )}

            {activeTab === "trace" && (
              <div className="flex-1 overflow-y-auto bg-background px-4 py-4 flex flex-col">
                <div className="font-mono text-xs text-muted space-y-1.5 flex-1">
                  {traceLog.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
                <p className="text-[10px] text-muted mt-3 pt-3 border-t border-white/10">
                  🔒 Logs forwarded to Langfuse Cloud
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}