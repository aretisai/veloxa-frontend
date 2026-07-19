export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          VELOXA<span className="text-accent">.</span>
        </span>
        <div className="flex items-center gap-8">
          
           <a  href="#collections"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Collections
          </a>
          
            <a href="#shop"
            className="text-sm bg-foreground text-background px-4 py-1.5 rounded-full hover:bg-accent transition-colors"
          >
            Shop
          </a>
        </div>
      </div>
    </nav>
  );
}