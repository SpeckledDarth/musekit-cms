import type { Metadata } from "next";
import { LandingPageDemo } from "./components/LandingPageDemo";

export const metadata: Metadata = {
  title: "MuseKit — SaaS Platform for Creators",
  description: "MuseKit provides powerful tools for creators to build, manage, and grow their online presence. Blog, landing pages, legal pages, and marketing tools.",
  openGraph: {
    title: "MuseKit — SaaS Platform for Creators",
    description: "Powerful tools for creators to build, manage, and grow their online presence.",
    type: "website",
    siteName: "MuseKit",
  },
  twitter: {
    card: "summary",
    title: "MuseKit — SaaS Platform for Creators",
    description: "Powerful tools for creators to build, manage, and grow their online presence.",
  },
};

export default function HomePage() {
  return <LandingPageDemo />;
}
