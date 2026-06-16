import { Calendar, Clock, MapPin, Download, Edit2, X, Users } from "lucide-react";
import { Modal } from "@/routes/admin";
import { Badge } from "@/routes/admin";
import { CapBar } from "@/routes/admin";
import { CopyBtn } from "@/routes/admin";


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

const fmt$ = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function WorkshopPanel({ w, bookings, onClose, onEdit, onExport }: {
  w: Workshop;
  bookings: Booking[];
  onClose: () => void;
  onEdit: (w: Workshop) => void;
  onExport: (rows: Booking[], name: string) => void;
}) {
  const guests = bookings.filter(b => b.workshop_id === w.id);
  const rev = guests.reduce((s, b) => s + b.amount_paid, 0);

  return (
    <Modal onClose={onClose} wide>
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 a-modal-header flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge status={w.spots_left === 0 ? "sold out" : "active"} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text)", fontFamily: "Cormorant Garamond, serif", fontSize: "22px" }}>
            {w.style}
          </h2>
          {w.song && <p className="text-sm mt-0.5" style={{ color: "var(--gold)", opacity: 0.8 }}>♪ {w.song}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onExport(guests, w.style)} className="a-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={() => { onClose(); onEdit(w); }} className="a-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm">
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
        {[
          { label: "Attendees", value: guests.length },
          { label: "Revenue", value: fmt$(rev) },
          { label: "Spots Left", value: w.spots_left },
        ].map(s => (
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
                    <span className="flex items-center text-sm" style={{ color: "var(--tm)" }}>
                      {b.attendee_email}<CopyBtn text={b.attendee_email} />
                    </span>
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
}
