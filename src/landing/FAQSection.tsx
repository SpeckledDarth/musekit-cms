"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs: FAQ[];
  backgroundColor?: string;
  enabled?: boolean;
}

export function FAQSection({
  title = "Frequently Asked Questions",
  subtitle,
  faqs,
  backgroundColor,
  enabled = true,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!enabled) return null;

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-3">{subtitle}</p>}
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors"
              >
                {faq.question}
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-2",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  openIndex === i ? "max-h-96" : "max-h-0"
                )}
              >
                <p className="p-4 pt-0 text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
