"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import type { Recommendation } from "./CatalogGrid";

interface Message {
  role: "user" | "assistant";
  text: string;
  escalate?: boolean;
}

interface CartItem {
  name: string;
  price: number;
}

interface SelectedImage {
  base64: string;
  mimeType: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function ConciergePanel({
  onRecommendations,
  onCartChange,
}: {
  onRecommendations: (recs: Recommendation[]) => void;
  onCartChange?: (count: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "cart" | "trace">("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Welcome to Veloxa. How may I assist you today?" },
  ]);
  const [traceLog, setTraceLog] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] System Initialized: Cloud Connected`,
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => crypto.randomUUID());
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    onCartChange?.(cart.length);
  }, [cart, onCartChange]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setSelectedImage({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMessage = input.trim() || "Find shoes like this.";
    const history = messages;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    const imageToSend = selectedImage;
    setSelectedImage(null);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history,
          session_id: sessionId,
          image_base64: imageToSend?.base64 ?? null,
          image_mime_type: imageToSend?.mimeType ?? null,
        }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply, escalate: data.escalate },
      ]);

      if (data.trace_log) {
        setTraceLog((prev) => [...prev, ...data.trace_log]);
      }
      if (data.cart_actions && data.cart_actions.length > 0) {
        setCart((prev) => [...prev, ...data.cart_actions]);
      }
      if (data.recommendations && data.recommendations.length > 0) {
        onRecommendations(data.recommendations);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Couldn't reach the backend — make sure it's running." },
      ]);
    }
  }

  function handleCheckout() {
    setCheckoutMessage("Redirecting to payment gateway...");
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
          {cart.length > 0 && (
            <span className="bg-accent text-background text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} />

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
                className={`flex-1 py-3 text-sm font-medium ${activeTab === "chat" ? "text-ink border-b-2 border-accent" : "text-subtle"}`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("cart")}
                className={`flex-1 py-3 text-sm font-medium ${activeTab === "cart" ? "text-ink border-b-2 border-accent" : "text-subtle"}`}
              >
                Cart {cart.length > 0 && `(${cart.length})`}
              </button>
              <button
                onClick={() => setActiveTab("trace")}
                className={`flex-1 py-3 text-sm font-medium ${activeTab === "trace" ? "text-ink border-b-2 border-accent" : "text-subtle"}`}
              >
                Trace
              </button>
            </div>

            {activeTab === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i}>
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                          msg.role === "user" ? "bg-ink text-paper ml-auto" : "bg-white border border-line text-ink"
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.escalate && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg px-3 py-2 max-w-[80%]">
                          This requires human assistance.{" "}
                          <a href="mailto:support@veloxa.com" className="underline font-medium">
                            Email Support
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedImage && (
                  <div className="px-4 pt-3 flex items-center gap-2">
                    <img
                      src={`data:${selectedImage.mimeType};base64,${selectedImage.base64}`}
                      alt="Selected"
                      className="w-12 h-12 rounded-lg object-cover border border-line"
                    />
                    <span className="text-xs text-subtle">Image ready to send</span>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="ml-auto text-subtle hover:text-ink text-lg leading-none"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="p-4 border-t border-line flex gap-2 items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-subtle hover:text-ink shrink-0"
                    aria-label="Upload image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about sizing, colors, or add items to cart..."
                    className="flex-1 bg-white border border-line rounded-full px-4 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                  />
                  <button type="submit" className="bg-ink text-paper rounded-full px-4 py-2 text-sm font-medium shrink-0">
                    Send
                  </button>
                </form>
              </>
            )}

            {activeTab === "cart" && (
              <div className="flex-1 flex flex-col px-5 py-4">
                {cart.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-subtle text-sm text-center">
                      Your cart is empty. Browse the collection and ask Veloxa for recommendations.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-2">
                      {cart.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-ink">
                          <span>{item.name}</span>
                          <span className="font-semibold">${item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-line pt-3 mt-3">
                      <div className="flex justify-between font-bold text-ink mb-3">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-ink text-paper rounded-full py-2 text-sm font-medium"
                      >
                        Secure Checkout
                      </button>
                      {checkoutMessage && (
                        <p className="text-xs text-subtle text-center mt-2">{checkoutMessage}</p>
                      )}
                    </div>
                  </>
                )}
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