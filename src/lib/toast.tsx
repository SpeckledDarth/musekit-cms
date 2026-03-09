"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-emerald-900 border-emerald-700 text-emerald-100",
  error: "bg-danger border-danger/70 text-danger-foreground",
  info: "bg-blue-900 border-blue-700 text-blue-100",
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-danger-foreground shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), toast.duration - 300);
    const removeTimer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="alert"
      className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 ${
        variantStyles[toast.variant]
      } ${isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}
    >
      {variantIcons[toast.variant]}
      <span className="text-sm flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded hover:bg-white/10 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant = "info", duration = 3000) => {
    const id = `toast-${++idCounter}-${Date.now()}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, variant, duration }]);
  }, []);

  const contextValue: ToastContextValue = {
    toast: addToast,
    success: useCallback((msg: string, dur?: number) => addToast(msg, "success", dur), [addToast]),
    error: useCallback((msg: string, dur?: number) => addToast(msg, "error", dur), [addToast]),
    info: useCallback((msg: string, dur?: number) => addToast(msg, "info", dur), [addToast]),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
