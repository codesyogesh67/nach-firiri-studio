import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  Edit2,
  X,
  Users,
  Mail,
} from "lucide-react";
import { Modal } from "@/routes/admin";
import { Badge } from "@/routes/admin";
import { CapBar } from "@/routes/admin";
import { CopyBtn } from "@/routes/admin";

const SUPABASE_URL = "https://kcwshieovehgpdhahowq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjd3NoaWVvdmVoZ3BkaGFob3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODY2MDcsImV4cCI6MjA5Njg2MjYwN30.iia9Uuzzg5V7l4mG4pqbitshV7zdLjtw3JxCOJCYwD8";

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

const fmt$ = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const inputCls = {
  width: "100%",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.07)",
  backgroundColor: "#1E1C1A",
  color: "#F2EEE8",
  padding: "10px 14px",
  fontSize: "14px",
  outline: "none",
  fontFamily: "DM Sans, sans-serif",
};

export function WorkshopPanel({
  w,
  bookings,
  onClose,
  onEdit,
  onExport,
}: {
  w: Workshop;
  bookings: Booking[];
  onClose: () => void;
  onEdit: (w: Workshop) => void;
  onExport: (rows: Booking[], name: string) => void;
}) {
  const guests = bookings.filter((b) => b.workshop_id === w.id);
  const rev = guests.reduce((s, b) => s + b.amount_paid, 0);

  const [showMessage, setShowMessage] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          workshop_id: w.id,
          workshop_name: w.style,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSendResult(`✅ Sent to ${data.sent} of ${data.total} attendees`);
      setSubject("");
      setMessage("");
    } catch (e) {
      setSendResult(`❌ ${e.message ?? "Something went wrong"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal onClose={onClose} wide>
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 a-modal-header flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge status={w.spots_left === 0 ? "sold out" : "active"} />
          </div>
          <h2
            className="text-xl font-bold"
            style={{
              color: "var(--text)",
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "22px",
            }}
          >
            {w.style}
          </h2>
          {w.song && (
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--gold)", opacity: 0.8 }}
            >
              ♪ {w.song}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => {
              setShowMessage((v) => !v);
              setSendResult(null);
            }}
            className="a-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm"
          >
            <Mail className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Message All</span>
          </button>
          <button
            onClick={() => onExport(guests, w.style)}
            className="a-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(w);
            }}
            className="a-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button onClick={onClose} className="a-btn-ghost rounded-xl p-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Message panel */}
      {showMessage && (
        <div
          className="px-6 py-5 a-section-divider flex-shrink-0"
          style={{ background: "var(--surface2)" }}
        >
          <p
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--text)" }}
          >
            Message all {guests.length} attendee{guests.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Subject line…"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={inputCls}
            />
            <textarea
              placeholder="Write your message here…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              style={{ ...inputCls, resize: "vertical" }}
            />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleSendMessage}
              disabled={
                sending ||
                !subject.trim() ||
                !message.trim() ||
                guests.length === 0
              }
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: "var(--gold)", color: "#1A1410" }}
            >
              <Mail className="h-3.5 w-3.5" />
              {sending
                ? "Sending…"
                : `Send to ${guests.length} attendee${
                    guests.length !== 1 ? "s" : ""
                  }`}
            </button>
            {sendResult && (
              <p
                className="text-sm"
                style={{
                  color: sendResult.startsWith("✅") ? "#34d399" : "#f87171",
                }}
              >
                {sendResult}
              </p>
            )}
          </div>
          {guests.length === 0 && (
            <p className="text-xs mt-2" style={{ color: "var(--tm)" }}>
              No attendees to message yet.
            </p>
          )}
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap gap-4 px-6 py-4 a-section-divider flex-shrink-0">
        {[
          { icon: Calendar, text: w.date },
          { icon: Clock, text: w.time },
          { icon: MapPin, text: `${w.venue}, ${w.city}` },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--tm)" }}
          >
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
        ].map((s) => (
          <div key={s.label} className="px-6 py-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              {s.value}
            </p>
            <p
              className="text-xs mt-0.5 font-medium"
              style={{ color: "var(--tm)" }}
            >
              {s.label}
            </p>
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
            <Users
              className="h-12 w-12"
              style={{ color: "var(--tm)", opacity: 0.3 }}
            />
            <p className="text-sm" style={{ color: "var(--tm)" }}>
              No bookings yet for this workshop
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="a-thead">
                  {["#", "Name", "Email", "Amount", "Booked"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-xs font-semibold"
                      style={{ color: "var(--tm)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guests.map((b, i) => (
                  <tr key={b.id} className="a-tr">
                    <td
                      className="px-3 py-3 text-xs"
                      style={{ color: "var(--tm)" }}
                    >
                      {i + 1}
                    </td>
                    <td
                      className="px-3 py-3 text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      {b.attendee_name}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="flex items-center text-sm"
                        style={{ color: "var(--tm)" }}
                      >
                        <span className="hidden sm:inline">
                          {b.attendee_email}
                        </span>
                        <span className="sm:hidden">
                          {b.attendee_email.split("@")[0]}
                        </span>
                        <CopyBtn text={b.attendee_email} />
                      </span>
                    </td>
                    <td
                      className="px-3 py-3 text-sm font-semibold"
                      style={{ color: "var(--gold)" }}
                    >
                      {fmt$(b.amount_paid)}
                    </td>
                    <td
                      className="px-3 py-3 text-xs"
                      style={{ color: "var(--tm)" }}
                    >
                      {fmtDate(b.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
