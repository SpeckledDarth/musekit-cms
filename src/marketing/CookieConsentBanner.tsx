"use client";

import { useState, useEffect } from "react";

interface CookieConsentBannerProps {
  message?: string;
  acceptText?: string;
  declineText?: string;
  policyLink?: string;
}

export function CookieConsentBanner({
  message = "We use cookies to improve your experience. By continuing to use this site, you agree to our use of cookies.",
  acceptText = "Accept",
  declineText = "Decline",
  policyLink = "/legal/cookie-policy",
}: CookieConsentBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          {message}{" "}
          <a href={policyLink} className="text-primary underline">
            Cookie Policy
          </a>
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          >
            {declineText}
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
          >
            {acceptText}
          </button>
        </div>
      </div>
    </div>
  );
}
