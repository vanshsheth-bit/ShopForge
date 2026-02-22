export interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export interface FooterProps {
  logo: string;
  columns: FooterColumn[];
  copyright: string;
}

export default function Footer({ logo, columns, copyright }: FooterProps) {
  return (
    <footer className="py-16 px-4 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <span className="text-xl font-black mb-4 block">{logo}</span>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">
                {col.heading}
              </p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8">
          <p className="text-sm opacity-40">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
