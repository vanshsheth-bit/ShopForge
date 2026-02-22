export interface HeroProps {
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  backgroundImage?: string;
}

export default function Hero({
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-7xl lg:text-8xl font-black mb-6">{headline}</h1>
        <p className="text-xl lg:text-2xl mb-10 max-w-2xl mx-auto">{subheadline}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="py-4 px-8 rounded-xl font-bold text-lg transition-all">
            {primaryCta}
          </button>
          <button className="py-4 px-8 rounded-xl font-bold text-lg border-2 transition-all">
            {secondaryCta}
          </button>
        </div>
      </div>
    </section>
  );
}
