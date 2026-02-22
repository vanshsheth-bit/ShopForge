export interface ProductSectionProps {
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  images: string[];
  colors: string[];
  sizes: string[];
}

export default function ProductSection({
  title,
  description,
  price,
  originalPrice,
  images,
  colors,
  sizes,
}: ProductSectionProps) {
  return (
    <section className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <img
            src={images[0]}
            alt={title}
            className="w-full rounded-2xl object-cover aspect-square mb-4"
          />
          <div className="grid grid-cols-3 gap-3">
            {images.slice(1, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="w-full rounded-xl object-cover aspect-square cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest opacity-50 mb-2">
            Home / Products
          </p>
          <h1 className="text-4xl font-black mb-4">{title}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-400">★★★★★</span>
            <span className="text-sm opacity-60">(128 reviews)</span>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black">{price}</span>
            <span className="text-lg line-through opacity-40">{originalPrice}</span>
          </div>
          <p className="leading-relaxed opacity-70 mb-8">{description}</p>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-3">Color</p>
            <div className="flex gap-2">
              {colors.map((c) => (
                <div
                  key={c}
                  className="w-8 h-8 rounded-full border-2 border-white/20 cursor-pointer"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-3">Size</p>
            <div className="flex gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  className="px-4 py-2 rounded-lg border font-bold text-sm transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full py-4 rounded-xl font-black text-lg transition-all">
            Add to Cart
          </button>
          <div className="flex gap-6 text-xs opacity-60 mt-4">
            <span>✓ Free shipping</span>
            <span>✓ Free returns</span>
            <span>✓ 2 year warranty</span>
          </div>
        </div>
      </div>
    </section>
  );
}
