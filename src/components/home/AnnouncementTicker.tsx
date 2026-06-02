const ITEMS = [
  "🔥 NYC Workshop · June 18th · Ripley-Grier · 7–9PM · Only 12 spots · Book Now →",
  "✨ New Kurthi Drop Coming Soon · Join Waitlist →",
  "💃 Online Tutorials Now Live →",
];

export function AnnouncementTicker() {
  const line = ITEMS.join("\u00A0\u00A0\u00A0·\u00A0\u00A0\u00A0");
  return (
    <div className="relative z-10 overflow-hidden border-y border-[var(--gold)]/20 bg-[var(--maroon)] py-3">
      <div className="animate-ticker flex w-max whitespace-nowrap font-mono text-sm tracking-wide text-[var(--gold-bright)]">
        <span className="px-6">{line}</span>
        <span className="px-6">{line}</span>
      </div>
    </div>
  );
}
