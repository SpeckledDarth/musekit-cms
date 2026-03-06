import type { Metadata } from "next";
import { BlogList } from "@/src/blog";
import { getBlogListMetadata } from "@/src/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return getBlogListMetadata();
}

export default function BlogPage() {
  return <BlogList />;
}
