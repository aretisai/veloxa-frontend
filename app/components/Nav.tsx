const NAV_CATEGORIES = ["All", "Road Running", "Trail Running", "Track & Field", "Lifestyle"];

export default function Nav({
  cartCount = 0,
  category,
  onCategoryChange,
}: {
  cartCount?: number;
  category: string;
  onCategoryChange: (cat: string) => void;
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <span className="font-display text-lg font-bold tracking-tight text-foreground shrink-0">
          VELOXA<span className="text-accent">.</span>
        </span>

        <div className="hidden md:flex items-center gap-6">
          {NAV_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`text-xs tracking-[0.1em] uppercase transition-colors ${
                category === cat ? "text-accent font-semibold" : "text-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <a href="#shop" className="text-sm bg-foreground text-background px-4 py-1.5 rounded-full hover:bg-accent transition-colors">
            Shop
          </a>
          {cartCount > 0 && (
            <span className="text-xs tracking-[0.15em] uppercase bg-accent text-background font-bold px-3 py-1.5 rounded-full">
              {cartCount} in bag
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}