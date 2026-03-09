"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Lock, LogOut, Loader2 } from "lucide-react";

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const { user, loading, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !password.trim()) return;
      setSubmitting(true);
      setError(null);
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      }
      setSubmitting(false);
    };

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoFocus
                autoComplete="email"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/30 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password.trim()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{user.email}</span>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
