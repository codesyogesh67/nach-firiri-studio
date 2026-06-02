import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { TUTORIALS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function TutorialsPreview() {
  const featured = TUTORIALS.slice(0, 3);
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-24">
      <Reveal>
        <p className="label-mono text-center">Tutorials</p>
        <h2 className="mt-3 text-center font-display text-4xl font-semibold text-[var(--ivory)] sm:text-5xl">
          Learn From Swastika
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {featured.map((tut, i) => (
          <Reveal key={tut.id} delay={i * 0.1}>
            <div className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 transition-all duration-300 hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-gold)]">
              <div className="relative">
                <YouTubeEmbed id={tut.videoId} title={tut.title} />
                <span
                  className={cn(
                    "absolute right-3 top-3 rounded-full px-3 py-1 font-mono text-[0.6rem] uppercase tracking-wider",
                    tut.access === "FREE"
                      ? "bg-[var(--gold-bright)] text-[var(--ink)]"
                      : "bg-[var(--maroon)] text-[var(--ivory)]",
                  )}
                >
                  {tut.access === "FREE" ? "Free" : "Members"}
                </span>
              </div>
              <div className="px-2 pb-2 pt-4">
                <h3 className="font-display text-xl font-semibold text-[var(--ivory)]">{tut.title}</h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[var(--gold-muted)]">
                  {tut.difficulty} · {tut.duration}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button asChild variant="goldOutline" size="lg">
          <Link to="/learn">Explore Full Tutorial Library</Link>
        </Button>
      </div>
    </section>
  );
}
