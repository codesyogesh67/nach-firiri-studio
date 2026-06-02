import { IMAGES } from "@/lib/site-data";

export function VibeReel() {
  const imgs = [
    IMAGES.gallery1, IMAGES.gallery2, IMAGES.gallery3,
    IMAGES.gallery1, IMAGES.gallery2, IMAGES.gallery3,
  ];
  return (
    <section className="relative z-10 overflow-hidden py-10">
      <div className="flex w-max animate-ticker gap-4" style={{ animationDuration: "40s" }}>
        {[...imgs, ...imgs].map((src, i) => (
          <div key={i} className="h-72 w-56 shrink-0 overflow-hidden rounded-xl border border-[var(--gold)]/10">
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
