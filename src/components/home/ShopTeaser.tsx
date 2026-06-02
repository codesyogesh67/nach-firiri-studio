import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { EmailCapture } from "@/components/EmailCapture";
import { PRODUCTS } from "@/lib/site-data";

export function ShopTeaser() {
  return (
    <section className="relative z-10 border-t border-[var(--border)] bg-[var(--card)]/40 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <p className="label-mono text-center">The Shop</p>
          <h2 className="mt-3 text-center font-display text-4xl font-semibold text-[var(--gold)] sm:text-5xl">
            Wear the Dance
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <div className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-gold)]">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[var(--ivory)]">{p.name}</h3>
                    <p className="font-mono text-sm text-[var(--gold)]">${p.price}</p>
                  </div>
                  <Button asChild variant="goldOutline" size="sm">
                    <Link to="/shop">View</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="mb-5 font-body text-[var(--ivory)]/75">New drops dropping soon —</p>
          <EmailCapture cta="Notify Me" />
        </div>
      </div>
    </section>
  );
}
