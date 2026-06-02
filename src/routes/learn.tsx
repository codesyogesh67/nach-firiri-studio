import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Lock } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { TUTORIALS, type Difficulty } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — Nach Firiri | Dance Tutorial Studio" },
      { name: "description", content: "Stream South Asian dance tutorials by difficulty and song. Free lessons plus a members library." },
      { property: "og:title", content: "Learn — Nach Firiri Tutorial Studio" },
      { property: "og:description", content: "Netflix for dance — tutorials for every level." },
    ],
  }),
  component: LearnPage,
});

const diffColor: Record<Difficulty, string> = {
  Beginner: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  Intermediate: "bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/40",
  Advanced: "bg-[var(--maroon)]/40 text-red-300 border-[var(--maroon)]",
};

function LearnPage() {
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<"All" | Difficulty>("All");

  const matches = (t: (typeof TUTORIALS)[number]) =>
    (diff === "All" || t.difficulty === diff) &&
    (t.title.toLowerCase().includes(q.toLowerCase()) || t.song.toLowerCase().includes(q.toLowerCase()));

  const free = useMemo(() => TUTORIALS.filter((t) => t.access === "FREE" && matches(t)), [q, diff]);
  const members = useMemo(() => TUTORIALS.filter((t) => t.access === "MEMBERS" && matches(t)), [q, diff]);

  return (
    <>
      <PageHero label="Tutorial Studio" title="Learn From Swastika" deva="सिक र नाच">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ivory)]/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tutorials or songs..."
              maxLength={80}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input)] py-3 pl-10 pr-4 font-body text-sm text-[var(--ivory)] outline-none placeholder:text-[var(--ivory)]/40 focus:border-[var(--gold)]"
            />
          </div>
          <div className="flex gap-2">
            {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className={cn(
                  "rounded-full border px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider transition-all",
                  diff === d ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--border)] text-[var(--ivory)]/60",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </PageHero>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16">
        <div className="mb-6 rounded-xl border border-[var(--gold)]/20 bg-[var(--card)] p-4 text-center font-body text-sm text-[var(--ivory)]/80">
          🔥 You've completed <span className="text-[var(--gold)]">3 tutorials</span> — keep the streak alive!
        </div>

        <h2 className="font-display text-3xl font-semibold text-[var(--ivory)]">Free Lessons</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {free.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <TutorialCard t={t} />
            </Reveal>
          ))}
          {free.length === 0 && <p className="text-[var(--ivory)]/50">No matches.</p>}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold text-[var(--ivory)]">Members Library</h2>
          <Button variant="gold" onClick={() => toastUnlock()}>Unlock All — $9/month</Button>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {members.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <img src={`https://i.ytimg.com/vi/${t.videoId}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover blur-md brightness-50" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-[var(--gold)]" />
                  </div>
                </div>
                <div className="px-2 pb-2 pt-4">
                  <h3 className="font-display text-xl font-semibold text-[var(--ivory)]">{t.title}</h3>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[var(--gold-muted)]">{t.difficulty} · {t.duration}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24">
        <h2 className="text-center font-display text-3xl font-semibold text-[var(--gold)]">The Community Dances</h2>
        <p className="mt-2 text-center font-body text-sm text-[var(--ivory)]/70">Student submissions from around the world</p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TUTORIALS.map((t) => (
            <div key={t.id} className="aspect-[3/4] overflow-hidden rounded-xl border border-[var(--border)]">
              <img src={`https://i.ytimg.com/vi/${t.videoId}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function TutorialCard({ t }: { t: (typeof TUTORIALS)[number] }) {
  return (
    <div className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 transition-all hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-gold)]">
      <YouTubeEmbed id={t.videoId} title={t.title} />
      <div className="px-2 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <span className={cn("rounded-full border px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider", diffColor[t.difficulty])}>{t.difficulty}</span>
          <span className="font-mono text-xs text-[var(--ivory)]/50">{t.duration}</span>
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold text-[var(--ivory)]">{t.title}</h3>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[var(--gold-muted)]">{t.song}</p>
        <Link to="/shop" className="mt-2 inline-block font-body text-xs text-[var(--gold)] underline-offset-4 hover:underline">
          👗 Wear what she wore →
        </Link>
      </div>
    </div>
  );
}

import { toast } from "sonner";
function toastUnlock() {
  toast.success("Membership coming soon — join the waitlist on the shop page! 💛");
}
