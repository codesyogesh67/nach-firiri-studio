import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Sparkles,
} from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { CITIES } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/PaymentModal";
import { WaitlistModal } from "@/components/WaitlistModal";

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
  duration: string;
  price: number;
  spots_left: number;
  spots_total: number;
  price_id: string;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// ─── Workshop Day Modal ───────────────────────────────────────────────────────

function DayModal({
  day,
  month,
  year,
  workshops,
  onClose,
  onBook,
  onWaitlist,
}: {
  day: number;
  month: number;
  year: number;
  workshops: Workshop[];
  onClose: () => void;
  onBook: (w: Workshop) => void;
  onWaitlist: (w: Workshop) => void;
}) {
  // Close on backdrop click
  const backdropRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const dateLabel = `${MONTH_NAMES[month]} ${day}, ${year}`;

  return (
    <AnimatePresence>
      <motion.div
        ref={backdropRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === backdropRef.current) onClose();
        }}
        style={{
          background: "oklch(0.13 0.008 30 / 0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <motion.div
          className="relative w-full max-w-xl overflow-hidden rounded-3xl"
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          style={{
            background: "var(--card)",
            border: "1px solid oklch(0.74 0.11 85 / 0.2)",
            boxShadow:
              "0 0 0 1px oklch(0.74 0.11 85 / 0.12), 0 40px 80px -20px oklch(0 0 0 / 0.7), 0 0 80px -20px oklch(0.74 0.11 85 / 0.08)",
          }}
        >
          {/* Gold shimmer top bar */}
          <div
            className="h-px w-full"
            style={{ background: "var(--gradient-gold)", opacity: 0.6 }}
          />

          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-6 pb-5">
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--gold-muted)]">
                Workshops
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-[var(--ivory)]">
                {dateLabel}
              </h2>
              <p className="mt-0.5 font-body text-sm text-[var(--ivory)]/50">
                {workshops.length === 1
                  ? "1 workshop scheduled"
                  : `${workshops.length} workshops scheduled`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--ivory)]/40 transition hover:border-[var(--gold)]/40 hover:text-[var(--ivory)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Workshop cards */}
          <div className="max-h-[60vh] overflow-y-auto px-7 pb-7 space-y-4">
            {workshops.map((w, i) => {
              const soldOut = w.spots_left === 0;
              const pct = Math.round(
                ((w.spots_total - w.spots_left) / w.spots_total) * 100
              );
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: "oklch(0.13 0.008 30 / 0.6)",
                    border: soldOut
                      ? "1px solid oklch(0.55 0.2 27 / 0.25)"
                      : "1px solid oklch(0.74 0.11 85 / 0.15)",
                  }}
                >
                  {/* Title row */}
                  <div className="flex flex-wrap items-start gap-2">
                    <h3 className="font-display text-xl font-semibold leading-tight text-[var(--ivory)]">
                      {w.style}
                    </h3>
                    <span
                      className="mt-0.5 rounded-full px-2.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider"
                      style={{
                        background: "oklch(0.74 0.11 85 / 0.1)",
                        border: "1px solid oklch(0.74 0.11 85 / 0.25)",
                        color: "var(--gold-muted)",
                      }}
                    >
                      {w.duration}
                    </span>
                    {soldOut && (
                      <span
                        className="mt-0.5 rounded-full px-2.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider"
                        style={{
                          background: "oklch(0.55 0.2 27 / 0.1)",
                          border: "1px solid oklch(0.55 0.2 27 / 0.3)",
                          color: "oklch(0.75 0.15 27)",
                        }}
                      >
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Song */}
                  <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-[var(--gold-muted)]/70">
                    {w.song}
                  </p>

                  {/* Meta */}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-body text-sm text-[var(--ivory)]/65">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[var(--gold)]/70" />{" "}
                      {w.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[var(--gold)]/70" />{" "}
                      {w.venue}, {w.city}
                    </span>
                  </div>

                  {/* Spots bar + price */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between font-mono text-xs text-[var(--ivory)]/50">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        {soldOut
                          ? "Fully booked"
                          : `${w.spots_total - w.spots_left} / ${
                              w.spots_total
                            } spots filled`}
                      </span>
                      <span
                        style={{ color: "var(--gold)" }}
                        className="font-semibold"
                      >
                        ${w.price}
                      </span>
                    </div>
                    <div
                      className="mt-2 h-1 overflow-hidden rounded-full"
                      style={{ background: "oklch(0.24 0.015 35)" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: i * 0.07 + 0.2 }}
                        className="h-full rounded-full"
                        style={{
                          background: soldOut
                            ? "oklch(0.65 0.15 27)"
                            : "var(--gradient-gold)",
                        }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4">
                    {soldOut ? (
                      <Button
                        variant="goldOutline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          onClose();
                          onWaitlist(w);
                        }}
                      >
                        Join Waitlist
                      </Button>
                    ) : (
                      <Button
                        variant="gold"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          onClose();
                          onBook(w);
                        }}
                      >
                        Book Now — ${w.price}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────

function CalendarView({
  workshops,
  onBook,
  onWaitlist,
}: {
  workshops: Workshop[];
  onBook: (w: Workshop) => void;
  onWaitlist: (w: Workshop) => void;
}) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [modalDay, setModalDay] = useState<number | null>(null);

  // "YYYY-MM-DD" → Workshop[]
  const workshopsByDate = useMemo(() => {
    const map: Record<string, Workshop[]> = {};
    workshops.forEach((w) => {
      const parsed = new Date(w.date);
      if (isNaN(parsed.getTime())) return;
      const key = parsed.toISOString().split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(w);
    });
    return map;
  }, [workshops]);

  const { daysInMonth, firstDayOfWeek } = useMemo(() => {
    return {
      firstDayOfWeek: new Date(calYear, calMonth, 1).getDay(),
      daysInMonth: new Date(calYear, calMonth + 1, 0).getDate(),
    };
  }, [calYear, calMonth]);

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
    setModalDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
    setModalDay(null);
  };

  const modalKey = modalDay
    ? `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(
        modalDay
      ).padStart(2, "0")}`
    : null;
  const modalWorkshops = modalKey ? workshopsByDate[modalKey] ?? [] : [];

  // Count workshops in this month for the mini stats
  const monthWorkshopCount = useMemo(() => {
    return Object.entries(workshopsByDate)
      .filter(([key]) =>
        key.startsWith(`${calYear}-${String(calMonth + 1).padStart(2, "0")}`)
      )
      .reduce((acc, [, ws]) => acc + ws.length, 0);
  }, [workshopsByDate, calYear, calMonth]);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Month nav + stats row */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <button
          onClick={prevMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--ivory)]/50 transition-all hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-[var(--ivory)] tracking-wide">
            {MONTH_NAMES[calMonth]}
          </h2>
          <div className="mt-0.5 flex items-center justify-center gap-3">
            <span className="font-mono text-xs text-[var(--ivory)]/35 tracking-widest">
              {calYear}
            </span>
            {monthWorkshopCount > 0 && (
              <>
                <span className="h-px w-3 bg-[var(--border)]" />
                <span className="flex items-center gap-1 font-mono text-xs text-[var(--gold-muted)]">
                  <Sparkles className="h-2.5 w-2.5" />
                  {monthWorkshopCount} workshop
                  {monthWorkshopCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={nextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--ivory)]/50 transition-all hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-2">
        {DAY_NAMES_SHORT.map((d) => (
          <div
            key={d}
            className="text-center font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[var(--ivory)]/25 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty leading cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`e-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = `${calYear}-${String(calMonth + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          const dayWorkshops = workshopsByDate[key] ?? [];
          const hasWorkshop = dayWorkshops.length > 0;
          const allSoldOut =
            hasWorkshop && dayWorkshops.every((w) => w.spots_left === 0);
          const isToday =
            day === today.getDate() &&
            calMonth === today.getMonth() &&
            calYear === today.getFullYear();

          return (
            <motion.button
              key={day}
              whileHover={hasWorkshop ? { scale: 1.04 } : {}}
              whileTap={hasWorkshop ? { scale: 0.97 } : {}}
              onClick={() => hasWorkshop && setModalDay(day)}
              disabled={!hasWorkshop}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-2xl border transition-all duration-200",
                !hasWorkshop && "cursor-default",
                hasWorkshop &&
                  !allSoldOut &&
                  "cursor-pointer hover:shadow-[var(--shadow-gold)]",
                hasWorkshop && !allSoldOut
                  ? "border-[var(--gold)]/30 bg-[var(--gold)]/5"
                  : allSoldOut
                  ? "border-[oklch(0.55_0.2_27)]/25 bg-[oklch(0.55_0.2_27)]/5"
                  : "border-[var(--border)] bg-[var(--card)]/30"
              )}
            >
              {/* Glow ring for today */}
              {isToday && (
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: "inset 0 0 0 1.5px oklch(0.74 0.11 85 / 0.7)",
                  }}
                />
              )}

              {/* Day number */}
              <span
                className={cn(
                  "font-mono text-sm leading-none transition-colors",
                  isToday
                    ? "font-bold text-[var(--gold)]"
                    : hasWorkshop && !allSoldOut
                    ? "font-medium text-[var(--ivory)]"
                    : allSoldOut
                    ? "text-[var(--ivory)]/40"
                    : "text-[var(--ivory)]/20"
                )}
              >
                {day}
              </span>

              {/* Workshop indicator */}
              {hasWorkshop && (
                <div className="mt-1.5 flex items-center gap-0.5">
                  {dayWorkshops.slice(0, 3).map((w, idx) => (
                    <span
                      key={idx}
                      className="block rounded-full"
                      style={{
                        width: "5px",
                        height: "5px",
                        background:
                          w.spots_left === 0
                            ? "oklch(0.65 0.15 27 / 0.7)"
                            : "var(--gold)",
                      }}
                    />
                  ))}
                  {dayWorkshops.length > 3 && (
                    <span className="font-mono text-[0.45rem] text-[var(--gold)]/60">
                      +{dayWorkshops.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Count badge for multiple */}
              {dayWorkshops.length > 1 && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full font-mono text-[0.5rem] font-bold"
                  style={{
                    background: "var(--gold)",
                    color: "var(--ink)",
                  }}
                >
                  {dayWorkshops.length}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
        <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--ivory)]/30">
          <span className="block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          Available
        </span>
        <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--ivory)]/30">
          <span
            className="block h-1.5 w-1.5 rounded-full"
            style={{ background: "oklch(0.65 0.15 27 / 0.7)" }}
          />
          Sold Out
        </span>
        <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--ivory)]/30">
          <span
            className="block h-4 w-4 rounded-md"
            style={{ boxShadow: "inset 0 0 0 1.5px oklch(0.74 0.11 85 / 0.7)" }}
          />
          Today
        </span>
      </div>

      {/* Day modal */}
      <AnimatePresence>
        {modalDay !== null && (
          <DayModal
            key={`${calYear}-${calMonth}-${modalDay}`}
            day={modalDay}
            month={calMonth}
            year={calYear}
            workshops={modalWorkshops}
            onClose={() => setModalDay(null)}
            onBook={onBook}
            onWaitlist={onWaitlist}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/workshops")({
  head: () => ({
    meta: [
      { title: "Workshops — Nach Firiri | Join the Movement" },
      {
        name: "description",
        content:
          "Book South Asian & Bollywood dance workshops with Swastika in New York, Kathmandu, Mumbai, and online.",
      },
      { property: "og:title", content: "Workshops — Nach Firiri" },
      {
        property: "og:description",
        content: "Join the movement. Live & virtual dance workshops.",
      },
    ],
  }),
  component: WorkshopsPage,
});

function WorkshopsPage() {
  const [city, setCity] = useState("All Cities");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingWorkshop, setPayingWorkshop] = useState<Workshop | null>(null);
  const [waitlistWorkshop, setWaitlistWorkshop] = useState<Workshop | null>(
    null
  );

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/workshops?active=eq.true&order=date.asc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setWorkshops(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Could not load workshops.");
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(
    () =>
      city === "All Cities"
        ? workshops
        : workshops.filter((w) => w.city === city),
    [city, workshops]
  );

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
                  : "border-[var(--border)] text-[var(--ivory)]/60 hover:border-[var(--gold)]/40 hover:text-[var(--ivory)]"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </PageHero>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24">
        {/* View toggle */}
        <div className="mb-10 flex justify-center gap-1 rounded-full border border-[var(--border)] p-1 sm:w-fit sm:mx-auto">
          {(["list", "calendar"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-5 py-2 font-body text-sm capitalize transition-all",
                view === v
                  ? "bg-[var(--gold)] text-[var(--ink)]"
                  : "text-[var(--ivory)]/70"
              )}
            >
              {v} View
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 font-mono text-sm text-[var(--ivory)]/50">
            Loading workshops...
          </div>
        ) : view === "calendar" ? (
          <CalendarView
            workshops={filtered}
            onBook={setPayingWorkshop}
            onWaitlist={setWaitlistWorkshop}
          />
        ) : (
          /* LIST VIEW */
          <div className="space-y-5">
            {filtered.map((w, i) => {
              const soldOut = w.spots_left === 0;
              const pct = Math.round(
                ((w.spots_total - w.spots_left) / w.spots_total) * 100
              );
              return (
                <Reveal key={w.id} delay={i * 0.06}>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all duration-300 hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-gold)]">
                    <div className="gap-6 md:flex md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-2xl font-semibold text-[var(--ivory)]">
                            {w.style}
                          </h3>
                          <span className="rounded-full border border-[var(--gold)]/30 px-3 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-[var(--gold-muted)]">
                            {w.duration}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[var(--gold-muted)]">
                          {w.song}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-body text-sm text-[var(--ivory)]/75">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[var(--gold)]" />{" "}
                            {w.date}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[var(--gold)]" />{" "}
                            {w.time}
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[var(--gold)]" />{" "}
                            {w.venue}, {w.city}
                          </span>
                        </div>
                        <div className="mt-5 max-w-sm">
                          <div className="flex items-center justify-between font-mono text-xs text-[var(--ivory)]/60">
                            <span>
                              {soldOut
                                ? "Sold out"
                                : `${w.spots_total - w.spots_left} of ${
                                    w.spots_total
                                  } spots filled`}
                            </span>
                            <span className="text-[var(--gold)]">
                              ${w.price}
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--input)]">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1 }}
                              className="h-full rounded-full"
                              style={{ background: "var(--gradient-gold)" }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 shrink-0 md:mt-0">
                        {soldOut ? (
                          <Button
                            variant="goldOutline"
                            size="lg"
                            onClick={() => setWaitlistWorkshop(w)}
                          >
                            Join Waitlist
                          </Button>
                        ) : (
                          <Button
                            variant="gold"
                            size="lg"
                            onClick={() => setPayingWorkshop(w)}
                          >
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
        )}
      </section>

      {payingWorkshop && (
        <PaymentModal
          workshop={payingWorkshop}
          onClose={() => setPayingWorkshop(null)}
        />
      )}
      {waitlistWorkshop && (
        <WaitlistModal
          workshop={waitlistWorkshop}
          onClose={() => setWaitlistWorkshop(null)}
        />
      )}
    </>
  );
}
