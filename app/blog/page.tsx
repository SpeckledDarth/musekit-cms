import type { Metadata } from "next";
import { BlogList } from "@/src/blog";

export const metadata: Metadata = {
  title: "Blog — MuseKit",
  description: "Latest articles, tutorials, and updates from the MuseKit team.",
  openGraph: {
    title: "Blog — MuseKit",
    description: "Latest articles, tutorials, and updates from the MuseKit team.",
    type: "website",
  },
};

export default function BlogPage() {
  return <BlogList />;
}
