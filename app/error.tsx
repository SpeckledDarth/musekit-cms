"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8 bg-background text-foreground">
      <div className="text-center max-w-lg">
        <p className="text-lg font-bold text-primary mb-6">MuseKit</p>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          An unexpected error occurred. Please try again.
        </p>
        {isDev && error && (
          <pre className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 p-4 rounded-lg text-xs text-left overflow-auto mb-6 whitespace-pre-wrap break-words border border-red-200 dark:border-red-800">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-2 bg-muted text-foreground border border-border rounded-md font-medium hover:bg-muted/80 transition-colors no-underline"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
