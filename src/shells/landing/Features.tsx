export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesProps {
  sectionLabel: string;
  heading: string;
  features: Feature[];
}

export default function Features({ sectionLabel, heading, features }: FeaturesProps) {
  return (
    <section className="py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3">{sectionLabel}</p>
          <h2 className="text-4xl lg:text-5xl font-black">{heading}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-2"
            >
              <span className="text-4xl mb-4 block">{f.icon}</span>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="leading-relaxed opacity-70">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
