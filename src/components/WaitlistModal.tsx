import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

const SUPABASE_URL = "https://kcwshieovehgpdhahowq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjd3NoaWVvdmVoZ3BkaGFob3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODY2MDcsImV4cCI6MjA5Njg2MjYwN30.iia9Uuzzg5V7l4mG4pqbitshV7zdLjtw3JxCOJCYwD8";

type Workshop = {
  id: string;
  style: string;
  date: string;
};

const inputCls: React.CSSProperties = {
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

const labelCls: React.CSSProperties = {
  fontFamily: "Space Mono, monospace",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "oklch(0.62 0.06 80)",
  display: "block",
  marginBottom: "6px",
};

export function WaitlistModal({
  workshop,
  onClose,
}: {
  workshop: Workshop;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          workshop_id: workshop.id,
          workshop_name: workshop.style,
          workshop_date: workshop.date,
          name: name.trim(),
          email: email.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to join waitlist");
      setDone(true);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{
          background: "oklch(0 0 0 / 75%)",
          backdropFilter: "blur(6px)",
        }}
      />

      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
        style={{
          background: "oklch(0.14 0.009 30)",
          border: "1px solid oklch(0.28 0.02 40 / 60%)",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -4px 80px oklch(0 0 0 / 70%)",
          padding: "32px 24px",
        }}
      >
        {/* Drag pill */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div
            className="h-1 w-10 rounded-full"
            style={{ background: "oklch(0.35 0.02 40)" }}
          />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-2 hover:bg-white/5"
          style={{ color: "oklch(0.62 0.06 80)" }}
        >
          <X className="h-5 w-5" />
        </button>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <p className="text-4xl mb-4">💛</p>
            <h2
              className="text-xl font-bold mb-2"
              style={{
                color: "oklch(0.95 0.018 80)",
                fontFamily: "Cormorant Garamond, serif",
              }}
            >
              You're on the list!
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.62 0.06 80)" }}>
              We'll email you at{" "}
              <span style={{ color: "oklch(0.74 0.11 85)" }}>{email}</span> if a
              spot opens for {workshop.style}.
            </p>
          </motion.div>
        ) : (
          <>
            <p
              className="font-mono text-[11px] uppercase tracking-widest mb-1"
              style={{ color: "oklch(0.74 0.11 85)" }}
            >
              Join Waitlist
            </p>
            <h2
              className="text-xl font-bold mb-1"
              style={{
                color: "oklch(0.95 0.018 80)",
                fontFamily: "Cormorant Garamond, serif",
              }}
            >
              {workshop.style}
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: "oklch(0.62 0.06 80)" }}
            >
              This workshop is sold out. Leave your details and we'll notify you
              if a spot opens.
            </p>

            <div className="space-y-4">
              <div>
                <label style={labelCls}>Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Swastika Sharma"
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputCls}
                />
              </div>
            </div>

            {error && (
              <p
                className="mt-3 rounded-lg px-4 py-3 text-sm text-center"
                style={{
                  background: "oklch(0.65 0.22 27 / 10%)",
                  border: "1px solid oklch(0.65 0.22 27 / 30%)",
                  color: "oklch(0.78 0.18 27)",
                }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleJoin}
              disabled={loading || !name.trim() || !email.trim()}
              className="mt-6 w-full rounded-xl py-4 text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.81 0.14 88), oklch(0.66 0.09 78))",
                color: "oklch(0.13 0.008 30)",
              }}
            >
              {loading ? "Joining..." : "Notify Me When a Spot Opens 💛"}
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
