import { BlogPost } from "@/src/blog";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPost slug={params.slug} />;
}
