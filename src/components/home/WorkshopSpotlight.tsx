import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { WORKSHOPS } from "@/lib/site-data";
import { Calendar, Clock, MapPin, Zap } from "lucide-react";

export function WorkshopSpotlight() {
  const w = WORKSHOPS[0];
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-12">
      <Reveal>
        <p className="label-mono text-center">Next Up</p>
        <h2 className="mt-3 text-center font-display text-4xl font-semibold text-[var(--ivory)] sm:text-5xl">
          The Next Workshop
        </h2>
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-[var(--gold)]/30 bg-[var(--card)] p-8 shadow-[var(--shadow-gold)] md:p-12">
          <div className="dhaka-texture absolute inset-0 opacity-30" />
          <div className="relative grid items-center gap-8 md:grid-cols-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--gold-muted)]">{w.song}</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-[var(--ivory)]">{w.style}</h3>
              <div className="mt-4 space-y-2 font-body text-sm text-[var(--ivory)]/75">
                <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[var(--gold)]" /> {w.date}</p>
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-[var(--gold)]" /> {w.time}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--gold)]" /> {w.venue}, {w.city}</p>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 px-5 py-3">
                <Zap className="animate-pulse-spot h-5 w-5 text-[var(--gold-bright)]" />
                <span className="font-display text-2xl font-semibold text-[var(--gold-bright)]">
                  {w.spotsLeft} spots remaining
                </span>
              </div>
              <p className="mt-3 font-mono text-xs text-[var(--ivory)]/50">of {w.spotsTotal} total</p>
            </div>

            <div className="text-center md:text-right">
              <Button asChild variant="gold" size="xl">
                <a href={w.link} target="_blank" rel="noreferrer">Secure Your Spot — ${w.price}</a>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
