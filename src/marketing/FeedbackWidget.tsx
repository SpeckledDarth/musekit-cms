"use client";

import { useState } from "react";
import { getBrowserClient } from "@/src/lib/supabase";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (npsScore === null && !message.trim()) return;

    setStatus("loading");
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.from("feedback").insert({
        nps_score: npsScore,
        message: message.trim() || null,
      });
      if (error) throw error;
      setStatus("success");
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
        setNpsScore(null);
        setMessage("");
      }, 2000);
    } catch (err) {
      console.error("Feedback error:", err);
      setStatus("error");
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Send Feedback</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {status === "success" ? (
            <div className="p-6 text-center">
              <p className="text-green-600 dark:text-green-400 font-medium">Thank you for your feedback!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  How likely are you to recommend us? (0-10)
                </label>
                <div className="flex gap-1">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNpsScore(i)}
                      className={cn(
                        "w-7 h-7 rounded text-xs font-medium transition-colors",
                        npsScore === i
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {i}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Not likely</span>
                  <span>Very likely</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading" || (npsScore === null && !message.trim())}
                className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50"
              >
                {status === "loading" ? "Sending..." : "Submit"}
              </button>
              {status === "error" && (
                <p className="text-red-500 text-xs text-center">Failed to submit. Please try again.</p>
              )}
            </form>
          )}
        </div>
      )}
    </>
  );
}
