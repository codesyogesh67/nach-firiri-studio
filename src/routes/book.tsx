import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { OCCASIONS, TESTIMONIALS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book Me — Nach Firiri | Private Dance Bookings" },
      { name: "description", content: "Bring Nach Firiri to your wedding sangeet, corporate event, birthday, or private class with Swastika." },
      { property: "og:title", content: "Book Me — Nach Firiri" },
      { property: "og:description", content: "Weddings · Sangeet · Corporate · Private & Virtual sessions." },
    ],
  }),
  component: BookPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  occasion: z.string().min(1, "Select an occasion"),
  message: z.string().trim().max(1000).optional(),
});

function BookPage() {
  const [occasion, setOccasion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      occasion: fd.get("occasion"),
      message: fd.get("message"),
    });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setSubmitted(true);
    toast.success("Inquiry sent! 💛");
  };

  return (
    <>
      <PageHero label="Private Bookings" title="Bring Nach Firiri to Your Occasion" deva="नाच फिरिरी">
        <p className="mx-auto max-w-xl font-body text-sm text-[var(--ivory)]/75">
          Weddings · Sangeet · Corporate Events · Birthdays · Private Classes · Virtual Sessions
        </p>
      </PageHero>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OCCASIONS.map((o, i) => (
            <Reveal key={o.title} delay={i * 0.06}>
              <button
                onClick={() => { setOccasion(o.title); document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth" }); }}
                className={cn(
                  "h-full w-full rounded-xl border bg-[var(--card)] p-6 text-left transition-all hover:border-[var(--gold)]/50 hover:shadow-[var(--shadow-gold)]",
                  occasion === o.title ? "border-[var(--gold)]" : "border-[var(--border)]",
                )}
              >
                <span className="text-3xl">{o.icon}</span>
                <h3 className="mt-3 font-display text-xl font-semibold text-[var(--ivory)]">{o.title}</h3>
                <p className="mt-1 font-body text-sm text-[var(--ivory)]/65">{o.desc}</p>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="inquiry" className="relative z-10 mx-auto max-w-3xl scroll-mt-24 px-5 pb-16">
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-[var(--gold)]/40 bg-[var(--card)] p-12 text-center">
            <p className="text-5xl">💛</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-[var(--ivory)]">Thank you!</h2>
            <p className="mt-3 font-body text-[var(--ivory)]/75">Swastika will personally review your request and reach out within 48 hours.</p>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <div className="sm:col-span-2">
                <Label>Occasion Type</Label>
                <select name="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} className={inputCls}>
                  <option value="">Select an occasion</option>
                  {OCCASIONS.map((o) => <option key={o.title} value={o.title}>{o.title}</option>)}
                </select>
              </div>
              <Field label="Event Date" name="date" type="date" />
              <Field label="Location (City / Virtual)" name="location" />
              <Field label="Group Size" name="group" type="number" />
              <Field label="Song / Style Preference" name="style" />
              <div className="sm:col-span-2">
                <Label>Budget Range</Label>
                <select name="budget" className={inputCls}>
                  <option>Under $200</option><option>$200–500</option><option>$500–1000</option><option>$1000+</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Message</Label>
                <textarea name="message" rows={4} maxLength={1000} className={inputCls} placeholder="Tell us about your event..." />
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button type="submit" variant="gold" size="xl">Send Inquiry</Button>
            </div>
            <p className="mt-4 text-center font-mono text-xs text-[var(--ivory)]/50">
              Starting from $150 · Pricing varies by occasion, location and group size
            </p>
          </form>
        )}
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="h-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
                <p className="font-display text-lg italic text-[var(--ivory)]/90">"{t.quote}"</p>
                <p className="mt-4 font-body text-sm text-[var(--gold)]">{t.name}</p>
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--ivory)]/50">{t.occasion}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

const inputCls = "mt-1.5 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-4 py-3 font-body text-sm text-[var(--ivory)] outline-none placeholder:text-[var(--ivory)]/40 focus:border-[var(--gold)]";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="font-mono text-xs uppercase tracking-wider text-[var(--gold-muted)]">{children}</label>;
}
function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <input name={name} type={type} required={required} maxLength={255} className={inputCls} />
    </div>
  );
}
