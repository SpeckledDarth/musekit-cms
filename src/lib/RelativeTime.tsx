"use client";

import { useState, useEffect } from "react";

interface RelativeTimeProps {
  date: string | Date;
  className?: string;
}

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365.25 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30.44 * 24 * 60 * 60 * 1000 },
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
];

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);

  if (absDiff < 10000) return "just now";

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const { unit, ms } of UNITS) {
    if (absDiff >= ms || unit === "second") {
      const value = Math.round(diff / ms);
      return rtf.format(value, unit);
    }
  }

  return "just now";
}

function formatAbsolute(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const [relative, setRelative] = useState(() => getRelativeTime(dateObj));

  useEffect(() => {
    setRelative(getRelativeTime(dateObj));
    const interval = setInterval(() => {
      setRelative(getRelativeTime(dateObj));
    }, 60000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <span className={className} title={formatAbsolute(dateObj)}>
      {relative}
    </span>
  );
}
