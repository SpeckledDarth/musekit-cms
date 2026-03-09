"use client";

import { type CSSProperties } from "react";

interface BrandedHeaderProps {
  appName?: string;
  logoUrl?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  headerOpacity?: string;
  headerSticky?: boolean;
  headerTransparent?: boolean;
  headerBorder?: boolean;
  navLinks?: { label: string; href: string }[];
}

const defaultNavLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
];

function DefaultLogoIcon({ color }: { color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function BrandedHeader({
  appName = "MuseKit",
  logoUrl,
  headerBgColor,
  headerTextColor,
  headerOpacity = "100",
  headerSticky = true,
  headerTransparent = false,
  headerBorder = true,
  navLinks = defaultNavLinks,
}: BrandedHeaderProps) {
  const opacity = Math.min(100, Math.max(0, Number(headerOpacity) || 100)) / 100;

  const wrapperClasses = [
    "w-full z-50",
    headerSticky ? "sticky top-0" : "",
    headerBorder ? "border-b border-border" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const containerStyle: CSSProperties = {
    ...(headerTransparent
      ? { backgroundColor: "transparent" }
      : headerBgColor
        ? { backgroundColor: headerBgColor }
        : {}),
    ...(headerTextColor ? { color: headerTextColor } : {}),
    opacity,
  };

  return (
    <header
      className={`${wrapperClasses} bg-background text-foreground`}
      style={containerStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${appName} logo`}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <DefaultLogoIcon color={headerTextColor} />
              )}
              <span className="text-xl font-bold">{appName}</span>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </a>
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
