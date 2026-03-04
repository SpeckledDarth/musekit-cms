"use client";

import { useState } from "react";
import { getBrowserClient } from "@/src/lib/supabase";

interface WaitlistFormProps {
  title?: string;
  description?: string;
  buttonText?: string;
  successMessage?: string;
}

export function WaitlistForm({
  title = "Join the Waitlist",
  description = "Be the first to know when we launch.",
  buttonText = "Join Waitlist",
  successMessage = "You're on the list! We'll be in touch.",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.from("waitlist").insert({ email: email.trim() });
      if (error) {
        if (error.code === "23505") {
          setErrorMsg("This email is already on the waitlist!");
        } else {
          throw error;
        }
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error("Waitlist error:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6">{description}</p>

      {status === "success" ? (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
          {successMessage}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? "..." : buttonText}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="text-red-500 text-sm mt-2">{errorMsg}</p>
      )}
    </div>
  );
}
