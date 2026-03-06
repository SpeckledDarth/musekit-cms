"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getBrowserClient } from "@/src/lib/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FeatureSubPageProps {
  slug: string;
}

interface FeatureData {
  title: string;
  description: string;
  heroImage?: string;
  sections: {
    title: string;
    content: string;
    image?: string;
  }[];
  ctaText?: string;
  ctaLink?: string;
}

export function FeatureSubPage({ slug }: FeatureSubPageProps) {
  const [feature, setFeature] = useState<FeatureData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeature() {
      try {
        const supabase = getBrowserClient();
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .single();

        if (error) throw error;

        const meta = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
        setFeature({
          title: data.title,
          description: meta.description || "",
          heroImage: meta.heroImage,
          sections: meta.sections || [],
          ctaText: meta.ctaText,
          ctaLink: meta.ctaLink,
        });
      } catch (err) {
        console.error("Failed to fetch feature:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeature();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-muted rounded w-2/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/2 mb-8" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!feature) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Feature not found</h1>
        <Link href="/" className="text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{feature.title}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{feature.description}</p>
      </header>

      {feature.heroImage && (
        <div className="relative w-full aspect-video mb-16">
          <Image
            src={feature.heroImage}
            alt={feature.title}
            fill
            sizes="(max-width: 768px) 100vw, 1024px"
            className="rounded-xl shadow-2xl object-cover"
            priority
          />
        </div>
      )}

      <div className="space-y-20">
        {feature.sections.map((section, i) => (
          <div
            key={i}
            className={`grid md:grid-cols-2 gap-12 items-center`}
          >
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
            {section.image && (
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <div className="relative w-full aspect-video">
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="rounded-xl shadow-lg object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {feature.ctaText && (
        <div className="text-center mt-16 py-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <a
            href={feature.ctaLink || "#"}
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90"
          >
            {feature.ctaText}
          </a>
        </div>
      )}
    </div>
  );
}
