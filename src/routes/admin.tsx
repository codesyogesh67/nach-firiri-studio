import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, DollarSign, Calendar, Mail, X, Plus, Download,
  LogOut, RefreshCw, Search, Filter, ChevronDown, ChevronUp,
  TrendingUp, Clock, MapPin, Music, Edit2, Trash2, Eye,
  CheckCircle, AlertCircle, BarChart2, List, Grid, 
  Bell, Settings, Copy, Check, ArrowUpRight, Zap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
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
  active?: boolean;
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

type Tab = "overview" | "workshops" | "bookings" | "analytics";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Nach Firiri" }],
  }),
  component: AdminPage,
});

// ── helpers ──────────────────────────────────────────────────────────────
const fmt$ = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

// ── sub-components ────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, trend, color = "gold"
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; trend?: number; color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ivory)]/40">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--gold)]/10">
          <Icon className="h-4 w-4 text-[var(--gold)]" />
        </div>
      </div>
      <div>
        <p className="font-display text-3xl font-semibold text-[var(--ivory)] leading-none">{value}</p>
        {sub && <p className="font-mono text-xs text-[var(--ivory)]/40 mt-1">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={cn("flex items-center gap-1 font-mono text-xs", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
          <TrendingUp className={cn("h-3 w-3", trend < 0 && "rotate-180")} />
          {Math.abs(trend)}% from last month
        </div>
      )}
    </motion.div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
    refunded: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  };
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
      map[status.toLowerCase()] ?? "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20"
    )}>
      {status}
    </span>
  );
}

function CapacityBar({ left, total }: { left: number; total: number }) {
  const booked = total - left;
  const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
  const color = left === 0 ? "#f87171" : left <= 3 ? "#fb923c" : "var(--gold)";
  return (
    <div>
      <div className="flex justify-between font-mono text-[10px] text-[var(--ivory)]/50 mb-1.5">
        <span>{booked}/{total} booked</span>
        <span style={{ color }}>{left === 0 ? "SOLD OUT" : `${left} left`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--input)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1 text-[var(--ivory)]/30 hover:text-[var(--gold)] transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editWorkshop, setEditWorkshop] = useState<Workshop | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Workshop | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Filters
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingWorkshopFilter, setBookingWorkshopFilter] = useState("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [workshopView, setWorkshopView] = useState<"grid" | "list">("grid");
  const [bookingSort, setBookingSort] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "created_at", dir: "desc" });

  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [b, w] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/bookings?order=created_at.desc`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/workshops?order=date.asc`, { headers }).then(r => r.json()),
      ]);
      if (Array.isArray(b)) setBookings(b);
      if (Array.isArray(w)) setWorkshops(w);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (authed) fetchData(); }, [authed]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!authed) return;
    const t = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(t);
  }, [authed]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); }
    else setPwError(true);
  };

  // ── derived stats ──────────────────────────────────────────────────────
  const totalRevenue = useMemo(() => bookings.reduce((s, b) => s + b.amount_paid, 0), [bookings]);
  const uniqueAttendees = useMemo(() => new Set(bookings.map(b => b.attendee_email)).size, [bookings]);
  const activeWorkshops = workshops.filter(w => w.active !== false).length;
  const soldOutCount = workshops.filter(w => w.spots_left === 0).length;

  // Revenue over time (group by month)
  const revenueByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => {
      const m = new Date(b.created_at).toLocaleDateString("en-US", { month: "short" });
      map[m] = (map[m] ?? 0) + b.amount_paid / 100;
    });
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
  }, [bookings]);

  // Bookings per workshop (for bar chart)
  const bookingsPerWorkshop = useMemo(() => {
    return workshops.slice(0, 6).map(w => ({
      name: w.style.length > 14 ? w.style.slice(0, 14) + "…" : w.style,
      bookings: bookings.filter(b => b.workshop_id === w.id).length,
    }));
  }, [workshops, bookings]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    let list = [...bookings];
    if (bookingSearch) {
      const q = bookingSearch.toLowerCase();
      list = list.filter(b =>
        b.attendee_name.toLowerCase().includes(q) ||
        b.attendee_email.toLowerCase().includes(q) ||
        b.workshop_name.toLowerCase().includes(q)
      );
    }
    if (bookingWorkshopFilter !== "all") list = list.filter(b => b.workshop_id === bookingWorkshopFilter);
    if (bookingStatusFilter !== "all") list = list.filter(b => b.status.toLowerCase() === bookingStatusFilter);
    list.sort((a, b) => {
      const av = (a as any)[bookingSort.col] ?? "";
      const bv = (b as any)[bookingSort.col] ?? "";
      return bookingSort.dir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [bookings, bookingSearch, bookingWorkshopFilter, bookingStatusFilter, bookingSort]);

  const toggleSort = (col: string) => {
    setBookingSort(s => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });
  };

  const exportCSV = (rows: Booking[], name = "bookings") => {
    const data = [
      ["Name", "Email", "Workshop", "Date", "Amount", "Status", "Booked At"],
      ...rows.map(b => [b.attendee_name, b.attendee_email, b.workshop_name, b.workshop_date, fmt$(b.amount_paid), b.status, fmtDate(b.created_at)]),
    ];
    const blob = new Blob([data.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${name}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const handleSaveWorkshop = async () => {
    const payload = editWorkshop ? { ...editWorkshop, ...form } : form;
    if (!payload.style || !payload.date || !payload.venue || !payload.city) {
      setSaveMsg("Please fill in all required fields."); return;
    }
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-workshop`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg("✅ Workshop saved!");
        setForm(EMPTY_FORM); setShowAddForm(false); setEditWorkshop(null);
        fetchData(true);
      } else setSaveMsg("❌ Something went wrong. Try again.");
    } catch { setSaveMsg("❌ Network error."); }
    setSaving(false);
  };

  // Recent bookings for overview
  const recentBookings = bookings.slice(0, 5);

  // ── LOGIN ───────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 bg-[var(--bg)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/10">
              <Zap className="h-7 w-7 text-[var(--gold)]" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-[var(--ivory)]">Nach Firiri</h1>
            <p className="font-mono text-xs text-[var(--ivory)]/40 mt-1 uppercase tracking-widest">Studio Admin</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7">
            <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--ivory)]/40 block mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 font-body text-sm text-[var(--ivory)] outline-none focus:border-[var(--gold)] transition-colors mb-3"
            />
            {pwError && (
              <div className="flex items-center gap-2 text-red-400 font-mono text-xs mb-3">
                <AlertCircle className="h-3 w-3" /> Incorrect password
              </div>
            )}
            <button
              onClick={handleLogin}
              className="w-full rounded-xl py-3 font-mono text-sm font-medium text-[#1A1410] transition-all"
              style={{ background: "var(--gradient-gold)" }}
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
          <p className="font-mono text-xs text-[var(--ivory)]/40">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ── WORKSHOP FORM (shared for add + edit) ──────────────────────────────
  const WorkshopForm = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 py-10 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 my-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-xl font-semibold text-[var(--ivory)]">
              {editWorkshop ? "Edit Workshop" : "New Workshop"}
            </h3>
            <p className="font-mono text-xs text-[var(--ivory)]/40 mt-0.5">Fill in the workshop details below</p>
          </div>
          <button onClick={() => { setShowAddForm(false); setEditWorkshop(null); setSaveMsg(""); }}>
            <X className="h-5 w-5 text-[var(--ivory)]/50 hover:text-[var(--ivory)] transition-colors" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Section: Details */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--input)]/30 p-4 space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ivory)]/30 mb-2">Workshop Details</p>
            {[
              { label: "Workshop Name *", key: "style", placeholder: "e.g. Nach Firiri Heels", icon: Music },
              { label: "Song / Theme", key: "song", placeholder: "e.g. Nach Firiri", icon: Music },
              { label: "Venue *", key: "venue", placeholder: "e.g. Ripley-Grier Studios", icon: MapPin },
              { label: "City *", key: "city", placeholder: "e.g. New York", icon: MapPin },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--ivory)]/40 mb-1 block">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-2.5 font-body text-sm text-[var(--ivory)] outline-none focus:border-[var(--gold)] transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Section: Schedule */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--input)]/30 p-4 space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ivory)]/30 mb-2">Schedule</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Date *", key: "date", placeholder: "July 18, 2026" },
                { label: "Time *", key: "time", placeholder: "7:00–9:00 PM" },
                { label: "Duration", key: "duration", placeholder: "2 Hours" },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className={key === "duration" ? "col-span-2" : ""}>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--ivory)]/40 mb-1 block">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-2.5 font-body text-sm text-[var(--ivory)] outline-none focus:border-[var(--gold)] transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Pricing & Capacity */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--input)]/30 p-4 space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ivory)]/30 mb-2">Pricing & Capacity</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--ivory)]/40 mb-1 block">Price ($)</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-2.5 font-body text-sm text-[var(--ivory)] outline-none focus:border-[var(--gold)] transition-colors" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--ivory)]/40 mb-1 block">Total Spots</label>
                <input type="number" value={form.spots_total} onChange={e => setForm(f => ({ ...f, spots_total: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-2.5 font-body text-sm text-[var(--ivory)] outline-none focus:border-[var(--gold)] transition-colors" />
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--ivory)]/40 mb-1 block">Stripe Price ID *</label>
              <input type="text" placeholder="price_1..." value={form.price_id} onChange={e => setForm(f => ({ ...f, price_id: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-2.5 font-mono text-xs text-[var(--ivory)] outline-none focus:border-[var(--gold)] transition-colors" />
            </div>
          </div>

          {saveMsg && (
            <p className="font-mono text-xs text-center" style={{ color: saveMsg.startsWith("✅") ? "#4ade80" : "#f87171" }}>
              {saveMsg}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => { setShowAddForm(false); setEditWorkshop(null); setSaveMsg(""); }}
              className="flex-1 rounded-xl border border-[var(--border)] py-3 font-mono text-sm text-[var(--ivory)]/60 hover:text-[var(--ivory)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWorkshop}
              disabled={saving}
              className="flex-1 rounded-xl py-3 font-mono text-sm font-medium text-[#1A1410] transition-all disabled:opacity-50"
              style={{ background: "var(--gradient-gold)" }}
            >
              {saving ? "Saving…" : editWorkshop ? "Save Changes" : "Add Workshop"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // ── GUEST LIST MODAL ───────────────────────────────────────────────────
  const GuestListModal = () => {
    if (!selectedWorkshop) return null;
    const guests = bookings.filter(b => b.workshop_id === selectedWorkshop.id);
    const revenue = guests.reduce((s, b) => s + b.amount_paid, 0);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-[var(--border)]">
            <div>
              <h3 className="font-display text-xl font-semibold text-[var(--ivory)]">{selectedWorkshop.style}</h3>
              <div className="flex items-center gap-3 mt-1.5 font-mono text-xs text-[var(--ivory)]/50">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{selectedWorkshop.date}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedWorkshop.city}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{selectedWorkshop.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportCSV(guests, selectedWorkshop.style)}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--gold)]/40 px-3 py-2 font-mono text-xs text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all"
              >
                <Download className="h-3 w-3" /> Export CSV
              </button>
              <button onClick={() => setSelectedWorkshop(null)} className="rounded-xl p-2 hover:bg-[var(--border)] transition-colors">
                <X className="h-4 w-4 text-[var(--ivory)]/50" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-px border-b border-[var(--border)] bg-[var(--border)]">
            {[
              { label: "Attendees", value: guests.length },
              { label: "Revenue", value: fmt$(revenue) },
              { label: "Spots Left", value: selectedWorkshop.spots_left },
            ].map(s => (
              <div key={s.label} className="bg-[var(--card)] px-5 py-4 text-center">
                <p className="font-display text-xl font-semibold text-[var(--ivory)]">{s.value}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--ivory)]/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-y-auto flex-1 p-4">
            {guests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Users className="h-10 w-10 text-[var(--ivory)]/10" />
                <p className="font-mono text-xs text-[var(--ivory)]/30">No bookings yet</p>
              </div>
            ) : (
              <table className="w-full font-body text-sm">
                <thead>
                  <tr>
                    {["#", "Name", "Email", "Amount", "Booked"].map(h => (
                      <th key={h} className="pb-3 text-left font-mono text-[10px] uppercase tracking-wider text-[var(--ivory)]/40">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guests.map((b, i) => (
                    <tr key={b.id} className="border-t border-[var(--border)]/50 hover:bg-[var(--gold)]/3">
                      <td className="py-3 font-mono text-[10px] text-[var(--ivory)]/30">{i + 1}</td>
                      <td className="py-3 text-[var(--ivory)] font-medium">{b.attendee_name}</td>
                      <td className="py-3 text-[var(--ivory)]/60">
                        <span className="flex items-center gap-1">
                          {b.attendee_email}
                          <CopyButton text={b.attendee_email} />
                        </span>
                      </td>
                      <td className="py-3 text-[var(--gold)] font-mono text-sm">{fmt$(b.amount_paid)}</td>
                      <td className="py-3 font-mono text-xs text-[var(--ivory)]/40">{fmtDate(b.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  // ── TABS ───────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "workshops", label: "Workshops", icon: Calendar },
    { id: "bookings", label: "Bookings", icon: List },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">

      {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
      <div className="sticky top-20 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gold)]/15">
                <Zap className="h-4 w-4 text-[var(--gold)]" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-[var(--ivory)] leading-none">Nach Firiri</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ivory)]/30 mt-0.5">Studio Admin</p>
              </div>
            </div>

            {/* Tab nav */}
            <div className="hidden sm:flex items-center gap-1 ml-4">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs transition-all",
                    activeTab === t.id
                      ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                      : "text-[var(--ivory)]/40 hover:text-[var(--ivory)]/70"
                  )}
                >
                  <t.icon className="h-3 w-3" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastRefresh && (
              <span className="hidden sm:block font-mono text-[10px] text-[var(--ivory)]/30">
                Updated {fmtTime(lastRefresh.toISOString())}
              </span>
            )}
            <button
              onClick={() => fetchData(true)}
              className={cn("flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 font-mono text-xs text-[var(--ivory)]/60 hover:text-[var(--ivory)] transition-all", refreshing && "opacity-50")}
            >
              <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
              <span className="hidden sm:block">Refresh</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-xs font-medium text-[#1A1410] transition-all"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Plus className="h-3 w-3" /> Add Workshop
            </button>
            <button
              onClick={() => setAuthed(false)}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 font-mono text-xs text-[var(--ivory)]/40 hover:text-red-400 hover:border-red-400/30 transition-all"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex sm:hidden border-t border-[var(--border)] px-2 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-1 px-3 py-2.5 font-mono text-xs whitespace-nowrap transition-all border-b-2",
                activeTab === t.id ? "border-[var(--gold)] text-[var(--gold)]" : "border-transparent text-[var(--ivory)]/40"
              )}
            >
              <t.icon className="h-3 w-3" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-5 py-8">
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW TAB ───────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total Bookings" value={bookings.length} sub="All time" icon={Users} />
                <StatCard label="Total Revenue" value={`$${(totalRevenue / 100).toFixed(0)}`} sub={`$${(totalRevenue / 100).toFixed(2)} exact`} icon={DollarSign} />
                <StatCard label="Active Workshops" value={activeWorkshops} sub={`${soldOutCount} sold out`} icon={Calendar} />
                <StatCard label="Unique Attendees" value={uniqueAttendees} sub="Distinct emails" icon={Mail} />
              </div>

              {/* Charts row */}
              <div className="grid gap-5 lg:grid-cols-2">
                {/* Revenue chart */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="font-display text-base font-semibold text-[var(--ivory)]">Revenue</p>
                      <p className="font-mono text-xs text-[var(--ivory)]/40 mt-0.5">By month</p>
                    </div>
                  </div>
                  {revenueByMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={revenueByMonth}>
                        <defs>
                          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="month" tick={{ fill: "rgba(245,240,232,0.4)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "rgba(245,240,232,0.4)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                        <Tooltip
                          contentStyle={{ background: "#1A1410", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px" }}
                          labelStyle={{ color: "#F5F0E8" }}
                          itemStyle={{ color: "#C9A96E" }}
                          formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={2} fill="url(#goldGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center">
                      <p className="font-mono text-xs text-[var(--ivory)]/20">No revenue data yet</p>
                    </div>
                  )}
                </div>

                {/* Bookings per workshop */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <div className="mb-5">
                    <p className="font-display text-base font-semibold text-[var(--ivory)]">Bookings</p>
                    <p className="font-mono text-xs text-[var(--ivory)]/40 mt-0.5">Per workshop</p>
                  </div>
                  {bookingsPerWorkshop.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={bookingsPerWorkshop} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "rgba(245,240,232,0.4)", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "rgba(245,240,232,0.4)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: "#1A1410", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px" }}
                          labelStyle={{ color: "#F5F0E8" }}
                          itemStyle={{ color: "#C9A96E" }}
                        />
                        <Bar dataKey="bookings" radius={[4, 4, 0, 0]}>
                          {bookingsPerWorkshop.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? "#C9A96E" : "rgba(201,169,110,0.35)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center">
                      <p className="font-mono text-xs text-[var(--ivory)]/20">No workshop data yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent bookings + upcoming workshops */}
              <div className="grid gap-5 lg:grid-cols-2">

                {/* Recent Bookings */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                    <p className="font-display text-base font-semibold text-[var(--ivory)]">Recent Bookings</p>
                    <button onClick={() => setActiveTab("bookings")} className="flex items-center gap-1 font-mono text-xs text-[var(--gold)] hover:opacity-70 transition-opacity">
                      View all <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                  {recentBookings.length === 0 ? (
                    <div className="px-5 py-10 text-center font-mono text-xs text-[var(--ivory)]/20">No bookings yet</div>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {recentBookings.map(b => (
                        <div key={b.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--gold)]/3 transition-colors">
                          <div className="min-w-0">
                            <p className="font-body text-sm text-[var(--ivory)] truncate">{b.attendee_name}</p>
                            <p className="font-mono text-[10px] text-[var(--ivory)]/40 truncate">{b.workshop_name}</p>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="font-mono text-sm text-[var(--gold)]">{fmt$(b.amount_paid)}</p>
                            <p className="font-mono text-[10px] text-[var(--ivory)]/30">{fmtDate(b.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Workshops */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                    <p className="font-display text-base font-semibold text-[var(--ivory)]">Workshops</p>
                    <button onClick={() => setActiveTab("workshops")} className="flex items-center gap-1 font-mono text-xs text-[var(--gold)] hover:opacity-70 transition-opacity">
                      Manage <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                  {workshops.length === 0 ? (
                    <div className="px-5 py-10 text-center font-mono text-xs text-[var(--ivory)]/20">No workshops yet</div>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {workshops.slice(0, 5).map(w => {
                        const booked = w.spots_total - w.spots_left;
                        const pct = w.spots_total > 0 ? Math.round((booked / w.spots_total) * 100) : 0;
                        return (
                          <div key={w.id} className="px-5 py-3.5 hover:bg-[var(--gold)]/3 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="min-w-0">
                                <p className="font-body text-sm text-[var(--ivory)] truncate">{w.style}</p>
                                <p className="font-mono text-[10px] text-[var(--ivory)]/40">{w.date} · {w.city}</p>
                              </div>
                              <span className="font-mono text-xs text-[var(--gold)] ml-3 flex-shrink-0">{booked}/{w.spots_total}</span>
                            </div>
                            <div className="h-1 overflow-hidden rounded-full bg-[var(--input)]">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: w.spots_left === 0 ? "#f87171" : "var(--gradient-gold)" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── WORKSHOPS TAB ────────────────────────────────────────────── */}
          {activeTab === "workshops" && (
            <motion.div key="workshops" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[var(--ivory)]">Workshops</h2>
                  <p className="font-mono text-xs text-[var(--ivory)]/40 mt-0.5">{workshops.length} total · {soldOutCount} sold out</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setWorkshopView("grid")} className={cn("p-2 rounded-lg transition-colors", workshopView === "grid" ? "bg-[var(--gold)]/15 text-[var(--gold)]" : "text-[var(--ivory)]/30 hover:text-[var(--ivory)]/60")}>
                    <Grid className="h-4 w-4" />
                  </button>
                  <button onClick={() => setWorkshopView("list")} className={cn("p-2 rounded-lg transition-colors", workshopView === "list" ? "bg-[var(--gold)]/15 text-[var(--gold)]" : "text-[var(--ivory)]/30 hover:text-[var(--ivory)]/60")}>
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {workshopView === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {workshops.map((w) => {
                    const wBookings = bookings.filter(b => b.workshop_id === w.id);
                    const revenue = wBookings.reduce((s, b) => s + b.amount_paid, 0);
                    return (
                      <motion.div
                        key={w.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 flex flex-col"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-base font-semibold text-[var(--ivory)] leading-tight">{w.style}</p>
                            {w.song && <p className="font-mono text-[10px] text-[var(--gold)]/60 mt-0.5 truncate">♪ {w.song}</p>}
                          </div>
                          <Badge status={w.spots_left === 0 ? "sold out" : "active"} />
                        </div>

                        {/* Meta */}
                        <div className="space-y-1.5 mb-4">
                          {[
                            { icon: Calendar, text: w.date },
                            { icon: Clock, text: w.time },
                            { icon: MapPin, text: `${w.venue}, ${w.city}` },
                          ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-2 font-mono text-[10px] text-[var(--ivory)]/50">
                              <Icon className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{text}</span>
                            </div>
                          ))}
                        </div>

                        {/* Capacity */}
                        <div className="mb-4">
                          <CapacityBar left={w.spots_left} total={w.spots_total} />
                        </div>

                        {/* Revenue */}
                        <div className="flex items-center justify-between font-mono text-xs mb-4">
                          <span className="text-[var(--ivory)]/40">Revenue</span>
                          <span className="text-[var(--gold)]">{fmt$(revenue)}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => setSelectedWorkshop(w)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[var(--gold)]/30 py-2 font-mono text-xs text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all"
                          >
                            <Eye className="h-3 w-3" /> Guests ({wBookings.length})
                          </button>
                          <button
                            onClick={() => { setEditWorkshop(w); setForm({ ...EMPTY_FORM, ...w }); }}
                            className="rounded-xl border border-[var(--border)] p-2 font-mono text-xs text-[var(--ivory)]/50 hover:text-[var(--ivory)] hover:border-[var(--ivory)]/30 transition-all"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Add new card */}
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="rounded-2xl border border-dashed border-[var(--gold)]/20 bg-[var(--card)]/50 p-5 flex flex-col items-center justify-center gap-2 hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/5 transition-all min-h-[200px]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gold)]/30">
                      <Plus className="h-5 w-5 text-[var(--gold)]/60" />
                    </div>
                    <p className="font-mono text-xs text-[var(--ivory)]/30">Add Workshop</p>
                  </button>
                </div>
              ) : (
                /* List view */
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full font-body text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          {["Workshop", "Date", "City", "Price", "Capacity", "Revenue", ""].map(h => (
                            <th key={h} className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-[var(--ivory)]/40">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {workshops.map(w => {
                          const wBookings = bookings.filter(b => b.workshop_id === w.id);
                          const revenue = wBookings.reduce((s, b) => s + b.amount_paid, 0);
                          return (
                            <tr key={w.id} className="border-b border-[var(--border)] hover:bg-[var(--gold)]/3 transition-colors">
                              <td className="px-5 py-4">
                                <p className="text-[var(--ivory)] font-medium">{w.style}</p>
                                {w.song && <p className="font-mono text-[10px] text-[var(--ivory)]/40">♪ {w.song}</p>}
                              </td>
                              <td className="px-5 py-4 font-mono text-xs text-[var(--ivory)]/60">{w.date}</td>
                              <td className="px-5 py-4 font-mono text-xs text-[var(--ivory)]/60">{w.city}</td>
                              <td className="px-5 py-4 font-mono text-xs text-[var(--gold)]">${w.price}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 overflow-hidden rounded-full bg-[var(--input)]">
                                    <div className="h-full rounded-full" style={{ width: `${Math.round(((w.spots_total - w.spots_left) / w.spots_total) * 100)}%`, background: "var(--gradient-gold)" }} />
                                  </div>
                                  <span className="font-mono text-[10px] text-[var(--ivory)]/50">{w.spots_total - w.spots_left}/{w.spots_total}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 font-mono text-xs text-[var(--gold)]">{fmt$(revenue)}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5">
                                  <button onClick={() => setSelectedWorkshop(w)} className="p-1.5 rounded-lg text-[var(--ivory)]/40 hover:text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all">
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={() => { setEditWorkshop(w); setForm({ ...EMPTY_FORM, ...w }); }} className="p-1.5 rounded-lg text-[var(--ivory)]/40 hover:text-[var(--ivory)] hover:bg-[var(--border)] transition-all">
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── BOOKINGS TAB ─────────────────────────────────────────────── */}
          {activeTab === "bookings" && (
            <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[var(--ivory)]">All Bookings</h2>
                  <p className="font-mono text-xs text-[var(--ivory)]/40 mt-0.5">{filteredBookings.length} of {bookings.length} shown</p>
                </div>
                <button
                  onClick={() => exportCSV(filteredBookings)}
                  className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 font-mono text-xs text-[var(--ivory)]/60 hover:text-[var(--gold)] hover:border-[var(--gold)]/30 transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ivory)]/30" />
                  <input
                    type="text"
                    placeholder="Search name, email, workshop…"
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-4 py-2.5 font-body text-sm text-[var(--ivory)] placeholder:text-[var(--ivory)]/30 outline-none focus:border-[var(--gold)] transition-colors"
                  />
                </div>
                <select
                  value={bookingWorkshopFilter}
                  onChange={e => setBookingWorkshopFilter(e.target.value)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 font-mono text-xs text-[var(--ivory)] outline-none focus:border-[var(--gold)] transition-colors"
                >
                  <option value="all">All Workshops</option>
                  {workshops.map(w => <option key={w.id} value={w.id}>{w.style}</option>)}
                </select>
                <select
                  value={bookingStatusFilter}
                  onChange={e => setBookingStatusFilter(e.target.value)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 font-mono text-xs text-[var(--ivory)] outline-none focus:border-[var(--gold)] transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full font-body text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        {[
                          { label: "Name", col: "attendee_name" },
                          { label: "Email", col: "attendee_email" },
                          { label: "Workshop", col: "workshop_name" },
                          { label: "Date", col: "workshop_date" },
                          { label: "Amount", col: "amount_paid" },
                          { label: "Status", col: "status" },
                          { label: "Booked", col: "created_at" },
                        ].map(({ label, col }) => (
                          <th
                            key={col}
                            onClick={() => toggleSort(col)}
                            className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-[var(--ivory)]/40 cursor-pointer hover:text-[var(--ivory)]/70 transition-colors select-none"
                          >
                            <span className="flex items-center gap-1">
                              {label}
                              {bookingSort.col === col && (
                                bookingSort.dir === "asc" ? <ChevronUp className="h-3 w-3 text-[var(--gold)]" /> : <ChevronDown className="h-3 w-3 text-[var(--gold)]" />
                              )}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b, i) => (
                        <tr key={b.id} className={cn("border-b border-[var(--border)] hover:bg-[var(--gold)]/3 transition-colors", i === filteredBookings.length - 1 && "border-0")}>
                          <td className="px-5 py-4 text-[var(--ivory)] font-medium">{b.attendee_name}</td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-1 text-[var(--ivory)]/60 font-mono text-xs">
                              {b.attendee_email}
                              <CopyButton text={b.attendee_email} />
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[var(--ivory)]/70 max-w-[160px] truncate">{b.workshop_name}</td>
                          <td className="px-5 py-4 font-mono text-xs text-[var(--ivory)]/60">{b.workshop_date}</td>
                          <td className="px-5 py-4 font-mono text-sm text-[var(--gold)]">{fmt$(b.amount_paid)}</td>
                          <td className="px-5 py-4"><Badge status={b.status} /></td>
                          <td className="px-5 py-4 font-mono text-xs text-[var(--ivory)]/40">{fmtDate(b.created_at)}</td>
                        </tr>
                      ))}
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-14 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Search className="h-8 w-8 text-[var(--ivory)]/10" />
                              <p className="font-mono text-xs text-[var(--ivory)]/30">No bookings match your filters</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS TAB ────────────────────────────────────────────── */}
          {activeTab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[var(--ivory)]">Analytics</h2>
                <p className="font-mono text-xs text-[var(--ivory)]/40 mt-0.5">Insights from your booking data</p>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ivory)]/40 mb-2">Avg. Revenue / Workshop</p>
                  <p className="font-display text-2xl font-semibold text-[var(--ivory)]">
                    {workshops.length > 0 ? `$${(totalRevenue / 100 / workshops.length).toFixed(0)}` : "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ivory)]/40 mb-2">Avg. Fill Rate</p>
                  <p className="font-display text-2xl font-semibold text-[var(--ivory)]">
                    {workshops.length > 0
                      ? `${Math.round(workshops.reduce((s, w) => s + ((w.spots_total - w.spots_left) / w.spots_total), 0) / workshops.length * 100)}%`
                      : "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ivory)]/40 mb-2">Avg. Ticket Price</p>
                  <p className="font-display text-2xl font-semibold text-[var(--ivory)]">
                    {bookings.length > 0 ? `$${(totalRevenue / 100 / bookings.length).toFixed(2)}` : "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ivory)]/40 mb-2">Sold Out Workshops</p>
                  <p className="font-display text-2xl font-semibold text-[var(--ivory)]">{soldOutCount}</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="font-display text-base font-semibold text-[var(--ivory)] mb-1">Revenue Over Time</p>
                  <p className="font-mono text-xs text-[var(--ivory)]/40 mb-5">Monthly booking revenue</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={revenueByMonth}>
                      <defs>
                        <linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: "rgba(245,240,232,0.4)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(245,240,232,0.4)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                      <Tooltip contentStyle={{ background: "#1A1410", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px" }} labelStyle={{ color: "#F5F0E8" }} itemStyle={{ color: "#C9A96E" }} formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={2} fill="url(#goldGrad2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="font-display text-base font-semibold text-[var(--ivory)] mb-1">Workshop Performance</p>
                  <p className="font-mono text-xs text-[var(--ivory)]/40 mb-5">Bookings per workshop</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={bookingsPerWorkshop} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "rgba(245,240,232,0.4)", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(245,240,232,0.4)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#1A1410", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px" }} labelStyle={{ color: "#F5F0E8" }} itemStyle={{ color: "#C9A96E" }} />
                      <Bar dataKey="bookings" radius={[4, 4, 0, 0]}>
                        {bookingsPerWorkshop.map((_, i) => <Cell key={i} fill={i === 0 ? "#C9A96E" : "rgba(201,169,110,0.35)"} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Workshop performance table */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--border)]">
                  <p className="font-display text-base font-semibold text-[var(--ivory)]">Workshop Breakdown</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full font-body text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        {["Workshop", "Date", "Bookings", "Fill Rate", "Revenue", "Status"].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-[var(--ivory)]/40">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {workshops.map(w => {
                        const wBookings = bookings.filter(b => b.workshop_id === w.id);
                        const rev = wBookings.reduce((s, b) => s + b.amount_paid, 0);
                        const fillRate = w.spots_total > 0 ? Math.round(((w.spots_total - w.spots_left) / w.spots_total) * 100) : 0;
                        return (
                          <tr key={w.id} className="border-b border-[var(--border)] hover:bg-[var(--gold)]/3 transition-colors">
                            <td className="px-5 py-4 text-[var(--ivory)] font-medium">{w.style}</td>
                            <td className="px-5 py-4 font-mono text-xs text-[var(--ivory)]/60">{w.date}</td>
                            <td className="px-5 py-4 font-mono text-sm text-[var(--ivory)]">{wBookings.length}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1.5 overflow-hidden rounded-full bg-[var(--input)]">
                                  <div className="h-full rounded-full" style={{ width: `${fillRate}%`, background: fillRate === 100 ? "#f87171" : "var(--gradient-gold)" }} />
                                </div>
                                <span className="font-mono text-xs text-[var(--ivory)]/60">{fillRate}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-mono text-sm text-[var(--gold)]">{fmt$(rev)}</td>
                            <td className="px-5 py-4"><Badge status={w.spots_left === 0 ? "sold out" : "active"} /></td>
                          </tr>
                        );
                      })}
                      {workshops.length === 0 && (
                        <tr><td colSpan={6} className="px-5 py-10 text-center font-mono text-xs text-[var(--ivory)]/20">No workshops yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(showAddForm || editWorkshop) && <WorkshopForm />}
        {selectedWorkshop && <GuestListModal />}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <h3 className="font-display text-lg font-semibold text-[var(--ivory)] mb-2">Delete Workshop?</h3>
              <p className="font-mono text-xs text-[var(--ivory)]/50 mb-6">{deleteConfirm.style} · {deleteConfirm.date} — this cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl border border-[var(--border)] py-2.5 font-mono text-sm text-[var(--ivory)]/60">Cancel</button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl bg-red-500/20 border border-red-500/30 py-2.5 font-mono text-sm text-red-400">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
