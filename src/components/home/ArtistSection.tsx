import { Reveal } from "@/components/Reveal";
import { IMAGES, SITE } from "@/lib/site-data";

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12V9.79a5.67 5.67 0 0 0-.78-.05A5.68 5.68 0 1 0 15.54 15.4V9.01a7.34 7.34 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48z" />
    </svg>
  );
}

const STATS = [
  { value: "97.6K", label: "TikTok Followers" },
  { value: "2.4M", label: "Likes" },
  { value: "3", label: "Countries Toured" },
];

export function ArtistSection() {
  return (
    <section id="story" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-5 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-[var(--gold)]/10 blur-2xl" />
            <img
              src={IMAGES.portrait}
              alt="Swastika, founder of Nach Firiri"
              loading="lazy"
              className="relative w-full rounded-2xl border border-[var(--gold)]/20 object-cover shadow-[var(--shadow-deep)]"
            />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="label-mono">The Artist</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-[var(--ivory)] sm:text-5xl">
            Where Nepali Roots Meet <span className="text-gradient-gold">Global Stages</span>
          </h2>
          <div className="mt-6 space-y-4 font-body text-[var(--ivory)]/75">
            <p>
              I'm Swastika — a Nepali-American dancer, choreographer, and creator. Nach Firiri
              is my love letter to South Asian movement, fashion, and the joy of dancing freely.
            </p>
            <p>
              From NYC studios to Kathmandu stages, I teach the steps, the feeling, and the
              culture behind every beat. Whether you're a first-timer or a seasoned dancer, there's
              a place for you on this floor.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-y border-[var(--border)] py-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-semibold text-[var(--gold)]">{s.value}</p>
                <p className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--ivory)]/60">{s.label}</p>
              </div>
            ))}
          </div>

          <a
            href={SITE.tiktok}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 font-body text-sm text-[var(--ivory)] transition-colors hover:text-[var(--gold)]"
          >
            <TikTokIcon /> Follow on TikTok {SITE.tiktokHandle}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
