import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Clock, MapPin, ChevronRight } from "lucide-react";

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

export function PaymentModal({
  workshop,
  onClose,
}: {
  workshop: Workshop;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            workshop_id: workshop.id,
            workshop_name: workshop.style,
            workshop_date: workshop.date,
            price_id: workshop.price_id,
          }),
        }
      );
      const data = await res.json();
      if (!data.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (e) {
      setError("Could not start checkout. Please try again.");
      setLoading(false);
    }
  }, [workshop]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{ background: "oklch(0 0 0 / 75%)", backdropFilter: "blur(6px)" }}
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
        style={{
          background: "oklch(0.14 0.009 30)",
          border: "1px solid oklch(0.28 0.02 40 / 60%)",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -4px 80px oklch(0 0 0 / 70%), 0 0 0 1px oklch(0.74 0.11 85 / 8%)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Drag pill (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ background: "oklch(0.35 0.02 40)" }} />
        </div>

        {/* Header */}
        <div
          className="flex items-start justify-between px-6 pt-4 pb-5"
          style={{ borderBottom: "1px solid oklch(0.28 0.02 40 / 50%)" }}
        >
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-widest" style={{ color: "oklch(0.74 0.11 85)" }}>
              Reserve Your Spot
            </p>
            <h2 className="text-2xl font-semibold leading-tight" style={{ fontFamily: "Cormorant Garamond, serif", color: "oklch(0.95 0.018 80)" }}>
              {workshop.style}
            </h2>
            {workshop.song && (
              <p className="mt-0.5 text-sm" style={{ color: "oklch(0.62 0.06 80)" }}>
                ♪ {workshop.song}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 transition-colors hover:bg-white/5"
            style={{ color: "oklch(0.62 0.06 80)" }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workshop details */}
        <div
          className="flex flex-wrap gap-x-5 gap-y-2 px-6 py-4"
          style={{ borderBottom: "1px solid oklch(0.28 0.02 40 / 50%)", background: "oklch(0.16 0.01 30)" }}
        >
          {[
            { icon: Calendar, text: workshop.date },
            { icon: Clock, text: workshop.time },
            { icon: MapPin, text: `${workshop.venue}, ${workshop.city}` },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 font-body text-xs" style={{ color: "oklch(0.80 0.018 80)" }}>
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: "oklch(0.74 0.11 85)" }} />
              {text}
            </span>
          ))}
        </div>

        {/* Price summary */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid oklch(0.28 0.02 40 / 50%)" }}>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "oklch(0.62 0.06 80)" }}>
              Workshop Fee
            </p>
            <p className="mt-0.5 text-sm" style={{ color: "oklch(0.95 0.018 80)" }}>
              1 spot · {workshop.duration}
            </p>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: "Cormorant Garamond, serif", color: "oklch(0.81 0.14 88)" }}>
            ${workshop.price}
          </p>
        </div>

        {/* CTA */}
        <div className="px-6 py-6 space-y-4">
          {error && (
            <p className="rounded-lg px-4 py-3 text-sm text-center" style={{ background: "oklch(0.65 0.22 27 / 10%)", border: "1px solid oklch(0.65 0.22 27 / 30%)", color: "oklch(0.78 0.18 27)" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl py-4 text-sm font-semibold transition-all disabled:opacity-60"
            style={{
              background: loading
                ? "oklch(0.62 0.09 82)"
                : "linear-gradient(135deg, oklch(0.81 0.14 88), oklch(0.66 0.09 78))",
              color: "oklch(0.13 0.008 30)",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Redirecting to checkout…
                </>
              ) : (
                <>Pay ${workshop.price} · Secure Checkout</>
              )}
            </span>
            {!loading && (
              <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-full" aria-hidden />
            )}
          </button>

          <p className="text-center font-mono text-[11px] uppercase tracking-wider" style={{ color: "oklch(0.62 0.06 80)" }}>
            🔒 Encrypted · Powered by Stripe · {workshop.spots_left} spot{workshop.spots_left !== 1 ? "s" : ""} remaining
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
