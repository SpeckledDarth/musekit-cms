"use client";

interface Step {
  title: string;
  description: string;
  icon?: string;
}

interface ProcessStepsProps {
  title?: string;
  subtitle?: string;
  steps: Step[];
  backgroundColor?: string;
  enabled?: boolean;
}

export function ProcessSteps({
  title,
  subtitle,
  steps,
  backgroundColor,
  enabled = true,
}: ProcessStepsProps) {
  if (!enabled) return null;

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-5xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {title && <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>}
            {subtitle && <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{subtitle}</p>}
          </div>
        )}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />
          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold relative z-10">
                  {i + 1}
                </div>
                <div className="pt-3">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
