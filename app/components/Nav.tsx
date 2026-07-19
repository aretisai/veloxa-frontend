export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          VELOXA
        </span>
        <a href="#shop" className="text-sm text-muted hover:text-foreground transition-colors">
          Shop Collection
        </a>
      </div>
    </nav>
  );
}