import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Zap } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const SUPABASE_URL = "https://kcwshieovehgpdhahowq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjd3NoaWVvdmVoZ3BkaGFob3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODY2MDcsImV4cCI6MjA5Njg2MjYwN30.iia9Uuzzg5V7l4mG4pqbitshV7zdLjtw3JxCOJCYwD8";

type Workshop = {
  id: string;
  style: string;
  song: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  spots_left: number;
  spots_total: number;
};

export function WorkshopSpotlight() {
  const [w, setW] = useState<Workshop | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch(
      `${SUPABASE_URL}/rest/v1/workshops?active=eq.true&date=gte.${today}&order=date.asc&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) setW(data[0]);
      })
      .catch(console.error);
  }, []);

  if (!w) return null;

  const soldOut = w.spots_left === 0;

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
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--gold-muted)]">
                {w.song}
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-[var(--ivory)]">
                {w.style}
              </h3>
              <div className="mt-4 space-y-2 font-body text-sm text-[var(--ivory)]/75">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--gold)]" /> {w.date}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--gold)]" /> {w.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--gold)]" /> {w.venue},{" "}
                  {w.city}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 px-5 py-3">
                <Zap className="animate-pulse-spot h-5 w-5 text-[var(--gold-bright)]" />
                <span className="font-display text-2xl font-semibold text-[var(--gold-bright)]">
                  {soldOut ? "Sold Out" : `${w.spots_left} spots remaining`}
                </span>
              </div>
              <p className="mt-3 font-mono text-xs text-[var(--ivory)]/50">
                of {w.spots_total} total
              </p>
            </div>

            <div className="text-center md:text-right">
              <Button
                variant={soldOut ? "goldOutline" : "gold"}
                size="xl"
                onClick={() => navigate({ to: "/workshops" })}
              >
                {soldOut ? "Join Waitlist" : `Secure Your Spot — $${w.price}`}
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
