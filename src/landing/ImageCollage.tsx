"use client";

interface ImageCollageProps {
  images: { src: string; alt: string }[];
  backgroundColor?: string;
  enabled?: boolean;
}

export function ImageCollage({
  images,
  backgroundColor,
  enabled = true,
}: ImageCollageProps) {
  if (!enabled || images.length === 0) return null;

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center items-center relative h-80 md:h-96">
          {images.slice(0, 5).map((img, i) => {
            const rotation = (i - Math.floor(images.length / 2)) * 8;
            const offset = (i - Math.floor(images.length / 2)) * 60;
            return (
              <div
                key={i}
                className="absolute w-48 md:w-64 transition-all duration-300 hover:z-30 hover:scale-110 hover:rotate-0 cursor-pointer"
                style={{
                  transform: `translateX(${offset}px) rotate(${rotation}deg)`,
                  zIndex: i + 1,
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-48 md:h-64 object-cover rounded-xl shadow-xl border-4 border-white dark:border-gray-800"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
