"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  backgroundColor?: string;
  enabled?: boolean;
}

export function TestimonialCarousel({
  testimonials,
  backgroundColor,
  enabled = true,
}: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (!enabled || testimonials.length === 0) return null;

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const testimonial = testimonials[current];

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-3xl mx-auto text-center">
        <Quote className="w-10 h-10 text-primary/30 mx-auto mb-6" />
        <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          {testimonial.avatar && (
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                fill
                sizes="48px"
                className="rounded-full object-cover"
              />
            </div>
          )}
          <div className="text-left">
            <p className="font-semibold">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">
              {testimonial.role}
              {testimonial.company && `, ${testimonial.company}`}
            </p>
          </div>
        </div>

        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === current ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
