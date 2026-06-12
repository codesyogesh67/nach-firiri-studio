import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, DollarSign, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUPABASE_URL = "https://kcwshieovehgpdhahowq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjd3NoaWVvdmVoZ3BkaGFob3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODY2MDcsImV4cCI6MjA5Njg2MjYwN30.iia9Uuzzg5V7l4mG4pqbitshV7zdLjtw3JxCOJCYwD8";
const ADMIN_PASSWORD = "nachfiriri2026";

type Booking = {
  id: string;
  created_at: string;
  workshop_name: string;
  workshop_date: string;
  attendee_name: string;
  attendee_email: string;
  amount_paid: number;
  status: string;
};

type Workshop = {
  id: string;
  style: string;
  date: string;
  city: string;
  spots_left: number;
  spots_total: number;
  price: number;
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Nach Firiri" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);

  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);

    Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/bookings?order=created_at.desc`, { headers }).then(r => r.json()),
      fetch(`${SUPABASE_URL}/rest/v1/workshops?active=eq.true&order=date.asc`, { headers }).then(r => r.json()),
    ]).then(([b, w]) => {
      setBookings(b);
      setWorkshops(w);
      setLoading(false);
    });
  }, [authed]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount_paid / 100), 0);
  const totalBookings = bookings.length;

  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
          <h1 className="font-display text-2xl font-semibold text-[var(--ivory)] text-center mb-2">
            Admin Access
          </h1>
          <p className="text-center font-body text-sm text-[var(--ivory)]/50 mb-6">
            Nach Firiri Dashboard
          </p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 font-body text-sm text-[var(--ivory)] outline-none focus:border-[var(--gold)] mb-3"
          />
          {error && (
            <p className="text-red-400 text-xs font-mono mb-3 text-center">
              Incorrect password
            </p>
          )}
          <Button variant="gold" className="w-full" onClick={handleLogin}>
            Enter Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono text-sm text-[var(--ivory)]/50">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-12 max-w-7xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--ivory)]">
            Admin Dashboard
          </h1>
          <p className="font-mono text-xs text-[var(--ivory)]/50 mt-1">
            Nach Firiri — UrbanMint Studio
          </p>
        </div>
        <Button variant="goldOutline" size="sm" onClick={() => setAuthed(false)}>
          Log Out
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10 sm:grid-cols-4">
        {[
          { label: "Total Bookings", value: totalBookings, icon: Users },
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign },
          { label: "Workshops", value: workshops.length, icon: Calendar },
          { label: "Attendees", value: totalBookings, icon: Mail },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <stat.icon className="h-5 w-5 text-[var(--gold)] mb-3" />
            <p className="font-display text-2xl font-semibold text-[var(--ivory)]">{stat.value}</p>
            <p className="font-mono text-xs text-[var(--ivory)]/50 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Workshops */}
      <div className="mb-10">
        <h2 className="font-display text-xl font-semibold text-[var(--ivory)] mb-4">
          Workshops
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((w) => {
            const pct = Math.round(((w.spots_total - w.spots_left) / w.spots_total) * 100);
            const soldOut = w.spots_left === 0;
            return (
              <div
                key={w.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
              >
                <p className="font-display text-lg font-semibold text-[var(--ivory)]">{w.style}</p>
                <p className="font-mono text-xs text-[var(--ivory)]/50 mt-1">{w.date} · {w.city}</p>
                <div className="mt-4">
                  <div className="flex justify-between font-mono text-xs text-[var(--ivory)]/60 mb-1">
                    <span>{soldOut ? "Sold out" : `${w.spots_total - w.spots_left} / ${w.spots_total} booked`}</span>
                    <span className={cn(soldOut ? "text-red-400" : "text-[var(--gold)]")}>
                      {soldOut ? "SOLD OUT" : `${w.spots_left} left`}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--input)]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: "var(--gradient-gold)" }}
                    />
                  </div>
                </div>
                <p className="mt-3 font-mono text-xs text-[var(--ivory)]/50">
                  Revenue: ${((w.spots_total - w.spots_left) * w.price).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bookings Table */}
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--ivory)] mb-4">
          All Bookings
        </h2>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full font-body text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Name", "Email", "Workshop", "Date", "Amount", "Status", "Booked At"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-mono text-xs text-[var(--ivory)]/50 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr
                    key={b.id}
                    className={cn(
                      "border-b border-[var(--border)] transition-colors hover:bg-[var(--gold)]/5",
                      i === bookings.length - 1 && "border-0"
                    )}
                  >
                    <td className="px-5 py-4 text-[var(--ivory)]">{b.attendee_name}</td>
                    <td className="px-5 py-4 text-[var(--ivory)]/70">{b.attendee_email}</td>
                    <td className="px-5 py-4 text-[var(--ivory)]/70">{b.workshop_name}</td>
                    <td className="px-5 py-4 text-[var(--ivory)]/70">{b.workshop_date}</td>
                    <td className="px-5 py-4 text-[var(--gold)]">${(b.amount_paid / 100).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-500/15 px-3 py-1 font-mono text-xs text-green-400">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[var(--ivory)]/50 font-mono text-xs">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center font-mono text-xs text-[var(--ivory)]/30">
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
