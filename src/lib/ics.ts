import type { WORKSHOPS } from "@/lib/site-data";

type Workshop = (typeof WORKSHOPS)[number];

export function downloadIcs(w: Workshop) {
  const dt = new Date(`${w.date} ${w.time.split("–")[0].replace(/[^\d:apmAPM ]/g, "")}`);
  const start = isNaN(dt.getTime()) ? new Date() : dt;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nach Firiri//Workshop//EN",
    "BEGIN:VEVENT",
    `UID:${w.id}@nachfiriri`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Nach Firiri — ${w.style}`,
    `LOCATION:${w.venue}, ${w.city}`,
    `DESCRIPTION:${w.song} workshop with Swastika`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nach-firiri-${w.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
