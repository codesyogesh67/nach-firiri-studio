import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { TikTokEmbed } from "@/components/TikTokEmbed";
import { SITE } from "@/lib/site-data";

const TIKTOKS = [
  "https://www.tiktok.com/t/ZP8sdT7Ct/",
  "https://www.tiktok.com/t/ZP8sRe7ed/",
  "https://www.tiktok.com/t/ZP8sRYF1b/",
];

export function TikTokSection() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-24">
      <Reveal>
        <p className="label-mono text-center">As Seen On TikTok</p>
        <h2 className="mt-3 text-center font-display text-4xl font-semibold text-[var(--ivory)] sm:text-5xl">
          Straight From The Feed
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {TIKTOKS.map((url, i) => (
          <Reveal key={url} delay={i * 0.1}>
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-2">
              <TikTokEmbed url={url} />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button asChild variant="gold" size="lg">
          <a href={SITE.tiktok} target="_blank" rel="noreferrer">Follow {SITE.tiktokHandle}</a>
        </Button>
      </div>
    </section>
  );
}
