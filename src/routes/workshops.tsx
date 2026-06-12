import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { WORKSHOPS, CITIES } from "@/lib/site-data";
import { downloadIcs } from "@/lib/ics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workshops")({
  head: () => ({
    meta: [
      { title: "Workshops — Nach Firiri | Join the Movement" },
      { name: "description", content: "Book South Asian & Bollywood dance workshops with Swastika in New York, Kathmandu, Mumbai, and online." },
      { property: "og:title", content: "Workshops — Nach Firiri" },
      { property: "og:description", content: "Join the movement. Live & virtual dance workshops." },
    ],
  }),
  component: WorkshopsPage,
});

type Booked = (typeof WORKSHOPS)[number] | null;

function WorkshopsPage() {
  const [city, setCity] = useState("All Cities");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [booked, setBooked] = useState<Booked>(null);

  const filtered = useMemo(
    () => (city === "All Cities" ? WORKSHOPS : WORKSHOPS.filter((w) => w.city === city)),
    [city],
  );

  // Add this function inside WorkshopsPage component
const handleBookNow = async (w: typeof WORKSHOPS[number]) => {
  try {
    const res = await fetch(
      "https://kcwshieovehgpdhahowq.supabase.co/functions/v1/create-checkout-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshop_id: w.id,
          workshop_name: w.style,
          workshop_date: w.date,
          price_id: "price_1ThcrxQ4li0j4IaZq7eoDSWY",
        }),
      }
    );
    const { url } = await res.json();
    window.location.href = url; // redirect to Stripe checkout
  } catch {
    toast.error("Something went wrong. Please try again.");
  }
};

  return (
    <>
      <PageHero label="Workshops" title="Join the Movement" deva="नाच फिरिरी">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all",
                city === c
                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                  : "border-[var(--border)] text-[var(--ivory)]/60 hover:border-[var(--gold)]/40 hover:text-[var(--ivory)]",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </PageHero>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24">
        <div className="mb-8 flex justify-center gap-1 rounded-full border border-[var(--border)] p-1 sm:w-fit sm:mx-auto">
          {(["list", "calendar"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-5 py-2 font-body text-sm capitalize transition-all",
                view === v ? "bg-[var(--gold)] text-[var(--ink)]" : "text-[var(--ivory)]/70",
              )}
            >
              {v} View
            </button>
          ))}
        </div>

        <div className={cn(view === "calendar" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "space-y-5")}>
          {filtered.map((w, i) => {
            const soldOut = w.spotsLeft === 0;
            const pct = Math.round(((w.spotsTotal - w.spotsLeft) / w.spotsTotal) * 100);
            return (
              <Reveal key={w.id} delay={i * 0.06}>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all duration-300 hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-gold)]">
                  <div className={cn("gap-6", view === "list" && "md:flex md:items-center md:justify-between")}>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-2xl font-semibold text-[var(--ivory)]">{w.style}</h3>
                        <span className="rounded-full border border-[var(--gold)]/30 px-3 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-[var(--gold-muted)]">{w.duration}</span>
                      </div>
                      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[var(--gold-muted)]">{w.song}</p>
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-body text-sm text-[var(--ivory)]/75">
                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[var(--gold)]" /> {w.date}</span>
                        <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[var(--gold)]" /> {w.time}</span>
                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--gold)]" /> {w.venue}, {w.city}</span>
                      </div>

                      <div className="mt-5 max-w-sm">
                        <div className="flex items-center justify-between font-mono text-xs text-[var(--ivory)]/60">
                          <span>{soldOut ? "Sold out" : `${w.spotsTotal - w.spotsLeft} of ${w.spotsTotal} spots filled`}</span>
                          <span className="text-[var(--gold)]">${w.price}</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--input)]">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="h-full rounded-full bg-[var(--gradient-gold)]"
                            style={{ background: "var(--gradient-gold)" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 shrink-0 md:mt-0">
                      {soldOut ? (
                        <Button variant="goldOutline" size="lg" onClick={() => toast.success("Added to waitlist — we'll email you if a spot opens! 💛")}>
                          Join Waitlist
                        </Button>
                      ) : (
                        <Button variant="gold" size="lg" onClick={() => handleBookNow(w)}>
                          Book Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <Dialog open={!!booked} onOpenChange={(o) => !o && setBooked(null)}>
        <DialogContent className="border-[var(--gold)]/40 bg-[var(--card)]">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)]/15">
              <CheckCircle2 className="h-8 w-8 text-[var(--gold)]" />
            </div>
            <DialogTitle className="text-center font-display text-2xl text-[var(--ivory)]">You're in! See you on the floor 💃</DialogTitle>
            <DialogDescription className="text-center text-[var(--ivory)]/70">
              {booked && `${booked.style} · ${booked.date} · ${booked.venue}, ${booked.city}`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex justify-center">
            <Button variant="goldOutline" onClick={() => booked && downloadIcs(booked)}>
              <Calendar className="h-4 w-4" /> Add to Calendar (.ics)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
