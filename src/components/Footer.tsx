import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site-data";

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12V9.79a5.67 5.67 0 0 0-.78-.05A5.68 5.68 0 1 0 15.54 15.4V9.01a7.34 7.34 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48z" />
    </svg>
  );
}
function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function YtIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.5 12 31 31 0 0 0 23 7.5zM9.8 15.3V8.7l5.7 3.3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--ink)] py-16">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-col items-center gap-6 text-center">
          <Link to="/" className="flex flex-col items-center leading-none">
            <span className="font-display text-3xl font-semibold text-[var(--ivory)]">Nach Firiri</span>
            <span className="font-mono mt-1 text-xs text-[var(--gold-muted)] tracking-widest uppercase">Dance. Feel. Belong.</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-body text-sm text-[var(--ivory)]/70">
            <Link to="/workshops" className="hover:text-[var(--gold)]">Workshops</Link>
            <Link to="/learn" className="hover:text-[var(--gold)]">Tutorials</Link>
            <Link to="/book" className="hover:text-[var(--gold)]">Book Me</Link>
            <Link to="/shop" className="hover:text-[var(--gold)]">Shop</Link>
          </nav>

          <div className="flex items-center gap-4">
            <a href={SITE.tiktok} target="_blank" rel="noreferrer" className="text-[var(--ivory)]/70 transition-colors hover:text-[var(--gold)]" aria-label="TikTok"><TikTokIcon /></a>
            <a href={SITE.instagram} target="_blank" rel="noreferrer" className="text-[var(--ivory)]/70 transition-colors hover:text-[var(--gold)]" aria-label="Instagram"><IgIcon /></a>
            <a href={SITE.youtube} target="_blank" rel="noreferrer" className="text-[var(--ivory)]/70 transition-colors hover:text-[var(--gold)]" aria-label="YouTube"><YtIcon /></a>
          </div>

          <a href={`mailto:${SITE.email}`} className="font-mono text-xs tracking-wide text-[var(--gold-muted)] hover:text-[var(--gold)]">
            {SITE.email}
          </a>

          <p className="font-mono text-xs text-[var(--ivory)]/40">© 2026 Nach Firiri</p>
        </div>
      </div>
    </footer>
  );
}
