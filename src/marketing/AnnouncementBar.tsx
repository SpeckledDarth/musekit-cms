"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AnnouncementBarProps {
  text: string;
  link?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
  dismissible?: boolean;
  enabled?: boolean;
}

export function AnnouncementBar({
  text,
  link,
  linkText = "Learn more",
  backgroundColor,
  textColor,
  dismissible = true,
  enabled = true,
}: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || dismissed) return null;

  return (
    <div
      className="relative py-2 px-4 text-center text-sm"
      style={{
        backgroundColor: backgroundColor || "var(--primary)",
        color: textColor || "var(--primary-foreground)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span>{text}</span>
        {link && (
          <a href={link} className="underline font-medium hover:opacity-80">
            {linkText} →
          </a>
        )}
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
