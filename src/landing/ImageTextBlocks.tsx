"use client";

import Image from "next/image";

interface Block {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
}

interface ImageTextBlocksProps {
  blocks: Block[];
  backgroundColor?: string;
  enabled?: boolean;
}

export function ImageTextBlocks({
  blocks,
  backgroundColor,
  enabled = true,
}: ImageTextBlocksProps) {
  if (!enabled) return null;

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-6xl mx-auto space-y-20">
        {blocks.map((block, i) => (
          <div
            key={i}
            className={`grid md:grid-cols-2 gap-12 items-center ${
              i % 2 === 1 ? "md:direction-rtl" : ""
            }`}
          >
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">{block.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{block.description}</p>
            </div>
            <div className={i % 2 === 1 ? "md:order-1" : ""}>
              <div className="relative w-full aspect-video">
                <Image
                  src={block.image}
                  alt={block.imageAlt || block.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="rounded-lg shadow-lg object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
