import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "./Modal";

const EMPTY_FORM = {
  id: "", style: "", song: "", date: "", time: "", venue: "", city: "",
  duration: "2 Hours", price: 20, spots_total: 20,
  price_id: "price_1ThcrxQ4li0j4IaZq7eoDSWY",
};

type Workshop = {
  id: string; style: string; song: string; date: string; time: string;
  venue: string; city: string; duration: string; price: number;
  spots_left: number; spots_total: number; price_id: string; active?: boolean;
};

// ── Field ──────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text", mono = false, half = false }: {
  label: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; mono?: boolean; half?: boolean;
}) {
  return (
    <div className={half ? "flex-1" : "w-full"}>
      <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--gold)", letterSpacing: "0.1em" }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn("a-input w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all", mono && "font-mono text-xs")}
        style={{ fontSize: "14px" }}
      />
    </div>
  );
}

// ── WorkshopForm ───────────────────────────────────────────────────────────
export function WorkshopForm({ form, setForm, saving, saveMsg, editWorkshop, onClose, onSave }: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  saving: boolean;
  saveMsg: string;
  editWorkshop: Workshop | null;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-6 a-modal-header flex-shrink-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--gold)", letterSpacing: "0.12em" }}>
            {editWorkshop ? "Edit Workshop" : "New Workshop"}
          </p>
          <h3 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif", fontSize: "26px", lineHeight: 1.2 }}>
            {editWorkshop ? editWorkshop.style : "Create a Workshop"}
          </h3>
        </div>
        <button onClick={onClose} className="a-btn-ghost rounded-xl p-2.5">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-7 py-6 space-y-8" style={{ background: "var(--form-bg)" }}>

        {/* Workshop Details */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="a-section-dot" />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold)", letterSpacing: "0.12em" }}>Workshop Details</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
          <div className="space-y-4">
            <Field label="Workshop Name *" value={form.style} onChange={v => setForm(f => ({ ...f, style: v }))} placeholder="e.g. Nach Firiri Heels" />
            <Field label="Song / Theme" value={form.song} onChange={v => setForm(f => ({ ...f, song: v }))} placeholder="e.g. Nach Firiri" />
            <div className="flex gap-4">
              <Field half label="Venue *" value={form.venue} onChange={v => setForm(f => ({ ...f, venue: v }))} placeholder="e.g. Ripley-Grier Studios" />
              <Field half label="City *" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="e.g. New York" />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="a-section-dot" />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold)", letterSpacing: "0.12em" }}>Schedule</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Field half label="Date *" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} placeholder="July 18, 2026" />
              <Field half label="Time *" value={form.time} onChange={v => setForm(f => ({ ...f, time: v }))} placeholder="7:00–9:00 PM" />
            </div>
            <Field label="Duration" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} placeholder="2 Hours" />
          </div>
        </div>

        {/* Pricing & Capacity */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="a-section-dot" />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold)", letterSpacing: "0.12em" }}>Pricing & Capacity</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Field half label="Price ($)" value={form.price} onChange={v => setForm(f => ({ ...f, price: Number(v) }))} type="number" />
              <Field half label="Total Spots" value={form.spots_total} onChange={v => setForm(f => ({ ...f, spots_total: Number(v) }))} type="number" />
            </div>
            <div>
              <Field label="Stripe Price ID *" value={form.price_id} onChange={v => setForm(f => ({ ...f, price_id: v }))} placeholder="price_1..." mono />
              <p className="text-xs mt-2" style={{ color: "var(--tm)" }}>Find this in your Stripe Dashboard → Products → Prices</p>
            </div>
          </div>
        </div>

        {saveMsg && (
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-3.5"
            style={{
              background: saveMsg.startsWith("✅") ? "rgba(34,197,94,0.08)" : "rgba(248,113,113,0.08)",
              border: `1px solid ${saveMsg.startsWith("✅") ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.2)"}`,
            }}
          >
            <span style={{ color: saveMsg.startsWith("✅") ? "#22c55e" : "#f87171", fontSize: "13px" }}>{saveMsg}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-7 py-5 a-modal-footer flex-shrink-0">
        <button onClick={onClose} className="flex-1 a-btn-ghost rounded-xl py-3.5 text-sm font-semibold">
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 rounded-xl py-3.5 text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: "var(--gold)", color: "#1A1410" }}
        >
          {saving ? "Saving…" : editWorkshop ? "Save Changes" : "Add Workshop"}
        </button>
      </div>
    </Modal>
  );
}
