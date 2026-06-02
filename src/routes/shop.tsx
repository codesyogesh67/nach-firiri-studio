import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { EmailCapture } from "@/components/EmailCapture";
import { PRODUCTS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Nach Firiri | Newari-Inspired Kurthis" },
      { name: "description", content: "Newari-inspired kurthis designed for movement. Wear the dance — shop the Maya collection." },
      { property: "og:title", content: "Shop — Nach Firiri" },
      { property: "og:description", content: "Newari-inspired kurthis designed for movement." },
    ],
  }),
  component: ShopPage,
});

const SIZES = ["XS", "S", "M", "L", "XL"];

function ShopPage() {
  const [sizes, setSizes] = useState<Record<string, string>>({});

  return (
    <>
      <PageHero label="The Maya Collection" title="Wear the Dance" deva="नाच फिरिरी">
        <p className="mx-auto max-w-xl font-body text-sm text-[var(--ivory)]/75">
          Newari-inspired kurthis designed for movement
        </p>
      </PageHero>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <div className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-gold)]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--ink)]/80 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--gold)] backdrop-blur">
                    As seen in her workshops & TikToks
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold text-[var(--ivory)]">{p.name}</h3>
                    <span className="font-mono text-[var(--gold)]">${p.price}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSizes((prev) => ({ ...prev, [p.id]: s }))}
                        className={cn(
                          "h-9 w-9 rounded-md border font-mono text-xs transition-all",
                          sizes[p.id] === s
                            ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                            : "border-[var(--border)] text-[var(--ivory)]/60 hover:border-[var(--gold)]/40",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 flex gap-3">
                    <Button
                      variant="gold"
                      className="flex-1"
                      onClick={() => toast.success(`${p.name}${sizes[p.id] ? ` (${sizes[p.id]})` : ""} added to cart 🛍️`)}
                    >
                      Add to Cart
                    </Button>
                    <Button asChild variant="goldOutline">
                      <a href={p.link} target="_blank" rel="noreferrer">View</a>
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="font-display text-2xl font-semibold text-[var(--gold)]">New drops dropping soon</h2>
          <p className="mb-6 mt-2 font-body text-sm text-[var(--ivory)]/70">Join the waitlist to hear first.</p>
          <EmailCapture cta="Join Waitlist" />
          <p className="mt-10 font-mono text-xs text-[var(--ivory)]/40">More styles coming soon as the collection grows 🌿</p>
        </div>
      </section>
    </>
  );
}
