export interface CTABannerProps {
  headline: string;
  subtext: string;
  ctaLabel: string;
}

export default function CTABanner({ headline, subtext, ctaLabel }: CTABannerProps) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center rounded-3xl p-16">
        <h2 className="text-4xl lg:text-5xl font-black mb-4">{headline}</h2>
        <p className="text-lg mb-8 opacity-70">{subtext}</p>
        <button className="py-4 px-10 rounded-xl font-bold text-lg transition-all">
          {ctaLabel}
        </button>
      </div>
    </section>
  );
}
