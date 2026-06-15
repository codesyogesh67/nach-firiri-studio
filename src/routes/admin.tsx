import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, DollarSign, Calendar, Mail, X, Plus, Download,
  LogOut, RefreshCw, Search, ChevronDown, ChevronUp,
  TrendingUp, Clock, MapPin, Music, Edit2, Eye,
  AlertCircle, BarChart2, List, Grid,
  Copy, Check, ArrowUpRight, Zap, Sun, Moon
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
  id: string; created_at: string; workshop_id: string;
  workshop_name: string; workshop_date: string;
  attendee_name: string; attendee_email: string;
  amount_paid: number; status: string;
};
type Workshop = {
  id: string; style: string; song: string; date: string; time: string;
  venue: string; city: string; duration: string; price: number;
  spots_left: number; spots_total: number; price_id: string; active?: boolean;
};
const EMPTY_FORM = {
  id: "", style: "", song: "", date: "", time: "", venue: "", city: "",
  duration: "2 Hours", price: 20, spots_total: 20,
  price_id: "price_1ThcrxQ4li0j4IaZq7eoDSWY",
};
type Tab = "overview" | "workshops" | "bookings" | "analytics";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Nach Firiri" }] }),
  component: AdminPage,
});

const fmt$ = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

// ── Portal Modal — renders outside DOM tree, locks body scroll ────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center p-4 sm:p-8"
      style={{ overscrollBehavior: "contain" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Scrollable content area */}
      <div className="relative z-10 w-full max-w-lg mt-4 max-h-[calc(100vh-4rem)] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="admin-modal-card rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "calc(100vh - 6rem)" }}
        >
          {children}
        </motion.div>
      </div>
    </div>,
    document.body
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-card rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="admin-label">{label}</span>
        <div className="admin-icon-wrap flex h-8 w-8 items-center justify-center rounded-xl">
          <Icon className="h-4 w-4 admin-gold" />
        </div>
      </div>
      <div>
        <p className="font-display text-3xl font-semibold admin-text leading-none">{value}</p>
        {sub && <p className="admin-muted font-mono text-xs mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

function Badge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    paid: "badge-green", confirmed: "badge-green",
    pending: "badge-amber", cancelled: "badge-red",
    refunded: "badge-blue", active: "badge-green",
    "sold out": "badge-red",
  };
  return (
    <span className={cn("admin-badge", map[s] ?? "badge-gold")}>
      {status}
    </span>
  );
}

function CapacityBar({ left, total }: { left: number; total: number }) {
  const booked = total - left;
  const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
  const color = left === 0 ? "#f87171" : left <= 3 ? "#fb923c" : "var(--admin-gold)";
  return (
    <div>
      <div className="flex justify-between font-mono text-[10px] admin-muted mb-1.5">
        <span>{booked}/{total} booked</span>
        <span style={{ color }}>{left === 0 ? "SOLD OUT" : `${left} left`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full admin-track">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1 admin-muted hover:admin-gold transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text", mono = false }: {
  label: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; mono?: boolean;
}) {
  return (
    <div>
      <label className="admin-label block mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn("admin-input w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors", mono && "font-mono text-xs")}
      />
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [b, w] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/bookings?order=created_at.desc`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/workshops?order=date.asc`, { headers }).then(r => r.json()),
      ]);
      if (Array.isArray(b)) setBookings(b);
      if (Array.isArray(w)) setWorkshops(w);
      setLastRefresh(new Date());
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { if (authed) fetchData(); }, [authed]);
  useEffect(() => {
    if (!authed) return;
    const t = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(t);
  }, [authed]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); }
    else setPwError(true);
  };

  const totalRevenue = useMemo(() => bookings.reduce((s, b) => s + b.amount_paid, 0), [bookings]);
  const uniqueAttendees = useMemo(() => new Set(bookings.map(b => b.attendee_email)).size, [bookings]);
  const activeWorkshops = workshops.filter(w => w.active !== false).length;
  const soldOutCount = workshops.filter(w => w.spots_left === 0).length;

  const revenueByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => {
      const m = new Date(b.created_at).toLocaleDateString("en-US", { month: "short" });
      map[m] = (map[m] ?? 0) + b.amount_paid / 100;
    });
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
  }, [bookings]);

  const bookingsPerWorkshop = useMemo(() =>
    workshops.slice(0, 6).map(w => ({
      name: w.style.length > 14 ? w.style.slice(0, 14) + "…" : w.style,
      bookings: bookings.filter(b => b.workshop_id === w.id).length,
    })), [workshops, bookings]);

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

  const toggleSort = (col: string) =>
    setBookingSort(s => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });

  const exportCSV = (rows: Booking[], name = "bookings") => {
    const data = [
      ["Name", "Email", "Workshop", "Date", "Amount", "Status", "Booked At"],
      ...rows.map(b => [b.attendee_name, b.attendee_email, b.workshop_name, b.workshop_date, fmt$(b.amount_paid), b.status, fmtDate(b.created_at)]),
    ];
    const blob = new Blob([data.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${name}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const openEdit = (w: Workshop) => { setEditWorkshop(w); setForm({ ...EMPTY_FORM, ...w }); };
  const closeForm = () => { setShowAddForm(false); setEditWorkshop(null); setSaveMsg(""); setForm(EMPTY_FORM); };

  const handleSaveWorkshop = async () => {
    if (!form.style || !form.date || !form.venue || !form.city) {
      setSaveMsg("Please fill in all required fields."); return;
    }
    setSaving(true); setSaveMsg("");
    try {
      const payload = editWorkshop ? { ...editWorkshop, ...form } : form;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-workshop`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { setSaveMsg("✅ Workshop saved!"); closeForm(); fetchData(true); }
      else setSaveMsg("❌ Something went wrong. Try again.");
    } catch { setSaveMsg("❌ Network error."); }
    setSaving(false);
  };

  // ── CSS variables injected via data-theme ──────────────────────────────
  const themeVars = theme === "dark" ? {
    "--admin-bg": "oklch(0.13 0.008 30)",
    "--admin-surface": "oklch(0.16 0.01 30)",
    "--admin-border": "oklch(0.28 0.02 40 / 55%)",
    "--admin-input-bg": "oklch(0.20 0.012 32)",
    "--admin-text": "oklch(0.95 0.018 80)",
    "--admin-muted": "oklch(0.62 0.06 80 / 60%)",
    "--admin-gold": "oklch(0.74 0.11 85)",
    "--admin-icon-bg": "oklch(0.74 0.11 85 / 12%)",
    "--admin-row-hover": "oklch(0.74 0.11 85 / 4%)",
    "--admin-track": "oklch(0.24 0.015 35)",
    "--admin-backdrop": "rgba(0,0,0,0.6)",
    "--admin-chart-grid": "rgba(255,255,255,0.04)",
    "--admin-chart-tick": "rgba(245,240,232,0.35)",
    "--admin-tooltip-bg": "#1A1410",
  } : {
    "--admin-bg": "#F4F5F7",
    "--admin-surface": "#FFFFFF",
    "--admin-border": "rgba(0,0,0,0.09)",
    "--admin-input-bg": "#F8F9FA",
    "--admin-text": "#111827",
    "--admin-muted": "rgba(17,24,39,0.45)",
    "--admin-gold": "oklch(0.62 0.12 78)",
    "--admin-icon-bg": "oklch(0.62 0.12 78 / 10%)",
    "--admin-row-hover": "oklch(0.62 0.12 78 / 5%)",
    "--admin-track": "#E5E7EB",
    "--admin-backdrop": "rgba(0,0,0,0.35)",
    "--admin-chart-grid": "rgba(0,0,0,0.05)",
    "--admin-chart-tick": "rgba(17,24,39,0.4)",
    "--admin-tooltip-bg": "#1F2937",
  };

  const isModalOpen = showAddForm || !!editWorkshop || !!selectedWorkshop || !!deleteConfirm;

  // ── LOGIN ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-5 pt-20"
        style={themeVars as React.CSSProperties}
      >
        <style>{adminCSS}</style>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="admin-icon-wrap mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
              <Zap className="h-7 w-7 admin-gold" />
            </div>
            <h1 className="font-display text-2xl font-semibold admin-text">Nach Firiri</h1>
            <p className="admin-muted font-mono text-xs mt-1 uppercase tracking-widest">Studio Admin</p>
          </div>
          <div className="admin-card rounded-2xl p-7">
            <label className="admin-label block mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="admin-input w-full rounded-xl px-4 py-3 text-sm outline-none mb-3"
            />
            {pwError && (
              <div className="flex items-center gap-2 text-red-500 font-mono text-xs mb-3">
                <AlertCircle className="h-3 w-3" /> Incorrect password
              </div>
            )}
            <button onClick={handleLogin} className="admin-btn-primary w-full rounded-xl py-3 font-mono text-sm font-medium">
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
          <p className="font-mono text-xs text-[var(--ivory)]/40">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "workshops", label: "Workshops", icon: Calendar },
    { id: "bookings", label: "Bookings", icon: List },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  const tooltipStyle = {
    background: theme === "dark" ? "#1A1410" : "#1F2937",
    border: `1px solid ${theme === "dark" ? "rgba(201,169,110,0.2)" : "rgba(0,0,0,0.1)"}`,
    borderRadius: "12px", fontFamily: "monospace", fontSize: "12px",
  };

  return (
    <div className="min-h-screen admin-theme pt-20" style={themeVars as React.CSSProperties}>
      <style>{adminCSS}</style>

      {/* ── TOP NAV ───────────────────────────────────────────────────── */}
      <div className="sticky top-20 z-40 admin-topnav border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">

          {/* Logo + tabs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="admin-icon-wrap flex h-8 w-8 items-center justify-center rounded-lg">
                <Zap className="h-4 w-4 admin-gold" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold admin-text leading-none">Nach Firiri</p>
                <p className="admin-muted font-mono text-[9px] uppercase tracking-widest mt-0.5">Studio Admin</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-0.5 ml-3">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn("admin-tab flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs transition-all", activeTab === t.id && "admin-tab-active")}
                >
                  <t.icon className="h-3 w-3" /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {lastRefresh && (
              <span className="hidden lg:block admin-muted font-mono text-[10px]">
                {fmtTime(lastRefresh.toISOString())}
              </span>
            )}
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              className="admin-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-xs"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span className="hidden sm:block">{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
            <button
              onClick={() => fetchData(true)}
              className={cn("admin-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-xs", refreshing && "opacity-50")}
            >
              <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
              <span className="hidden sm:block">Refresh</span>
            </button>
            <button
              onClick={() => { setForm(EMPTY_FORM); setShowAddForm(true); }}
              className="admin-btn-primary flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-xs font-medium"
            >
              <Plus className="h-3 w-3" /> Add Workshop
            </button>
            <button
              onClick={() => setAuthed(false)}
              className="admin-btn-ghost flex items-center gap-1.5 rounded-xl px-2.5 py-2 font-mono text-xs admin-logout"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex sm:hidden border-t admin-mobile-tabs px-2 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn("admin-mobile-tab flex items-center gap-1 px-3 py-2.5 font-mono text-xs whitespace-nowrap transition-all border-b-2", activeTab === t.id ? "admin-mobile-tab-active" : "border-transparent")}
            >
              <t.icon className="h-3 w-3" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── PAGE CONTENT ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-5 py-8">
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ──────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total Bookings" value={bookings.length} sub="All time" icon={Users} />
                <StatCard label="Total Revenue" value={`$${(totalRevenue / 100).toFixed(0)}`} sub={`${fmt$(totalRevenue)} exact`} icon={DollarSign} />
                <StatCard label="Active Workshops" value={activeWorkshops} sub={`${soldOutCount} sold out`} icon={Calendar} />
                <StatCard label="Unique Attendees" value={uniqueAttendees} sub="Distinct emails" icon={Mail} />
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="admin-card rounded-2xl p-5">
                  <p className="font-display text-base font-semibold admin-text mb-0.5">Revenue</p>
                  <p className="admin-muted font-mono text-xs mb-5">By month</p>
                  {revenueByMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={revenueByMonth}>
                        <defs>
                          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.74 0.11 85)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="oklch(0.74 0.11 85)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-chart-grid)" />
                        <XAxis dataKey="month" tick={{ fill: "var(--admin-chart-tick)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--admin-chart-tick)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#F5F0E8" }} itemStyle={{ color: "oklch(0.74 0.11 85)" }} formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                        <Area type="monotone" dataKey="revenue" stroke="oklch(0.74 0.11 85)" strokeWidth={2} fill="url(#goldGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center admin-muted font-mono text-xs">No revenue data yet</div>
                  )}
                </div>
                <div className="admin-card rounded-2xl p-5">
                  <p className="font-display text-base font-semibold admin-text mb-0.5">Bookings</p>
                  <p className="admin-muted font-mono text-xs mb-5">Per workshop</p>
                  {bookingsPerWorkshop.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={bookingsPerWorkshop} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-chart-grid)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "var(--admin-chart-tick)", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--admin-chart-tick)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#F5F0E8" }} itemStyle={{ color: "oklch(0.74 0.11 85)" }} />
                        <Bar dataKey="bookings" radius={[4, 4, 0, 0]}>
                          {bookingsPerWorkshop.map((_, i) => <Cell key={i} fill={i === 0 ? "oklch(0.74 0.11 85)" : "oklch(0.74 0.11 85 / 35%)"} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center admin-muted font-mono text-xs">No data yet</div>
                  )}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {/* Recent Bookings */}
                <div className="admin-card rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 admin-table-header">
                    <p className="font-display text-base font-semibold admin-text">Recent Bookings</p>
                    <button onClick={() => setActiveTab("bookings")} className="flex items-center gap-1 font-mono text-xs admin-gold-text hover:opacity-70 transition-opacity">
                      View all <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                  {bookings.slice(0, 5).length === 0 ? (
                    <div className="px-5 py-10 text-center admin-muted font-mono text-xs">No bookings yet</div>
                  ) : (
                    <div className="admin-divide">
                      {bookings.slice(0, 5).map(b => (
                        <div key={b.id} className="flex items-center justify-between px-5 py-3.5 admin-row">
                          <div className="min-w-0">
                            <p className="text-sm admin-text font-medium truncate">{b.attendee_name}</p>
                            <p className="admin-muted font-mono text-[10px] truncate">{b.workshop_name}</p>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="font-mono text-sm admin-gold-text">{fmt$(b.amount_paid)}</p>
                            <p className="admin-muted font-mono text-[10px]">{fmtDate(b.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Workshops quick */}
                <div className="admin-card rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 admin-table-header">
                    <p className="font-display text-base font-semibold admin-text">Workshops</p>
                    <button onClick={() => setActiveTab("workshops")} className="flex items-center gap-1 font-mono text-xs admin-gold-text hover:opacity-70 transition-opacity">
                      Manage <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                  {workshops.length === 0 ? (
                    <div className="px-5 py-10 text-center admin-muted font-mono text-xs">No workshops yet</div>
                  ) : (
                    <div className="admin-divide">
                      {workshops.slice(0, 5).map(w => {
                        const booked = w.spots_total - w.spots_left;
                        const pct = w.spots_total > 0 ? Math.round((booked / w.spots_total) * 100) : 0;
                        return (
                          <div key={w.id} className="px-5 py-3.5 admin-row">
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-sm admin-text font-medium truncate">{w.style}</p>
                              <span className="font-mono text-xs admin-gold-text ml-3 flex-shrink-0">{booked}/{w.spots_total}</span>
                            </div>
                            <div className="h-1 overflow-hidden rounded-full admin-track">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: w.spots_left === 0 ? "#f87171" : "oklch(0.74 0.11 85)" }} />
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

          {/* ── WORKSHOPS ─────────────────────────────────────────────── */}
          {activeTab === "workshops" && (
            <motion.div key="workshops" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold admin-text">Workshops</h2>
                  <p className="admin-muted font-mono text-xs mt-0.5">{workshops.length} total · {soldOutCount} sold out</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setWorkshopView("grid")} className={cn("p-2 rounded-lg transition-colors", workshopView === "grid" ? "admin-view-active" : "admin-view-inactive")}>
                    <Grid className="h-4 w-4" />
                  </button>
                  <button onClick={() => setWorkshopView("list")} className={cn("p-2 rounded-lg transition-colors", workshopView === "list" ? "admin-view-active" : "admin-view-inactive")}>
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {workshopView === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {workshops.map(w => {
                    const wBookings = bookings.filter(b => b.workshop_id === w.id);
                    const revenue = wBookings.reduce((s, b) => s + b.amount_paid, 0);
                    return (
                      <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="admin-card rounded-2xl p-5 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-base font-semibold admin-text leading-tight">{w.style}</p>
                            {w.song && <p className="admin-gold-text font-mono text-[10px] mt-0.5 opacity-70 truncate">♪ {w.song}</p>}
                          </div>
                          <Badge status={w.spots_left === 0 ? "sold out" : "active"} />
                        </div>
                        <div className="space-y-1.5 mb-4">
                          {[{ icon: Calendar, text: w.date }, { icon: Clock, text: w.time }, { icon: MapPin, text: `${w.venue}, ${w.city}` }].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-2 font-mono text-[10px] admin-muted">
                              <Icon className="h-3 w-3 flex-shrink-0" /><span className="truncate">{text}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mb-4"><CapacityBar left={w.spots_left} total={w.spots_total} /></div>
                        <div className="flex items-center justify-between font-mono text-xs mb-4">
                          <span className="admin-muted">Revenue</span>
                          <span className="admin-gold-text">{fmt$(revenue)}</span>
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <button onClick={() => setSelectedWorkshop(w)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl admin-btn-outline py-2 font-mono text-xs">
                            <Eye className="h-3 w-3" /> Guests ({wBookings.length})
                          </button>
                          <button onClick={() => openEdit(w)} className="admin-btn-ghost rounded-xl p-2 font-mono text-xs">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                  <button
                    onClick={() => { setForm(EMPTY_FORM); setShowAddForm(true); }}
                    className="admin-add-card rounded-2xl p-5 flex flex-col items-center justify-center gap-2 min-h-[200px]"
                  >
                    <div className="admin-icon-wrap flex h-10 w-10 items-center justify-center rounded-xl">
                      <Plus className="h-5 w-5 admin-gold" />
                    </div>
                    <p className="admin-muted font-mono text-xs">Add Workshop</p>
                  </button>
                </div>
              ) : (
                <div className="admin-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="admin-table-header">
                          {["Workshop", "Date", "City", "Price", "Capacity", "Revenue", ""].map(h => (
                            <th key={h} className="px-5 py-3 text-left admin-th">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {workshops.map(w => {
                          const wBookings = bookings.filter(b => b.workshop_id === w.id);
                          const revenue = wBookings.reduce((s, b) => s + b.amount_paid, 0);
                          return (
                            <tr key={w.id} className="admin-tr">
                              <td className="px-5 py-4">
                                <p className="admin-text font-medium">{w.style}</p>
                                {w.song && <p className="admin-muted font-mono text-[10px]">♪ {w.song}</p>}
                              </td>
                              <td className="px-5 py-4 admin-muted font-mono text-xs">{w.date}</td>
                              <td className="px-5 py-4 admin-muted font-mono text-xs">{w.city}</td>
                              <td className="px-5 py-4 admin-gold-text font-mono text-xs">${w.price}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 overflow-hidden rounded-full admin-track">
                                    <div className="h-full rounded-full" style={{ width: `${Math.round(((w.spots_total - w.spots_left) / w.spots_total) * 100)}%`, background: "oklch(0.74 0.11 85)" }} />
                                  </div>
                                  <span className="admin-muted font-mono text-[10px]">{w.spots_total - w.spots_left}/{w.spots_total}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 admin-gold-text font-mono text-xs">{fmt$(revenue)}</td>
                              <td className="px-5 py-4">
                                <div className="flex gap-1">
                                  <button onClick={() => setSelectedWorkshop(w)} className="admin-btn-ghost p-1.5 rounded-lg"><Eye className="h-3.5 w-3.5" /></button>
                                  <button onClick={() => openEdit(w)} className="admin-btn-ghost p-1.5 rounded-lg"><Edit2 className="h-3.5 w-3.5" /></button>
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

          {/* ── BOOKINGS ──────────────────────────────────────────────── */}
          {activeTab === "bookings" && (
            <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold admin-text">All Bookings</h2>
                  <p className="admin-muted font-mono text-xs mt-0.5">{filteredBookings.length} of {bookings.length} shown</p>
                </div>
                <button onClick={() => exportCSV(filteredBookings)} className="admin-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-xs">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 admin-muted" />
                  <input
                    type="text"
                    placeholder="Search name, email, workshop…"
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                    className="admin-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <select value={bookingWorkshopFilter} onChange={e => setBookingWorkshopFilter(e.target.value)} className="admin-input rounded-xl px-3 py-2.5 font-mono text-xs outline-none">
                  <option value="all">All Workshops</option>
                  {workshops.map(w => <option key={w.id} value={w.id}>{w.style}</option>)}
                </select>
                <select value={bookingStatusFilter} onChange={e => setBookingStatusFilter(e.target.value)} className="admin-input rounded-xl px-3 py-2.5 font-mono text-xs outline-none">
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="admin-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="admin-table-header">
                        {[["Name","attendee_name"],["Email","attendee_email"],["Workshop","workshop_name"],["Date","workshop_date"],["Amount","amount_paid"],["Status","status"],["Booked","created_at"]].map(([label, col]) => (
                          <th key={col} onClick={() => toggleSort(col)} className="px-5 py-3 text-left admin-th cursor-pointer hover:opacity-80 select-none">
                            <span className="flex items-center gap-1">
                              {label}
                              {bookingSort.col === col && (bookingSort.dir === "asc" ? <ChevronUp className="h-3 w-3 admin-gold" /> : <ChevronDown className="h-3 w-3 admin-gold" />)}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b, i) => (
                        <tr key={b.id} className={cn("admin-tr", i === filteredBookings.length - 1 && "border-0")}>
                          <td className="px-5 py-4 admin-text font-medium">{b.attendee_name}</td>
                          <td className="px-5 py-4">
                            <span className="flex items-center admin-muted font-mono text-xs">{b.attendee_email}<CopyBtn text={b.attendee_email} /></span>
                          </td>
                          <td className="px-5 py-4 admin-muted max-w-[160px] truncate">{b.workshop_name}</td>
                          <td className="px-5 py-4 admin-muted font-mono text-xs">{b.workshop_date}</td>
                          <td className="px-5 py-4 admin-gold-text font-mono text-sm">{fmt$(b.amount_paid)}</td>
                          <td className="px-5 py-4"><Badge status={b.status} /></td>
                          <td className="px-5 py-4 admin-muted font-mono text-xs">{fmtDate(b.created_at)}</td>
                        </tr>
                      ))}
                      {filteredBookings.length === 0 && (
                        <tr><td colSpan={7} className="px-5 py-14 text-center admin-muted font-mono text-xs">No bookings match your filters</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS ─────────────────────────────────────────────── */}
          {activeTab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold admin-text">Analytics</h2>
                <p className="admin-muted font-mono text-xs mt-0.5">Insights from your booking data</p>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Avg Revenue / Workshop", value: workshops.length > 0 ? `$${(totalRevenue / 100 / workshops.length).toFixed(0)}` : "—" },
                  { label: "Avg Fill Rate", value: workshops.length > 0 ? `${Math.round(workshops.reduce((s, w) => s + ((w.spots_total - w.spots_left) / w.spots_total), 0) / workshops.length * 100)}%` : "—" },
                  { label: "Avg Ticket Price", value: bookings.length > 0 ? `$${(totalRevenue / 100 / bookings.length).toFixed(2)}` : "—" },
                  { label: "Sold Out Workshops", value: soldOutCount },
                ].map(s => (
                  <div key={s.label} className="admin-card rounded-2xl p-5">
                    <p className="admin-label mb-2">{s.label}</p>
                    <p className="font-display text-2xl font-semibold admin-text">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="admin-card rounded-2xl p-5">
                  <p className="font-display text-base font-semibold admin-text mb-0.5">Revenue Over Time</p>
                  <p className="admin-muted font-mono text-xs mb-5">Monthly booking revenue</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={revenueByMonth}>
                      <defs>
                        <linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.74 0.11 85)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.74 0.11 85)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-chart-grid)" />
                      <XAxis dataKey="month" tick={{ fill: "var(--admin-chart-tick)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--admin-chart-tick)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#F5F0E8" }} itemStyle={{ color: "oklch(0.74 0.11 85)" }} formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="oklch(0.74 0.11 85)" strokeWidth={2} fill="url(#goldGrad2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="admin-card rounded-2xl p-5">
                  <p className="font-display text-base font-semibold admin-text mb-0.5">Workshop Performance</p>
                  <p className="admin-muted font-mono text-xs mb-5">Bookings per workshop</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={bookingsPerWorkshop} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-chart-grid)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--admin-chart-tick)", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--admin-chart-tick)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#F5F0E8" }} itemStyle={{ color: "oklch(0.74 0.11 85)" }} />
                      <Bar dataKey="bookings" radius={[4, 4, 0, 0]}>
                        {bookingsPerWorkshop.map((_, i) => <Cell key={i} fill={i === 0 ? "oklch(0.74 0.11 85)" : "oklch(0.74 0.11 85 / 35%)"} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="admin-card rounded-2xl overflow-hidden">
                <div className="px-5 py-4 admin-table-header"><p className="font-display text-base font-semibold admin-text">Workshop Breakdown</p></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="admin-table-header">
                        {["Workshop", "Date", "Bookings", "Fill Rate", "Revenue", "Status"].map(h => (
                          <th key={h} className="px-5 py-3 text-left admin-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {workshops.map(w => {
                        const wB = bookings.filter(b => b.workshop_id === w.id);
                        const rev = wB.reduce((s, b) => s + b.amount_paid, 0);
                        const fill = w.spots_total > 0 ? Math.round(((w.spots_total - w.spots_left) / w.spots_total) * 100) : 0;
                        return (
                          <tr key={w.id} className="admin-tr">
                            <td className="px-5 py-4 admin-text font-medium">{w.style}</td>
                            <td className="px-5 py-4 admin-muted font-mono text-xs">{w.date}</td>
                            <td className="px-5 py-4 admin-text font-mono text-sm">{wB.length}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1.5 overflow-hidden rounded-full admin-track">
                                  <div className="h-full rounded-full" style={{ width: `${fill}%`, background: fill === 100 ? "#f87171" : "oklch(0.74 0.11 85)" }} />
                                </div>
                                <span className="admin-muted font-mono text-xs">{fill}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 admin-gold-text font-mono text-sm">{fmt$(rev)}</td>
                            <td className="px-5 py-4"><Badge status={w.spots_left === 0 ? "sold out" : "active"} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── MODALS (via Portal) ────────────────────────────────────────── */}
      <AnimatePresence>

        {/* Add / Edit Workshop */}
        {(showAddForm || !!editWorkshop) && (
          <Modal onClose={closeForm}>
            {/* Fixed header */}
            <div className="flex items-center justify-between px-6 py-4 admin-modal-header flex-shrink-0">
              <div>
                <h3 className="font-display text-xl font-semibold admin-text">{editWorkshop ? "Edit Workshop" : "New Workshop"}</h3>
                <p className="admin-muted font-mono text-xs mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={closeForm} className="admin-btn-ghost rounded-xl p-2 flex-shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* Details */}
              <div className="admin-form-section rounded-xl p-4 space-y-3">
                <p className="admin-label mb-2">Workshop Details</p>
                <InputField label="Workshop Name *" value={form.style} onChange={v => setForm(f => ({ ...f, style: v }))} placeholder="e.g. Nach Firiri Heels" />
                <InputField label="Song / Theme" value={form.song} onChange={v => setForm(f => ({ ...f, song: v }))} placeholder="e.g. Nach Firiri" />
                <InputField label="Venue *" value={form.venue} onChange={v => setForm(f => ({ ...f, venue: v }))} placeholder="e.g. Ripley-Grier Studios" />
                <InputField label="City *" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="e.g. New York" />
              </div>

              {/* Schedule */}
              <div className="admin-form-section rounded-xl p-4 space-y-3">
                <p className="admin-label mb-2">Schedule</p>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Date *" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} placeholder="July 18, 2026" />
                  <InputField label="Time *" value={form.time} onChange={v => setForm(f => ({ ...f, time: v }))} placeholder="7:00–9:00 PM" />
                </div>
                <InputField label="Duration" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} placeholder="2 Hours" />
              </div>

              {/* Pricing */}
              <div className="admin-form-section rounded-xl p-4 space-y-3">
                <p className="admin-label mb-2">Pricing & Capacity</p>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Price ($)" value={form.price} onChange={v => setForm(f => ({ ...f, price: Number(v) }))} type="number" />
                  <InputField label="Total Spots" value={form.spots_total} onChange={v => setForm(f => ({ ...f, spots_total: Number(v) }))} type="number" />
                </div>
                <InputField label="Stripe Price ID *" value={form.price_id} onChange={v => setForm(f => ({ ...f, price_id: v }))} placeholder="price_1..." mono />
              </div>

              {saveMsg && (
                <p className="font-mono text-xs text-center" style={{ color: saveMsg.startsWith("✅") ? "#22c55e" : "#ef4444" }}>
                  {saveMsg}
                </p>
              )}
            </div>

            {/* Fixed footer */}
            <div className="flex gap-3 px-6 py-4 admin-modal-footer flex-shrink-0">
              <button onClick={closeForm} className="flex-1 admin-btn-ghost rounded-xl py-3 font-mono text-sm">
                Cancel
              </button>
              <button onClick={handleSaveWorkshop} disabled={saving} className="flex-1 admin-btn-primary rounded-xl py-3 font-mono text-sm font-medium disabled:opacity-50">
                {saving ? "Saving…" : editWorkshop ? "Save Changes" : "Add Workshop"}
              </button>
            </div>
          </Modal>
        )}

        {/* Guest List */}
        {!!selectedWorkshop && (() => {
          const guests = bookings.filter(b => b.workshop_id === selectedWorkshop.id);
          const revenue = guests.reduce((s, b) => s + b.amount_paid, 0);
          return (
            <Modal onClose={() => setSelectedWorkshop(null)}>
              <div className="flex items-start justify-between px-6 py-4 admin-modal-header flex-shrink-0">
                <div>
                  <h3 className="font-display text-xl font-semibold admin-text">{selectedWorkshop.style}</h3>
                  <div className="flex items-center gap-3 mt-1 admin-muted font-mono text-xs">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{selectedWorkshop.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedWorkshop.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => exportCSV(guests, selectedWorkshop.style)} className="admin-btn-outline flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-xs">
                    <Download className="h-3 w-3" /> Export
                  </button>
                  <button onClick={() => setSelectedWorkshop(null)} className="admin-btn-ghost rounded-xl p-2">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-px admin-stats-row flex-shrink-0">
                {[{ label: "Attendees", value: guests.length }, { label: "Revenue", value: fmt$(revenue) }, { label: "Spots Left", value: selectedWorkshop.spots_left }].map(s => (
                  <div key={s.label} className="admin-modal-card px-5 py-4 text-center">
                    <p className="font-display text-xl font-semibold admin-text">{s.value}</p>
                    <p className="admin-label mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="overflow-y-auto flex-1 p-4">
                {guests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Users className="h-10 w-10 admin-muted" />
                    <p className="admin-muted font-mono text-xs">No bookings yet</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {["#", "Name", "Email", "Amount", "Booked"].map(h => (
                          <th key={h} className="pb-3 text-left admin-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((b, i) => (
                        <tr key={b.id} className="admin-tr">
                          <td className="py-3 admin-muted font-mono text-[10px]">{i + 1}</td>
                          <td className="py-3 admin-text font-medium">{b.attendee_name}</td>
                          <td className="py-3">
                            <span className="flex items-center admin-muted font-mono text-xs">{b.attendee_email}<CopyBtn text={b.attendee_email} /></span>
                          </td>
                          <td className="py-3 admin-gold-text font-mono text-sm">{fmt$(b.amount_paid)}</td>
                          <td className="py-3 admin-muted font-mono text-xs">{fmtDate(b.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Modal>
          );
        })()}

        {/* Delete confirm */}
        {!!deleteConfirm && (
          <Modal onClose={() => setDeleteConfirm(null)}>
            <div className="px-6 py-6 flex flex-col gap-5">
              <div>
                <h3 className="font-display text-lg font-semibold admin-text mb-1">Delete Workshop?</h3>
                <p className="admin-muted font-mono text-xs">{deleteConfirm.style} · {deleteConfirm.date} — this cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 admin-btn-ghost rounded-xl py-2.5 font-mono text-sm">Cancel</button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl py-2.5 font-mono text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors">Delete</button>
              </div>
            </div>
          </Modal>
        )}

      </AnimatePresence>
    </div>
  );
}

// ── Scoped CSS injected via <style> tag ────────────────────────────────────
const adminCSS = `
  .admin-theme { background: var(--admin-bg); }
  .admin-topnav { background: var(--admin-bg); border-color: var(--admin-border); }
  .admin-mobile-tabs { border-color: var(--admin-border); background: var(--admin-bg); }
  .admin-card { background: var(--admin-surface); border: 1px solid var(--admin-border); }
  .admin-modal-card { background: var(--admin-surface); border: 1px solid var(--admin-border); }
  .admin-modal-header { background: var(--admin-surface); border-bottom: 1px solid var(--admin-border); }
  .admin-modal-footer { background: var(--admin-surface); border-top: 1px solid var(--admin-border); }
  .admin-stats-row { background: var(--admin-border); }
  .admin-form-section { background: var(--admin-input-bg); border: 1px solid var(--admin-border); }
  .admin-text { color: var(--admin-text); }
  .admin-muted { color: var(--admin-muted); }
  .admin-gold { color: var(--admin-gold); }
  .admin-gold-text { color: var(--admin-gold); }
  .admin-label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--admin-muted); }
  .admin-icon-wrap { background: var(--admin-icon-bg); }
  .admin-track { background: var(--admin-track); }
  .admin-divide > * + * { border-top: 1px solid var(--admin-border); }
  .admin-table-header { border-bottom: 1px solid var(--admin-border); background: var(--admin-input-bg); }
  .admin-th { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--admin-muted); }
  .admin-tr { border-bottom: 1px solid var(--admin-border); transition: background 0.1s; }
  .admin-tr:hover { background: var(--admin-row-hover); }
  .admin-row { transition: background 0.1s; }
  .admin-row:hover { background: var(--admin-row-hover); }
  .admin-input { background: var(--admin-input-bg); border: 1px solid var(--admin-border); color: var(--admin-text); font-family: 'DM Sans', sans-serif; }
  .admin-input:focus { border-color: var(--admin-gold); }
  .admin-input::placeholder { color: var(--admin-muted); }
  .admin-btn-primary { background: linear-gradient(135deg, oklch(0.81 0.14 88), oklch(0.66 0.09 78)); color: #1A1410; }
  .admin-btn-primary:hover { opacity: 0.92; }
  .admin-btn-ghost { color: var(--admin-muted); border: 1px solid var(--admin-border); transition: all 0.15s; }
  .admin-btn-ghost:hover { color: var(--admin-text); border-color: var(--admin-text); }
  .admin-btn-outline { color: var(--admin-gold); border: 1px solid color-mix(in oklch, var(--admin-gold) 40%, transparent); transition: all 0.15s; }
  .admin-btn-outline:hover { background: color-mix(in oklch, var(--admin-gold) 10%, transparent); }
  .admin-logout:hover { color: #f87171 !important; border-color: rgba(248,113,113,0.3) !important; }
  .admin-tab { color: var(--admin-muted); }
  .admin-tab:hover { color: var(--admin-text); background: var(--admin-input-bg); }
  .admin-tab-active { color: var(--admin-gold); background: var(--admin-icon-bg); }
  .admin-mobile-tab { color: var(--admin-muted); }
  .admin-mobile-tab-active { color: var(--admin-gold); border-color: var(--admin-gold) !important; }
  .admin-add-card { border: 1.5px dashed color-mix(in oklch, var(--admin-gold) 25%, transparent); background: transparent; transition: all 0.2s; cursor: pointer; }
  .admin-add-card:hover { border-color: color-mix(in oklch, var(--admin-gold) 50%, transparent); background: var(--admin-icon-bg); }
  .admin-view-active { background: var(--admin-icon-bg); color: var(--admin-gold); }
  .admin-view-inactive { color: var(--admin-muted); }
  .admin-view-inactive:hover { color: var(--admin-text); }
  .admin-badge { display: inline-flex; align-items: center; border-radius: 9999px; border: 1px solid; padding: 2px 10px; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; }
  .badge-green { background: rgba(34,197,94,0.1); color: #22c55e; border-color: rgba(34,197,94,0.2); }
  .badge-amber { background: rgba(245,158,11,0.1); color: #f59e0b; border-color: rgba(245,158,11,0.2); }
  .badge-red { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }
  .badge-blue { background: rgba(59,130,246,0.1); color: #3b82f6; border-color: rgba(59,130,246,0.2); }
  .badge-gold { background: var(--admin-icon-bg); color: var(--admin-gold); border-color: color-mix(in oklch, var(--admin-gold) 30%, transparent); }
`;
