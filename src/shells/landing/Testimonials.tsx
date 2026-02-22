export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export interface TestimonialsProps {
  sectionLabel: string;
  heading: string;
  testimonials: Testimonial[];
}

export default function Testimonials({ sectionLabel, heading, testimonials }: TestimonialsProps) {
  return (
    <section className="py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3">{sectionLabel}</p>
          <h2 className="text-4xl lg:text-5xl font-black">{heading}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border p-8 transition-all duration-300">
              <div className="text-amber-400 text-lg mb-4">★★★★★</div>
              <p className="italic mb-6 leading-relaxed opacity-80">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs opacity-60">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
