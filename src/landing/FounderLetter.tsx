"use client";

import Image from "next/image";

interface FounderLetterProps {
  portrait?: string;
  name: string;
  title: string;
  letter: string;
  signature?: string;
  backgroundColor?: string;
  enabled?: boolean;
}

export function FounderLetter({
  portrait,
  name,
  title,
  letter,
  signature,
  backgroundColor,
  enabled = true,
}: FounderLetterProps) {
  if (!enabled) return null;

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            {portrait && (
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={portrait}
                  alt={name}
                  fill
                  sizes="64px"
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <div>
              <h2 className="font-semibold text-lg">{name}</h2>
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
          </div>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {letter.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          {signature && (
            <div className="mt-8 relative h-12 w-48">
              <Image
                src={signature}
                alt="Signature"
                fill
                sizes="192px"
                className="dark:invert object-contain object-left"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
