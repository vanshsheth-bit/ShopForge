// SHELL: NavBar — AI customizes colors, logo, links
export interface NavBarProps {
  logo: string;
  links: { label: string; href: string }[];
  ctaLabel: string;
  accentColor: string;
}

export default function NavBar({ logo, links, ctaLabel }: NavBarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="text-xl font-black">{logo}</span>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
            >
              {l.label}
            </a>
          ))}
        </div>
        <button className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
          {ctaLabel}
        </button>
      </div>
    </nav>
  );
}
