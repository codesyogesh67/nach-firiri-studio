import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, DollarSign, Calendar, Mail, X, Plus, Download,
  LogOut, RefreshCw, Search, ChevronDown, ChevronUp,
  TrendingUp, Clock, MapPin, Edit2, Eye,
  AlertCircle, BarChart2, List, Grid,
  Copy, Check, ArrowUpRight, Zap, Sun, Moon,
  ArrowLeft, Home, ChevronRight
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

// ── helpers ────────────────────────────────────────────────────────────────
const fmt$ = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

// ── Portal Modal ───────────────────────────────────────────────────────────
function Modal({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 sm:p-10" style={{ overscrollBehavior: "contain" }}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative z-10 w-full mt-4 flex flex-col", wide ? "max-w-2xl" : "max-w-lg")}>
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.99 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="a-modal rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "calc(100vh - 5rem)" }}
        >
          {children}
        </motion.div>
      </div>
    </div>,
    document.body
  );
}

// ── CopyBtn ────────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
      className="ml-1.5 opacity-40 hover:opacity-100 transition-opacity">
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls: Record<string, string> = {
    paid: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
    confirmed: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
    active: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/12 text-amber-400 border-amber-500/20",
    cancelled: "bg-red-500/12 text-red-400 border-red-500/20",
    refunded: "bg-sky-500/12 text-sky-400 border-sky-500/20",
    "sold out": "bg-red-500/12 text-red-400 border-red-500/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide", cls[s] ?? "bg-[var(--ag)] text-[var(--gold)] border-[var(--ag)]")}>
      {status}
    </span>
  );
}

// ── CapBar ─────────────────────────────────────────────────────────────────
function CapBar({ left, total }: { left: number; total: number }) {
  const booked = total - left, pct = total > 0 ? Math.round((booked / total) * 100) : 0;
  const col = left === 0 ? "#f87171" : left <= 3 ? "#fb923c" : "var(--gold)";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--tm)" }}>
        <span>{booked} / {total} booked</span>
        <span style={{ color: col }}>{left === 0 ? "SOLD OUT" : `${left} spots left`}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--track)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: col }} />
      </div>
    </div>
  );
}

// ── InputField ─────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text", mono = false, half = false }: {
  label: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; mono?: boolean; half?: boolean;
}) {
  return (
    <div className={half ? "flex-1" : "w-full"}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tm)" }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className={cn("a-input w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors", mono && "font-mono text-xs")}
      />
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon: React.ElementType }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="a-card rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: "var(--tm)" }}>{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--ag)" }}>
          <Icon className="h-4 w-4" style={{ color: "var(--gold)" }} />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--tm)" }}>{sub}</p>}
    </motion.div>
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

  const [tab, setTab] = useState<Tab>("overview");
  const [workshopView, setWorkshopView] = useState<"list" | "grid">("list");
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editWorkshop, setEditWorkshop] = useState<Workshop | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // bookings filters
  const [search, setSearch] = useState("");
  const [wFilter, setWFilter] = useState("all");
  const [sFilter, setSFilter] = useState("all");
  const [sort, setSort] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "created_at", dir: "desc" });

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

  const totalRevenue = useMemo(() => bookings.reduce((s, b) => s + b.amount_paid, 0), [bookings]);
  const uniqueAttendees = useMemo(() => new Set(bookings.map(b => b.attendee_email)).size, [bookings]);
  const soldOutCount = workshops.filter(w => w.spots_left === 0).length;

  const revenueByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => {
      const m = new Date(b.created_at).toLocaleDateString("en-US", { month: "short" });
      map[m] = (map[m] ?? 0) + b.amount_paid / 100;
    });
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
  }, [bookings]);

  const bookingsPerWS = useMemo(() =>
    workshops.slice(0, 8).map(w => ({
      name: w.style.length > 12 ? w.style.slice(0, 12) + "…" : w.style,
      bookings: bookings.filter(b => b.workshop_id === w.id).length,
    })), [workshops, bookings]);

  const filteredBookings = useMemo(() => {
    let list = [...bookings];
    if (search) { const q = search.toLowerCase(); list = list.filter(b => b.attendee_name.toLowerCase().includes(q) || b.attendee_email.toLowerCase().includes(q) || b.workshop_name.toLowerCase().includes(q)); }
    if (wFilter !== "all") list = list.filter(b => b.workshop_id === wFilter);
    if (sFilter !== "all") list = list.filter(b => b.status.toLowerCase() === sFilter);
    list.sort((a, b) => { const av = (a as any)[sort.col] ?? ""; const bv = (b as any)[sort.col] ?? ""; return sort.dir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1); });
    return list;
  }, [bookings, search, wFilter, sFilter, sort]);

  const toggleSort = (col: string) =>
    setSort(s => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });

  const exportCSV = (rows: Booking[], name = "bookings") => {
    const data = [["Name","Email","Workshop","Date","Amount","Status","Booked At"], ...rows.map(b => [b.attendee_name, b.attendee_email, b.workshop_name, b.workshop_date, fmt$(b.amount_paid), b.status, fmtDate(b.created_at)])];
    const blob = new Blob([data.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${name}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const openEdit = (w: Workshop) => { setEditWorkshop(w); setForm({ ...EMPTY_FORM, ...w }); };
  const closeForm = () => { setShowAddForm(false); setEditWorkshop(null); setSaveMsg(""); setForm(EMPTY_FORM); };

  const handleSave = async () => {
    if (!form.style || !form.date || !form.venue || !form.city) { setSaveMsg("Please fill required fields."); return; }
    setSaving(true); setSaveMsg("");
    try {
      const payload = editWorkshop ? { ...editWorkshop, ...form } : form;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-workshop`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { setSaveMsg("✅ Workshop saved!"); closeForm(); fetchData(true); }
      else setSaveMsg("❌ Something went wrong.");
    } catch { setSaveMsg("❌ Network error."); }
    setSaving(false);
  };

  // ── Theme vars ────────────────────────────────────────────────────────────
  const D = {
    "--bg": "#0E0D0C",
    "--sidebar": "#141312",
    "--surface": "#1A1917",
    "--surface2": "#201E1C",
    "--border": "rgba(255,255,255,0.07)",
    "--text": "#F2EEE8",
    "--tm": "rgba(242,238,232,0.45)",
    "--gold": "#C9A96E",
    "--ag": "rgba(201,169,110,0.12)",
    "--track": "rgba(255,255,255,0.08)",
    "--input-bg": "#1E1C1A",
    "--form-bg": "#161412",
    "--hover": "rgba(201,169,110,0.05)",
    "--chart-grid": "rgba(255,255,255,0.04)",
    "--chart-tick": "rgba(242,238,232,0.3)",
    "--tooltip": "#1A1917",
  };
  const L = {
    "--bg": "#F0F2F5",
    "--sidebar": "#FFFFFF",
    "--surface": "#FFFFFF",
    "--surface2": "#F7F8FA",
    "--border": "rgba(0,0,0,0.08)",
    "--text": "#111827",
    "--tm": "rgba(17,24,39,0.45)",
    "--gold": "#A07840",
    "--ag": "rgba(160,120,64,0.1)",
    "--track": "rgba(0,0,0,0.08)",
    "--input-bg": "#F3F4F6",
    "--form-bg": "#F7F8FA",
    "--hover": "rgba(160,120,64,0.05)",
    "--chart-grid": "rgba(0,0,0,0.05)",
    "--chart-tick": "rgba(17,24,39,0.35)",
    "--tooltip": "#1F2937",
  };
  const vars = theme === "dark" ? D : L;

  const tooltipStyle = { background: vars["--tooltip"], border: `1px solid ${vars["--border"]}`, borderRadius: "10px", fontFamily: "DM Sans, sans-serif", fontSize: "13px" };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5" style={vars as React.CSSProperties}>
        <style>{css}</style>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: "var(--ag)", border: "1px solid var(--border)" }}>
              <Zap className="h-7 w-7" style={{ color: "var(--gold)" }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif" }}>Nach Firiri</h1>
            <p className="text-sm mt-1" style={{ color: "var(--tm)" }}>Studio Admin</p>
          </div>
          <div className="a-card rounded-2xl p-7 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--tm)" }}>Password</label>
              <input
                type="password" placeholder="Enter admin password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (password === ADMIN_PASSWORD ? (setAuthed(true), setPwError(false)) : setPwError(true))}
                className="a-input w-full rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>
            {pwError && <div className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="h-4 w-4" /> Incorrect password</div>}
            <button onClick={() => password === ADMIN_PASSWORD ? (setAuthed(true), setPwError(false)) : setPwError(true)}
              className="w-full rounded-xl py-3 text-sm font-semibold transition-all" style={{ background: "var(--gold)", color: "#1A1410" }}>
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={vars as React.CSSProperties}>
        <style>{css}</style>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "var(--tm)" }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ── NAV ITEMS ──────────────────────────────────────────────────────────────
  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "workshops", label: "Workshops", icon: Calendar },
    { id: "bookings", label: "Bookings", icon: List },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  // ── WORKSHOP DETAIL PANEL (shown on row click) ─────────────────────────────
  const WorkshopPanel = ({ w, onClose }: { w: Workshop; onClose: () => void }) => {
    const guests = bookings.filter(b => b.workshop_id === w.id);
    const rev = guests.reduce((s, b) => s + b.amount_paid, 0);
    const booked = w.spots_total - w.spots_left;
    const pct = w.spots_total > 0 ? Math.round((booked / w.spots_total) * 100) : 0;
    return (
      <Modal onClose={onClose} wide>
        <div className="flex items-start justify-between px-6 py-5 a-modal-header flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge status={w.spots_left === 0 ? "sold out" : "active"} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif", fontSize: "22px" }}>{w.style}</h2>
            {w.song && <p className="text-sm mt-0.5" style={{ color: "var(--gold)", opacity: 0.8 }}>♪ {w.song}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => exportCSV(guests, w.style)} className="a-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button onClick={() => { onClose(); openEdit(w); }} className="a-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm">
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={onClose} className="a-btn-ghost rounded-xl p-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 px-6 py-4 a-section-divider flex-shrink-0">
          {[{ icon: Calendar, text: w.date }, { icon: Clock, text: w.time }, { icon: MapPin, text: `${w.venue}, ${w.city}` }].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm" style={{ color: "var(--tm)" }}>
              <Icon className="h-4 w-4" style={{ color: "var(--gold)" }} />
              {text}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 a-stats-bar flex-shrink-0">
          {[{ label: "Attendees", value: guests.length }, { label: "Revenue", value: fmt$(rev) }, { label: "Spots Left", value: w.spots_left }].map(s => (
            <div key={s.label} className="px-6 py-4 text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>{s.value}</p>
              <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--tm)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Capacity */}
        <div className="px-6 py-4 a-section-divider flex-shrink-0">
          <CapBar left={w.spots_left} total={w.spots_total} />
        </div>

        {/* Guest list */}
        <div className="overflow-y-auto flex-1 p-4">
          {guests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Users className="h-12 w-12" style={{ color: "var(--tm)", opacity: 0.3 }} />
              <p className="text-sm" style={{ color: "var(--tm)" }}>No bookings yet for this workshop</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="a-thead">
                  {["#", "Name", "Email", "Amount", "Booked"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold" style={{ color: "var(--tm)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guests.map((b, i) => (
                  <tr key={b.id} className="a-tr">
                    <td className="px-3 py-3 text-xs" style={{ color: "var(--tm)" }}>{i + 1}</td>
                    <td className="px-3 py-3 text-sm font-medium" style={{ color: "var(--text)" }}>{b.attendee_name}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center text-sm" style={{ color: "var(--tm)" }}>{b.attendee_email}<CopyBtn text={b.attendee_email} /></span>
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold" style={{ color: "var(--gold)" }}>{fmt$(b.amount_paid)}</td>
                    <td className="px-3 py-3 text-xs" style={{ color: "var(--tm)" }}>{fmtDate(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>
    );
  };

  // ── WORKSHOP FORM ──────────────────────────────────────────────────────────
  const WorkshopForm = () => (
    <Modal onClose={closeForm}>
      <div className="flex items-center justify-between px-6 py-5 a-modal-header flex-shrink-0">
        <div>
          <h3 className="text-lg font-bold" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif", fontSize: "20px" }}>
            {editWorkshop ? "Edit Workshop" : "New Workshop"}
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--tm)" }}>Fill in the details below</p>
        </div>
        <button onClick={closeForm} className="a-btn-ghost rounded-xl p-2"><X className="h-4 w-4" /></button>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6" style={{ background: "var(--form-bg)" }}>
        {/* Details */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="a-section-dot" />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>Workshop Details</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
          <div className="space-y-3">
            <Field label="Workshop Name *" value={form.style} onChange={v => setForm(f => ({ ...f, style: v }))} placeholder="e.g. Nach Firiri Heels" />
            <Field label="Song / Theme" value={form.song} onChange={v => setForm(f => ({ ...f, song: v }))} placeholder="e.g. Nach Firiri" />
            <div className="flex gap-3">
              <Field half label="Venue *" value={form.venue} onChange={v => setForm(f => ({ ...f, venue: v }))} placeholder="e.g. Ripley-Grier Studios" />
              <Field half label="City *" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="e.g. New York" />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="a-section-dot" />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>Schedule</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Field half label="Date *" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} placeholder="July 18, 2026" />
              <Field half label="Time *" value={form.time} onChange={v => setForm(f => ({ ...f, time: v }))} placeholder="7:00–9:00 PM" />
            </div>
            <Field label="Duration" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} placeholder="2 Hours" />
          </div>
        </div>

        {/* Pricing */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="a-section-dot" />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>Pricing & Capacity</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Field half label="Price ($)" value={form.price} onChange={v => setForm(f => ({ ...f, price: Number(v) }))} type="number" />
              <Field half label="Total Spots" value={form.spots_total} onChange={v => setForm(f => ({ ...f, spots_total: Number(v) }))} type="number" />
            </div>
            <Field label="Stripe Price ID *" value={form.price_id} onChange={v => setForm(f => ({ ...f, price_id: v }))} placeholder="price_1..." mono />
          </div>
        </div>

        {saveMsg && <p className="text-sm text-center" style={{ color: saveMsg.startsWith("✅") ? "#22c55e" : "#f87171" }}>{saveMsg}</p>}
      </div>

      <div className="flex gap-3 px-6 py-4 a-modal-footer flex-shrink-0">
        <button onClick={closeForm} className="flex-1 a-btn-ghost rounded-xl py-3 text-sm font-medium">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: "var(--gold)", color: "#1A1410" }}>
          {saving ? "Saving…" : editWorkshop ? "Save Changes" : "Add Workshop"}
        </button>
      </div>
    </Modal>
  );

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ ...vars as React.CSSProperties, background: "var(--bg)", color: "var(--text)" }}>
      <style>{css}</style>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r" style={{ background: "var(--sidebar)", borderColor: "var(--border)" }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--ag)" }}>
              <Zap className="h-4 w-4" style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <p className="text-sm font-bold leading-none" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif", fontSize: "15px" }}>Nach Firiri</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--tm)" }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: "var(--tm)", letterSpacing: "0.12em" }}>Main</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left", tab === item.id ? "a-nav-active" : "a-nav-item")}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
              {tab === item.id && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: "var(--border)" }}>
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all a-nav-item">
            <Home className="h-4 w-4 flex-shrink-0" />
            Back to Site
          </Link>
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all a-nav-item">
            {theme === "dark" ? <Sun className="h-4 w-4 flex-shrink-0" /> : <Moon className="h-4 w-4 flex-shrink-0" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button onClick={() => setAuthed(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all a-logout">
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Log Out
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif", fontSize: "22px" }}>
              {navItems.find(n => n.id === tab)?.label}
            </h1>
            {lastRefresh && <p className="text-xs mt-0.5" style={{ color: "var(--tm)" }}>Updated {fmtTime(lastRefresh.toISOString())}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchData(true)} className={cn("a-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm", refreshing && "opacity-50")}>
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              <span className="hidden sm:block">Refresh</span>
            </button>
            <button onClick={() => { setForm(EMPTY_FORM); setShowAddForm(true); }}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={{ background: "var(--gold)", color: "#1A1410" }}>
              <Plus className="h-3.5 w-3.5" /> Add Workshop
            </button>
          </div>
        </header>

        {/* Mobile tabs */}
        <div className="lg:hidden flex border-b overflow-x-auto" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={cn("flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all", tab === item.id ? "a-mob-active" : "a-mob-inactive")}>
              <item.icon className="h-3.5 w-3.5" />{item.label}
            </button>
          ))}
        </div>

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ───────────────────────────────────────────────── */}
            {tab === "overview" && (
              <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard label="Total Bookings" value={bookings.length} sub="All time" icon={Users} />
                  <StatCard label="Total Revenue" value={`$${(totalRevenue / 100).toFixed(0)}`} sub={fmt$(totalRevenue)} icon={DollarSign} />
                  <StatCard label="Workshops" value={workshops.length} sub={`${soldOutCount} sold out`} icon={Calendar} />
                  <StatCard label="Unique Attendees" value={uniqueAttendees} sub="Distinct emails" icon={Mail} />
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  <div className="a-card rounded-2xl p-5">
                    <p className="text-base font-bold mb-0.5" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif", fontSize: "17px" }}>Revenue</p>
                    <p className="text-sm mb-5" style={{ color: "var(--tm)" }}>By month</p>
                    {revenueByMonth.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={revenueByMonth}>
                          <defs>
                            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                          <XAxis dataKey="month" tick={{ fill: "var(--chart-tick)", fontSize: 12, fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 12, fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--text)" }} itemStyle={{ color: "#C9A96E" }} formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                          <Area type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={2} fill="url(#g1)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : <div className="h-[180px] flex items-center justify-center text-sm" style={{ color: "var(--tm)" }}>No data yet</div>}
                  </div>
                  <div className="a-card rounded-2xl p-5">
                    <p className="text-base font-bold mb-0.5" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif", fontSize: "17px" }}>Bookings per Workshop</p>
                    <p className="text-sm mb-5" style={{ color: "var(--tm)" }}>All time</p>
                    {bookingsPerWS.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={bookingsPerWS} barSize={22}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: "var(--chart-tick)", fontSize: 11, fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 12, fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--text)" }} itemStyle={{ color: "#C9A96E" }} />
                          <Bar dataKey="bookings" radius={[5, 5, 0, 0]}>
                            {bookingsPerWS.map((_, i) => <Cell key={i} fill={i === 0 ? "#C9A96E" : "rgba(201,169,110,0.3)"} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <div className="h-[180px] flex items-center justify-center text-sm" style={{ color: "var(--tm)" }}>No data yet</div>}
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  <div className="a-card rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 a-table-head">
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Recent Bookings</p>
                      <button onClick={() => setTab("bookings")} className="flex items-center gap-1 text-xs font-medium transition-all" style={{ color: "var(--gold)" }}>
                        View all <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {bookings.slice(0, 6).length === 0
                      ? <p className="px-5 py-10 text-center text-sm" style={{ color: "var(--tm)" }}>No bookings yet</p>
                      : bookings.slice(0, 6).map(b => (
                        <div key={b.id} className="flex items-center justify-between px-5 py-3 a-row">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{b.attendee_name}</p>
                            <p className="text-xs truncate" style={{ color: "var(--tm)" }}>{b.workshop_name}</p>
                          </div>
                          <div className="ml-4 text-right flex-shrink-0">
                            <p className="text-sm font-semibold" style={{ color: "var(--gold)" }}>{fmt$(b.amount_paid)}</p>
                            <p className="text-xs" style={{ color: "var(--tm)" }}>{fmtDate(b.created_at)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="a-card rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 a-table-head">
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Workshops</p>
                      <button onClick={() => setTab("workshops")} className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--gold)" }}>
                        Manage <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {workshops.slice(0, 6).length === 0
                      ? <p className="px-5 py-10 text-center text-sm" style={{ color: "var(--tm)" }}>No workshops yet</p>
                      : workshops.slice(0, 6).map(w => {
                        const bk = bookings.filter(b => b.workshop_id === w.id).length;
                        const pct = w.spots_total > 0 ? Math.round(((w.spots_total - w.spots_left) / w.spots_total) * 100) : 0;
                        return (
                          <div key={w.id} className="px-5 py-3 a-row cursor-pointer" onClick={() => setSelectedWorkshop(w)}>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{w.style}</p>
                              <span className="text-xs font-semibold ml-3 flex-shrink-0" style={{ color: "var(--gold)" }}>{bk}/{w.spots_total}</span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--track)" }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: w.spots_left === 0 ? "#f87171" : "#C9A96E" }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── WORKSHOPS ──────────────────────────────────────────────── */}
            {tab === "workshops" && (
              <motion.div key="ws" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm" style={{ color: "var(--tm)" }}>{workshops.length} workshops · {soldOutCount} sold out</p>
                  <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                    <button onClick={() => setWorkshopView("list")}
                      className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all", workshopView === "list" ? "a-view-on" : "a-view-off")}>
                      <List className="h-3.5 w-3.5" /> List
                    </button>
                    <button onClick={() => setWorkshopView("grid")}
                      className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all", workshopView === "grid" ? "a-view-on" : "a-view-off")}>
                      <Grid className="h-3.5 w-3.5" /> Grid
                    </button>
                  </div>
                </div>

                {/* LIST VIEW — default */}
                {workshopView === "list" && (
                  <div className="a-card rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="a-table-head">
                          <th className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: "var(--tm)" }}>Workshop</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold hidden sm:table-cell" style={{ color: "var(--tm)" }}>Date & Time</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold hidden md:table-cell" style={{ color: "var(--tm)" }}>Venue</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: "var(--tm)" }}>Capacity</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold hidden lg:table-cell" style={{ color: "var(--tm)" }}>Revenue</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: "var(--tm)" }}>Status</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold" style={{ color: "var(--tm)" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workshops.map(w => {
                          const wBk = bookings.filter(b => b.workshop_id === w.id);
                          const rev = wBk.reduce((s, b) => s + b.amount_paid, 0);
                          const pct = w.spots_total > 0 ? Math.round(((w.spots_total - w.spots_left) / w.spots_total) * 100) : 0;
                          return (
                            <tr key={w.id} className="a-tr cursor-pointer" onClick={() => setSelectedWorkshop(w)}>
                              <td className="px-5 py-4">
                                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{w.style}</p>
                                {w.song && <p className="text-xs mt-0.5" style={{ color: "var(--gold)", opacity: 0.7 }}>♪ {w.song}</p>}
                              </td>
                              <td className="px-5 py-4 hidden sm:table-cell">
                                <p className="text-sm" style={{ color: "var(--text)" }}>{w.date}</p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--tm)" }}>{w.time}</p>
                              </td>
                              <td className="px-5 py-4 hidden md:table-cell">
                                <p className="text-sm" style={{ color: "var(--text)" }}>{w.venue}</p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--tm)" }}>{w.city}</p>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-16 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: "var(--track)" }}>
                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: w.spots_left === 0 ? "#f87171" : "#C9A96E" }} />
                                  </div>
                                  <span className="text-xs font-medium" style={{ color: "var(--tm)" }}>{w.spots_total - w.spots_left}/{w.spots_total}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 hidden lg:table-cell">
                                <p className="text-sm font-semibold" style={{ color: "var(--gold)" }}>{fmt$(rev)}</p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--tm)" }}>{wBk.length} booked</p>
                              </td>
                              <td className="px-5 py-4">
                                <Badge status={w.spots_left === 0 ? "sold out" : "active"} />
                              </td>
                              <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                                <button onClick={() => openEdit(w)}
                                  className="a-btn-ghost rounded-lg p-2 inline-flex items-center gap-1 text-xs">
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {workshops.length === 0 && (
                          <tr><td colSpan={7} className="px-5 py-16 text-center text-sm" style={{ color: "var(--tm)" }}>No workshops yet — add one above</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* GRID VIEW */}
                {workshopView === "grid" && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {workshops.map(w => {
                      const wBk = bookings.filter(b => b.workshop_id === w.id);
                      const rev = wBk.reduce((s, b) => s + b.amount_paid, 0);
                      return (
                        <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="a-card rounded-2xl p-5 flex flex-col cursor-pointer" onClick={() => setSelectedWorkshop(w)}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-base font-bold leading-tight" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif", fontSize: "17px" }}>{w.style}</p>
                              {w.song && <p className="text-xs mt-0.5" style={{ color: "var(--gold)", opacity: 0.75 }}>♪ {w.song}</p>}
                            </div>
                            <Badge status={w.spots_left === 0 ? "sold out" : "active"} />
                          </div>
                          <div className="space-y-1.5 mb-4">
                            {[{ icon: Calendar, text: w.date }, { icon: Clock, text: w.time }, { icon: MapPin, text: `${w.venue}, ${w.city}` }].map(({ icon: Icon, text }) => (
                              <div key={text} className="flex items-center gap-2 text-xs" style={{ color: "var(--tm)" }}>
                                <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--gold)", opacity: 0.6 }} />
                                <span className="truncate">{text}</span>
                              </div>
                            ))}
                          </div>
                          <CapBar left={w.spots_left} total={w.spots_total} />
                          <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                            <span className="text-xs" style={{ color: "var(--tm)" }}>{wBk.length} bookings</span>
                            <span className="text-sm font-semibold" style={{ color: "var(--gold)" }}>{fmt$(rev)}</span>
                          </div>
                          <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setSelectedWorkshop(w)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-all a-btn-outline">
                              <Eye className="h-3.5 w-3.5" /> View Guests
                            </button>
                            <button onClick={() => openEdit(w)} className="a-btn-ghost rounded-xl px-3 py-2">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                    <button onClick={() => { setForm(EMPTY_FORM); setShowAddForm(true); }}
                      className="a-add-card rounded-2xl p-5 flex flex-col items-center justify-center gap-3 min-h-[200px]">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--ag)" }}>
                        <Plus className="h-5 w-5" style={{ color: "var(--gold)" }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: "var(--tm)" }}>Add Workshop</p>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── BOOKINGS ───────────────────────────────────────────────── */}
            {tab === "bookings" && (
              <motion.div key="bk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--tm)" }} />
                    <input type="text" placeholder="Search name, email, workshop…" value={search} onChange={e => setSearch(e.target.value)}
                      className="a-input w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none" />
                  </div>
                  <select value={wFilter} onChange={e => setWFilter(e.target.value)} className="a-input rounded-xl px-3 py-2.5 text-sm outline-none">
                    <option value="all">All Workshops</option>
                    {workshops.map(w => <option key={w.id} value={w.id}>{w.style}</option>)}
                  </select>
                  <select value={sFilter} onChange={e => setSFilter(e.target.value)} className="a-input rounded-xl px-3 py-2.5 text-sm outline-none">
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button onClick={() => exportCSV(filteredBookings)} className="a-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm">
                    <Download className="h-4 w-4" /> Export
                  </button>
                </div>
                <p className="text-sm" style={{ color: "var(--tm)" }}>{filteredBookings.length} of {bookings.length} bookings</p>
                <div className="a-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="a-table-head">
                          {[["Name","attendee_name"],["Email","attendee_email"],["Workshop","workshop_name"],["Date","workshop_date"],["Amount","amount_paid"],["Status","status"],["Booked","created_at"]].map(([label, col]) => (
                            <th key={col} onClick={() => toggleSort(col)}
                              className="px-5 py-3.5 text-left text-xs font-semibold cursor-pointer hover:opacity-80 select-none transition-opacity"
                              style={{ color: "var(--tm)" }}>
                              <span className="flex items-center gap-1">
                                {label}
                                {sort.col === col && (sort.dir === "asc" ? <ChevronUp className="h-3 w-3" style={{ color: "var(--gold)" }} /> : <ChevronDown className="h-3 w-3" style={{ color: "var(--gold)" }} />)}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((b, i) => (
                          <tr key={b.id} className={cn("a-tr", i === filteredBookings.length - 1 && "!border-0")}>
                            <td className="px-5 py-4 text-sm font-medium" style={{ color: "var(--text)" }}>{b.attendee_name}</td>
                            <td className="px-5 py-4">
                              <span className="flex items-center text-sm" style={{ color: "var(--tm)" }}>{b.attendee_email}<CopyBtn text={b.attendee_email} /></span>
                            </td>
                            <td className="px-5 py-4 text-sm max-w-[150px] truncate" style={{ color: "var(--tm)" }}>{b.workshop_name}</td>
                            <td className="px-5 py-4 text-sm" style={{ color: "var(--tm)" }}>{b.workshop_date}</td>
                            <td className="px-5 py-4 text-sm font-semibold" style={{ color: "var(--gold)" }}>{fmt$(b.amount_paid)}</td>
                            <td className="px-5 py-4"><Badge status={b.status} /></td>
                            <td className="px-5 py-4 text-xs" style={{ color: "var(--tm)" }}>{fmtDate(b.created_at)}</td>
                          </tr>
                        ))}
                        {filteredBookings.length === 0 && (
                          <tr><td colSpan={7} className="px-5 py-16 text-center text-sm" style={{ color: "var(--tm)" }}>No bookings match your filters</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ANALYTICS ──────────────────────────────────────────────── */}
            {tab === "analytics" && (
              <motion.div key="an" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { label: "Avg Revenue / Workshop", value: workshops.length > 0 ? `$${(totalRevenue / 100 / workshops.length).toFixed(0)}` : "—" },
                    { label: "Avg Fill Rate", value: workshops.length > 0 ? `${Math.round(workshops.reduce((s, w) => s + ((w.spots_total - w.spots_left) / w.spots_total), 0) / workshops.length * 100)}%` : "—" },
                    { label: "Avg Ticket Price", value: bookings.length > 0 ? `$${(totalRevenue / 100 / bookings.length).toFixed(2)}` : "—" },
                    { label: "Sold Out", value: soldOutCount },
                  ].map(s => (
                    <div key={s.label} className="a-card rounded-2xl p-5">
                      <p className="text-sm font-medium mb-3" style={{ color: "var(--tm)" }}>{s.label}</p>
                      <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  <div className="a-card rounded-2xl p-5">
                    <p className="text-base font-bold mb-0.5" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif", fontSize: "17px" }}>Revenue Over Time</p>
                    <p className="text-sm mb-5" style={{ color: "var(--tm)" }}>Monthly booking revenue</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={revenueByMonth}>
                        <defs>
                          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                        <XAxis dataKey="month" tick={{ fill: "var(--chart-tick)", fontSize: 12, fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 12, fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--text)" }} itemStyle={{ color: "#C9A96E" }} formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                        <Area type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={2} fill="url(#g2)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="a-card rounded-2xl p-5">
                    <p className="text-base font-bold mb-0.5" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif", fontSize: "17px" }}>Workshop Performance</p>
                    <p className="text-sm mb-5" style={{ color: "var(--tm)" }}>Bookings per workshop</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={bookingsPerWS} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "var(--chart-tick)", fontSize: 11, fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 12, fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--text)" }} itemStyle={{ color: "#C9A96E" }} />
                        <Bar dataKey="bookings" radius={[5, 5, 0, 0]}>
                          {bookingsPerWS.map((_, i) => <Cell key={i} fill={i === 0 ? "#C9A96E" : "rgba(201,169,110,0.3)"} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="a-card rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 a-table-head">
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Workshop Breakdown</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="a-table-head">
                          {["Workshop","Date","Bookings","Fill Rate","Revenue","Status"].map(h => (
                            <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: "var(--tm)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {workshops.map(w => {
                          const wB = bookings.filter(b => b.workshop_id === w.id);
                          const rev = wB.reduce((s, b) => s + b.amount_paid, 0);
                          const fill = w.spots_total > 0 ? Math.round(((w.spots_total - w.spots_left) / w.spots_total) * 100) : 0;
                          return (
                            <tr key={w.id} className="a-tr">
                              <td className="px-5 py-4 text-sm font-medium" style={{ color: "var(--text)" }}>{w.style}</td>
                              <td className="px-5 py-4 text-sm" style={{ color: "var(--tm)" }}>{w.date}</td>
                              <td className="px-5 py-4 text-sm font-semibold" style={{ color: "var(--text)" }}>{wB.length}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--track)" }}>
                                    <div className="h-full rounded-full" style={{ width: `${fill}%`, background: fill === 100 ? "#f87171" : "#C9A96E" }} />
                                  </div>
                                  <span className="text-xs" style={{ color: "var(--tm)" }}>{fill}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm font-semibold" style={{ color: "var(--gold)" }}>{fmt$(rev)}</td>
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
        </main>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!!selectedWorkshop && <WorkshopPanel w={selectedWorkshop} onClose={() => setSelectedWorkshop(null)} />}
        {(showAddForm || !!editWorkshop) && <WorkshopForm />}
      </AnimatePresence>

    </div>
  );
}

// ── Scoped CSS ─────────────────────────────────────────────────────────────
const css = `
  .a-card { background: var(--surface); border: 1px solid var(--border); }
  .a-modal { background: var(--surface); border: 1px solid var(--border); }
  .a-modal-header { background: var(--surface); border-bottom: 1px solid var(--border); }
  .a-modal-footer { background: var(--surface); border-top: 1px solid var(--border); }
  .a-section-divider { border-top: 1px solid var(--border); }
  .a-stats-bar { background: var(--surface2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); gap: 1px; }
  .a-stats-bar > div { background: var(--surface); }
  .a-table-head { background: var(--surface2); border-bottom: 1px solid var(--border); }
  .a-thead tr { border-bottom: 1px solid var(--border); }
  .a-tr { border-bottom: 1px solid var(--border); transition: background 0.1s; }
  .a-tr:hover { background: var(--hover); }
  .a-row { border-bottom: 1px solid var(--border); transition: background 0.1s; }
  .a-row:hover { background: var(--hover); }
  .a-input { background: var(--input-bg); border: 1px solid var(--border); color: var(--text); }
  .a-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--ag); outline: none; }
  .a-input::placeholder { color: var(--tm); }
  .a-btn-ghost { color: var(--tm); border: 1px solid var(--border); transition: all 0.15s; background: transparent; }
  .a-btn-ghost:hover { color: var(--text); border-color: var(--text); background: var(--hover); }
  .a-btn-outline { color: var(--gold); border: 1px solid var(--border); transition: all 0.15s; }
  .a-btn-outline:hover { background: var(--ag); border-color: var(--gold); }
  .a-nav-item { color: var(--tm); transition: all 0.12s; }
  .a-nav-item:hover { color: var(--text); background: var(--hover); }
  .a-nav-active { color: var(--gold); background: var(--ag); }
  .a-logout { color: var(--tm); transition: all 0.12s; }
  .a-logout:hover { color: #f87171; background: rgba(248,113,113,0.08); }
  .a-mob-active { color: var(--gold); border-color: var(--gold); }
  .a-mob-inactive { color: var(--tm); border-color: transparent; }
  .a-view-on { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
  .a-view-off { color: var(--tm); }
  .a-add-card { border: 1.5px dashed var(--border); background: transparent; cursor: pointer; transition: all 0.2s; }
  .a-add-card:hover { border-color: var(--gold); background: var(--ag); }
  .a-section-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }
`;
