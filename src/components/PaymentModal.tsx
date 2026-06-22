import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import {
  loadStripe,
  type StripeElementsOptions,
  type Appearance,
} from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SUPABASE_URL = "https://kcwshieovehgpdhahowq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjd3NoaWVvdmVoZ3BkaGFob3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODY2MDcsImV4cCI6MjA5Njg2MjYwN30.iia9Uuzzg5V7l4mG4pqbitshV7zdLjtw3JxCOJCYwD8";

const stripeAppearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "oklch(0.74 0.11 85)",
    colorBackground: "oklch(0.16 0.01 30)",
    colorText: "oklch(0.95 0.018 80)",
    colorTextSecondary: "oklch(0.62 0.06 80)",
    colorDanger: "oklch(0.65 0.22 27)",
    fontFamily: "DM Sans, sans-serif",
    fontSizeBase: "14px",
    borderRadius: "10px",
    spacingUnit: "5px",
    focusBoxShadow: "none",
    focusOutline: "1px solid oklch(0.74 0.11 85)",
  },
  rules: {
    ".Input": {
      backgroundColor: "oklch(0.24 0.015 35)",
      border: "1px solid oklch(0.28 0.02 40 / 60%)",
      color: "oklch(0.95 0.018 80)",
      boxShadow: "none",
      padding: "12px 14px",
      transition: "border-color 0.2s",
    },
    ".Input:focus": { border: "1px solid oklch(0.74 0.11 85)", boxShadow: "none" },
    ".Input--invalid": { border: "1px solid oklch(0.65 0.22 27)" },
    ".Label": {
      fontFamily: "Space Mono, monospace",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      color: "oklch(0.62 0.06 80)",
      marginBottom: "6px",
    },
    ".Tab": {
      backgroundColor: "oklch(0.20 0.012 30)",
      border: "1px solid oklch(0.28 0.02 40 / 60%)",
      color: "oklch(0.62 0.06 80)",
      boxShadow: "none",
    },
    ".Tab:hover": { backgroundColor: "oklch(0.22 0.014 32)", color: "oklch(0.95 0.018 80)" },
    ".Tab--selected": {
      backgroundColor: "oklch(0.74 0.11 85 / 12%)",
      border: "1px solid oklch(0.74 0.11 85 / 50%)",
      color: "oklch(0.74 0.11 85)",
      boxShadow: "none",
    },
    ".TabIcon--selected": { fill: "oklch(0.74 0.11 85)" },
    ".TabLabel--selected": { color: "oklch(0.74 0.11 85)" },
    ".Error": { color: "oklch(0.72 0.18 27)", fontSize: "13px" },
  },
};

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

const inputCls = {
  width: "100%",
  borderRadius: "10px",
  border: "1px solid oklch(0.28 0.02 40 / 60%)",
  backgroundColor: "oklch(0.24 0.015 35)",
  color: "oklch(0.95 0.018 80)",
  padding: "12px 14px",
  fontSize: "14px",
  outline: "none",
  fontFamily: "DM Sans, sans-serif",
};

const labelCls = {
  fontFamily: "Space Mono, monospace",
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "oklch(0.62 0.06 80)",
  display: "block",
  marginBottom: "6px",
};

function CheckoutForm({ workshop, attendee, onClose }: {
  workshop: Workshop;
  attendee: { name: string; email: string };
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message ?? "Please check your details.");
      setPaying(false);
      return;
    }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking-success?workshop=${encodeURIComponent(workshop.style)}&date=${encodeURIComponent(workshop.date)}`,
        payment_method_data: {
          billing_details: {
            name: attendee.name,
            email: attendee.email,
            address: { country: "US" },
          },
        },
      },
    });

    if (confirmErr) {
      setError(confirmErr.message ?? "Payment failed. Please try again.");
      setPaying(false);
    }
  };

  return (
    <div className="space-y-5">
      <PaymentElement options={{ layout: { type: "tabs", defaultCollapsed: false }, wallets: { link: "never" } }} />

      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: "oklch(0.65 0.22 27 / 10%)", border: "1px solid oklch(0.65 0.22 27 / 30%)", color: "oklch(0.78 0.18 27)" }}>
          {error}
        </motion.p>
      )}

      <button onClick={handlePay} disabled={paying || !stripe}
        className="group relative w-full overflow-hidden rounded-xl py-4 text-sm font-semibold transition-all disabled:opacity-60"
        style={{
          background: paying ? "oklch(0.62 0.09 82)" : "linear-gradient(135deg, oklch(0.81 0.14 88), oklch(0.66 0.09 78))",
          color: "oklch(0.13 0.008 30)",
        }}>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {paying ? (
            <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Processing…</>
          ) : (
            <><Lock className="h-4 w-4" />Pay ${workshop.price} · Secure Checkout</>
          )}
        </span>
        {!paying && <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-full" aria-hidden />}
      </button>

      <p className="text-center font-mono text-[11px] uppercase tracking-wider" style={{ color: "oklch(0.62 0.06 80)" }}>
        🔒 Encrypted · Powered by Stripe · Never stored on our servers
      </p>
    </div>
  );
}

export function PaymentModal({ workshop, onClose }: { workshop: Workshop; onClose: () => void }) {
  const [step, setStep] = useState<"details" | "payment">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = useCallback(async () => {
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          workshop_id: workshop.id,
          workshop_name: workshop.style,
          workshop_date: workshop.date,
          amount: workshop.price,
          name: name.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json();
      if (!data.clientSecret) throw new Error(data.error ?? "No client secret returned");
      setClientSecret(data.clientSecret);
      setStep("payment");
    } catch (e: any) {
      setFetchError(e.message ?? "Could not initialise payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [name, email, workshop]);

  const elementsOptions: StripeElementsOptions = clientSecret
    ? { clientSecret, appearance: stripeAppearance, fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Mono&display=swap" }] }
    : {};

  return (
    <AnimatePresence>
      <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-50"
        style={{ background: "oklch(0 0 0 / 75%)", backdropFilter: "blur(6px)" }} />

      <motion.div key="modal"
        initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
        style={{
          background: "oklch(0.14 0.009 30)",
          border: "1px solid oklch(0.28 0.02 40 / 60%)",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -4px 80px oklch(0 0 0 / 70%), 0 0 0 1px oklch(0.74 0.11 85 / 8%)",
          maxHeight: "92vh", overflowY: "auto",
        }}>

        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ background: "oklch(0.35 0.02 40)" }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-5" style={{ borderBottom: "1px solid oklch(0.28 0.02 40 / 50%)" }}>
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-widest" style={{ color: "oklch(0.74 0.11 85)" }}>Reserve Your Spot</p>
            <h2 className="text-2xl font-semibold leading-tight" style={{ fontFamily: "Cormorant Garamond, serif", color: "oklch(0.95 0.018 80)" }}>{workshop.style}</h2>
            {workshop.song && <p className="mt-0.5 text-sm" style={{ color: "oklch(0.62 0.06 80)" }}>♪ {workshop.song}</p>}
          </div>
          <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-white/5" style={{ color: "oklch(0.62 0.06 80)" }} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Details strip */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 px-6 py-4" style={{ borderBottom: "1px solid oklch(0.28 0.02 40 / 50%)", background: "oklch(0.16 0.01 30)" }}>
          {[{ icon: Calendar, text: workshop.date }, { icon: Clock, text: workshop.time }, { icon: MapPin, text: `${workshop.venue}, ${workshop.city}` }]
            .map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 font-body text-xs" style={{ color: "oklch(0.80 0.018 80)" }}>
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: "oklch(0.74 0.11 85)" }} />{text}
              </span>
            ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid oklch(0.28 0.02 40 / 50%)" }}>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "oklch(0.62 0.06 80)" }}>Workshop Fee</p>
            <p className="mt-0.5 text-sm" style={{ color: "oklch(0.95 0.018 80)" }}>1 spot · {workshop.duration}</p>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: "Cormorant Garamond, serif", color: "oklch(0.81 0.14 88)" }}>${workshop.price}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">

          {/* Step 1 — details */}
          {step === "details" && (
            <>
              <div className="space-y-4">
                <div>
                  <label style={labelCls}>Your Name</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Swastika Sharma" style={inputCls}
                  />
                </div>
                <div>
                  <label style={labelCls}>Email Address</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" style={inputCls}
                  />
                </div>
              </div>

              {fetchError && (
                <p className="rounded-lg px-4 py-3 text-sm text-center"
                  style={{ background: "oklch(0.65 0.22 27 / 10%)", border: "1px solid oklch(0.65 0.22 27 / 30%)", color: "oklch(0.78 0.18 27)" }}>
                  {fetchError}
                </p>
              )}

              <button onClick={handleContinue} disabled={loading || !name.trim() || !email.trim()}
                className="group relative w-full overflow-hidden rounded-xl py-4 text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, oklch(0.81 0.14 88), oklch(0.66 0.09 78))", color: "oklch(0.13 0.008 30)" }}>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Setting up payment…</> : <>Continue to Payment →</>}
                </span>
              </button>
            </>
          )}

          {/* Step 2 — payment */}
          {step === "payment" && clientSecret && (
            <>
              <button onClick={() => setStep("details")} className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider mb-2" style={{ color: "oklch(0.62 0.06 80)" }}>
                ← Back
              </button>
              <Elements stripe={stripePromise} options={elementsOptions}>
                <CheckoutForm workshop={workshop} attendee={{ name, email }} onClose={onClose} />
              </Elements>
            </>
          )}
        </div>

        <div className="px-6 pb-6 pt-0 text-center font-mono text-[11px] uppercase tracking-wider" style={{ color: "oklch(0.62 0.06 80)" }}>
          {workshop.spots_left} spot{workshop.spots_left !== 1 ? "s" : ""} remaining
        </div>
      </motion.div>
    </AnimatePresence>
  );
}