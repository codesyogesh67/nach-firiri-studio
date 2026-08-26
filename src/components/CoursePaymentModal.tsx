import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock } from "lucide-react";
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
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

function CheckoutForm({
  amount,
  onClose,
  onSuccess,
}: {
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
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
        return_url: `${window.location.origin}/learn?enrolled=true`,
      },
      redirect: "if_required",
    });

    if (confirmErr) {
      setError(confirmErr.message ?? "Payment failed. Please try again.");
      setPaying(false);
    } else {
      // Payment succeeded without redirect
      onSuccess()
    }
  };

  return (
    <div className="space-y-5">
      <PaymentElement
        options={{
          layout: { type: "tabs", defaultCollapsed: false },
        }}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            background: "oklch(0.65 0.22 27 / 10%)",
            border: "1px solid oklch(0.65 0.22 27 / 30%)",
            color: "oklch(0.78 0.18 27)",
          }}
        >
          {error}
        </motion.p>
      )}

      <button
        onClick={handlePay}
        disabled={paying || !stripe}
        className="group relative w-full overflow-hidden rounded-xl py-4 text-sm font-semibold transition-all disabled:opacity-60"
        style={{
          background: paying
            ? "oklch(0.62 0.09 82)"
            : "linear-gradient(135deg, oklch(0.81 0.14 88), oklch(0.66 0.09 78))",
          color: "oklch(0.13 0.008 30)",
        }}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {paying ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing…
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Pay ${amount} · Secure Checkout
            </>
          )}
        </span>
        {!paying && (
          <span
            className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-full"
            aria-hidden
          />
        )}
      </button>

      <p
        className="text-center font-mono text-[11px] uppercase tracking-wider"
        style={{ color: "oklch(0.62 0.06 80)" }}
      >
        🔒 Encrypted · Powered by Stripe · Never stored on our servers
      </p>
    </div>
  );
}

interface CoursePaymentModalProps {
  courseId: string
  courseName: string
  amount: number
  userId: string
  userEmail: string
  onClose: () => void
  onSuccess: () => void
}

export function CoursePaymentModal({
  courseId,
  courseName,
  amount,
  userId,
  userEmail,
  onClose,
  onSuccess,
}: CoursePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Fetch payment intent on mount
  useState(() => {
    async function init() {
      setLoading(true)
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/create-course-payment-intent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ courseId, userId, userEmail, amount }),
          }
        )
        const data = await res.json()
        if (!data.clientSecret) throw new Error(data.error ?? "No client secret")
        setClientSecret(data.clientSecret)
      } catch (e: any) {
        setFetchError(e.message ?? "Could not initialise payment.")
      } finally {
        setLoading(false)
      }
    }
    init()
  })

  const elementsOptions: StripeElementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: stripeAppearance,
        fonts: [
          {
            cssSrc:
              "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Mono&display=swap",
          },
        ],
      }
    : {}

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{ background: "oklch(0 0 0 / 75%)", backdropFilter: "blur(6px)" }}
      />

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
          boxShadow:
            "0 -4px 80px oklch(0 0 0 / 70%), 0 0 0 1px oklch(0.74 0.11 85 / 8%)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div
            className="h-1 w-10 rounded-full"
            style={{ background: "oklch(0.35 0.02 40)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-start justify-between px-6 pt-4 pb-5"
          style={{ borderBottom: "1px solid oklch(0.28 0.02 40 / 50%)" }}
        >
          <div>
            <p
              className="mb-1 font-mono text-[11px] uppercase tracking-widest"
              style={{ color: "oklch(0.74 0.11 85)" }}
            >
              Enroll Now
            </p>
            <h2
              className="text-2xl font-semibold leading-tight"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                color: "oklch(0.95 0.018 80)",
              }}
            >
              {courseName}
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "oklch(0.62 0.06 80)" }}>
              Lifetime access · Learn at your own pace
            </p>
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

        {/* Price strip */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: "1px solid oklch(0.28 0.02 40 / 50%)",
            background: "oklch(0.16 0.01 30)",
          }}
        >
          <div>
            <p
              className="font-mono text-[11px] uppercase tracking-wider"
              style={{ color: "oklch(0.62 0.06 80)" }}
            >
              Course Fee
            </p>
            <p className="mt-0.5 text-sm" style={{ color: "oklch(0.95 0.018 80)" }}>
              One-time payment · No subscription
            </p>
          </div>
          <p
            className="text-2xl font-bold"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "oklch(0.81 0.14 88)",
            }}
          >
            ${amount}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <span
                className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"
                style={{ color: "oklch(0.74 0.11 85)" }}
              />
            </div>
          )}

          {fetchError && (
            <p
              className="rounded-lg px-4 py-3 text-sm text-center"
              style={{
                background: "oklch(0.65 0.22 27 / 10%)",
                border: "1px solid oklch(0.65 0.22 27 / 30%)",
                color: "oklch(0.78 0.18 27)",
              }}
            >
              {fetchError}
            </p>
          )}

          {clientSecret && (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <CheckoutForm
                amount={amount}
                onClose={onClose}
                onSuccess={onSuccess}
              />
            </Elements>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}