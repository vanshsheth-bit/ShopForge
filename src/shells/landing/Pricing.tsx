export interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaLabel: string;
  highlighted: boolean;
}

export interface PricingProps {
  sectionLabel: string;
  heading: string;
  tiers: PricingTier[];
}

export default function Pricing({ sectionLabel, heading, tiers }: PricingProps) {
  return (
    <section className="py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3">{sectionLabel}</p>
          <h2 className="text-4xl lg:text-5xl font-black">{heading}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 transition-all duration-300 ${tier.highlighted ? 'scale-105' : ''}`}
            >
              {tier.highlighted && (
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-black mb-2">{tier.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-black">{tier.price}</span>
                <span className="opacity-60">/{tier.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl font-bold transition-all">{tier.ctaLabel}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
