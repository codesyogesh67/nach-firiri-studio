import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLang } from "@/lib/language";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: t("home") },
    { to: "/workshops", label: t("workshops") },
    { to: "/learn", label: t("learn") },
    { to: "/book", label: t("book") },
    { to: "/shop", label: t("shop") },
  ] as const;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-[var(--border)] bg-[var(--ink)]/90 backdrop-blur-md py-3"
          : "border-b border-transparent bg-transparent py-5",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5">
        <Link to="/" className="group flex flex-col leading-none">
          <span className="font-display text-2xl font-semibold tracking-wide text-[var(--ivory)] transition-colors group-hover:text-[var(--gold)]">
            Nach Firiri
          </span>
          <span className="font-deva text-xs text-[var(--gold-muted)]">नाच फिरिरी</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="font-body text-sm tracking-wide text-[var(--ivory)]/85 transition-colors hover:text-[var(--gold)]"
              activeProps={{ className: "text-[var(--gold)]" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setLang("en")}
              className={cn("px-1 transition-colors", lang === "en" ? "text-[var(--gold)]" : "text-[var(--ivory)]/50 hover:text-[var(--ivory)]")}
            >
              EN
            </button>
            <span className="text-[var(--ivory)]/30">|</span>
            <button
              onClick={() => setLang("ne")}
              className={cn("font-deva px-1 transition-colors", lang === "ne" ? "text-[var(--gold)]" : "text-[var(--ivory)]/50 hover:text-[var(--ivory)]")}
            >
              नेपाली
            </button>
          </div>
        </div>

        <button
          className="text-[var(--gold)] md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-7 w-7" />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-[var(--ink)]/98 backdrop-blur-xl md:hidden"
          >
            <div className="flex items-center justify-between px-5 py-5">
              <span className="font-display text-2xl text-[var(--gold)]">Nach Firiri</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-[var(--gold)]">
                <X className="h-7 w-7" />
              </button>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }}
                >
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="font-display text-4xl text-[var(--ivory)] transition-colors hover:text-[var(--gold)]"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-6 flex items-center gap-3 font-mono text-sm">
                <button onClick={() => setLang("en")} className={lang === "en" ? "text-[var(--gold)]" : "text-[var(--ivory)]/50"}>EN</button>
                <span className="text-[var(--ivory)]/30">|</span>
                <button onClick={() => setLang("ne")} className={cn("font-deva", lang === "ne" ? "text-[var(--gold)]" : "text-[var(--ivory)]/50")}>नेपाली</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
