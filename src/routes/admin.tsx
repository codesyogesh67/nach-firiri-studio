import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, DollarSign, Calendar, Mail, X, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUPABASE_URL = "https://kcwshieovehgpdhahowq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjd3NoaWVvdmVoZ3BkaGFob3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODY2MDcsImV4cCI6MjA5Njg2MjYwN30.iia9Uuzzg5V7l4mG4pqbitshV7zdLjtw3JxCOJCYwD8";
const ADMIN_PASSWORD = "nachfiriri2026";

type Booking = {
  id: string;
  created_at: string;
  workshop_id: string;
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

const EMPTY_FORM = {
  id: "",
  style: "",
  song: "",
  date: "",
  time: "",
  venue: "",
  city: "",
  duration: "2 Hours",
  price: 20,
  spots_total: 20,
  price_id: "price_1ThcrxQ4li0j4IaZq7eoDSWY",
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
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/bookings?order=created_at.desc`, { headers }).then(r => r.json()),
      fetch(`${SUPABASE_URL}/rest/v1/workshops?active=eq.true&order=date.asc`, { headers }).then(r => r.json()),
    ]).then(([b, w]) => {
      setBookings(b);
      setWorkshops(w);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!authed) return;
    fetchData();
  }, [authed]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  // Guest list for selected workshop
  const guestList = selectedWorkshop
    ? bookings.filter(b => b.workshop_id === selectedWorkshop.id)
    : [];

  // Export CSV
  const exportCSV = (workshopBookings: Booking[], workshopName: string) => {
    const rows = [
      ["Name", "Email", "Amount Paid", "Booked At"],
      ...workshopBookings.map(b => [
        b.attendee_name,
        b.attendee_email,
        `$${(b.amount_paid / 100).toFixed(2)}`,
        new Date(b.created_at).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workshopName.replace(/ /g, "-")}-guests.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddWorkshop = async () => {
  if (!form.style || !form.date || !form.venue || !form.city) {
    setSaveMsg("Please fill in all required fields.");
    return;
  }
  setSaving(true);
  setSaveMsg("");

  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/create-workshop`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(form),
    }
  );

  const data = await res.json();

  if (data.success) {
    setSaveMsg("✅ Workshop added successfully!");
    setForm(EMPTY_FORM);
    setShowAddForm(false);
    fetchData();
  } else {
    setSaveMsg("❌ Something went wrong. Try again.");
  }
  setSaving(false);
};
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount_paid / 100), 0);

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
            <p className="text-red-400 text-xs font-mono mb-3 text-center">Incorrect password</p>
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

      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--ivory)]">Admin Dashboard</h1>
          <p className="font-mono text-xs text-[var(--ivory)]/50 mt-1">Nach Firiri — UrbanMint Studio</p>
        </div>
        <div className="flex gap-3">
          <Button variant="gold" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Workshop
          </Button>
          <Button variant="goldOutline" size="sm" onClick={() => setAuthed(false)}>
            Log Out
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10 sm:grid-cols-4">
        {[
          { label: "Total Bookings", value: bookings.length, icon: Users },
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign },
          { label: "Workshops", value: workshops.length, icon: Calendar },
          { label: "Unique Attendees", value: new Set(bookings.map(b => b.attendee_email)).size, icon: Mail },
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

      {/* Workshops with Guest List */}
      <div className="mb-10">
        <h2 className="font-display text-xl font-semibold text-[var(--ivory)] mb-4">Workshops</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((w) => {
            const pct = Math.round(((w.spots_total - w.spots_left) / w.spots_total) * 100);
            const soldOut = w.spots_left === 0;
            const wBookings = bookings.filter(b => b.workshop_id === w.id);
            return (
              <div key={w.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="font-display text-lg font-semibold text-[var(--ivory)]">{w.style}</p>
                <p className="font-mono text-xs text-[var(--ivory)]/50 mt-1">{w.date} · {w.city}</p>
                <div className="mt-4">
                  <div className="flex justify-between font-mono text-xs text-[var(--ivory)]/60 mb-1">
                    <span>{w.spots_total - w.spots_left} / {w.spots_total} booked</span>
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
                <button
                  onClick={() => setSelectedWorkshop(w)}
                  className="mt-4 w-full rounded-xl border border-[var(--gold)]/30 py-2 font-mono text-xs text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all"
                >
                  View Guest List ({wBookings.length})
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Bookings Table */}
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--ivory)] mb-4">All Bookings</h2>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full font-body text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Name", "Email", "Workshop", "Date", "Amount", "Status", "Booked At"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-mono text-xs text-[var(--ivory)]/50 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id} className={cn("border-b border-[var(--border)] hover:bg-[var(--gold)]/5", i === bookings.length - 1 && "border-0")}>
                    <td className="px-5 py-4 text-[var(--ivory)]">{b.attendee_name}</td>
                    <td className="px-5 py-4 text-[var(--ivory)]/70">{b.attendee_email}</td>
                    <td className="px-5 py-4 text-[var(--ivory)]/70">{b.workshop_name}</td>
                    <td className="px-5 py-4 text-[var(--ivory)]/70">{b.workshop_date}</td>
                    <td className="px-5 py-4 text-[var(--gold)]">${(b.amount_paid / 100).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-500/15 px-3 py-1 font-mono text-xs text-green-400">{b.status}</span>
                    </td>
                    <td className="px-5 py-4 text-[var(--ivory)]/50 font-mono text-xs">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center font-mono text-xs text-[var(--ivory)]/30">No bookings yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guest List Modal */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
          <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl font-semibold text-[var(--ivory)]">
                  {selectedWorkshop.style}
                </h3>
                <p className="font-mono text-xs text-[var(--ivory)]/50 mt-1">
                  {selectedWorkshop.date} · {selectedWorkshop.city}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportCSV(guestList, selectedWorkshop.style)}
                  className="flex items-center gap-2 rounded-xl border border-[var(--gold)]/40 px-4 py-2 font-mono text-xs text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all"
                >
                  <Download className="h-3 w-3" /> Export CSV
                </button>
                <button onClick={() => setSelectedWorkshop(null)}>
                  <X className="h-5 w-5 text-[var(--ivory)]/50 hover:text-[var(--ivory)]" />
                </button>
              </div>
            </div>

            {guestList.length === 0 ? (
              <p className="text-center font-mono text-xs text-[var(--ivory)]/30 py-10">
                No bookings yet for this workshop
              </p>
            ) : (
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["#", "Name", "Email", "Amount", "Booked"].map(h => (
                      <th key={h} className="pb-3 text-left font-mono text-xs text-[var(--ivory)]/50 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guestList.map((b, i) => (
                    <tr key={b.id} className="border-b border-[var(--border)]/50">
                      <td className="py-3 font-mono text-xs text-[var(--ivory)]/30">{i + 1}</td>
                      <td className="py-3 text-[var(--ivory)]">{b.attendee_name}</td>
                      <td className="py-3 text-[var(--ivory)]/70">{b.attendee_email}</td>
                      <td className="py-3 text-[var(--gold)]">${(b.amount_paid / 100).toFixed(2)}</td>
                      <td className="py-3 text-[var(--ivory)]/50 font-mono text-xs">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add Workshop Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-[var(--ivory)]">Add Workshop</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X className="h-5 w-5 text-[var(--ivory)]/50 hover:text-[var(--ivory)]" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Workshop Name *", key: "style", placeholder: "e.g. Nacha Firiri Heels" },
                { label: "Song / Theme *", key: "song", placeholder: "e.g. Nacha Firiri" },
                { label: "Date *", key: "date", placeholder: "e.g. July 18, 2026" },
                { label: "Time *", key: "time", placeholder: "e.g. 7:00–9:00 PM" },
                { label: "Venue *", key: "venue", placeholder: "e.g. Ripley-Grier Studios" },
                { label: "City *", key: "city", placeholder: "e.g. New York" },
                { label: "Duration", key: "duration", placeholder: "e.g. 2 Hours" },
                { label: "Stripe Price ID *", key: "price_id", placeholder: "price_1..." },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="font-mono text-xs text-[var(--ivory)]/50 uppercase tracking-wider mb-1 block">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 font-body text-sm text-[var(--ivory)] outline-none focus:border-[var(--gold)]"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs text-[var(--ivory)]/50 uppercase tracking-wider mb-1 block">Price ($)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 font-body text-sm text-[var(--ivory)] outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-[var(--ivory)]/50 uppercase tracking-wider mb-1 block">Total Spots</label>
                  <input
                    type="number"
                    value={form.spots_total}
                    onChange={e => setForm(f => ({ ...f, spots_total: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 font-body text-sm text-[var(--ivory)] outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>

              {saveMsg && (
                <p className="font-mono text-xs text-center" style={{ color: saveMsg.startsWith("✅") ? "#4ade80" : "#f87171" }}>
                  {saveMsg}
                </p>
              )}

              <Button variant="gold" className="w-full mt-2" onClick={handleAddWorkshop} disabled={saving}>
                {saving ? "Adding..." : "Add Workshop"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
