import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/language";
import { SITE } from "@/lib/site-data";

export function HeroSection() {
  const { t } = useLang();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <iframe
          title="Background reel"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[120vh] w-[120vw] -translate-x-1/2 -translate-y-1/2 md:h-[140vh] md:w-[140vw]"
          src={`https://www.youtube.com/embed/${SITE.heroVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${SITE.heroVideoId}&playsinline=1&modestbranding=1&showinfo=0&rel=0`}
          allow="autoplay; encrypted-media"
        />
        <div className="absolute inset-0" style={{ background: "rgba(13,10,11,0.65)" }} />
        <div className="absolute inset-0 dhaka-texture opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-[var(--ink)]/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="label-mono"
        >
          {t("heroLabel")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="mt-4 font-display text-6xl font-semibold leading-[0.95] text-[var(--ivory)] sm:text-7xl md:text-8xl"
        >
          {t("heroTitle")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="font-deva mt-4 text-xl text-[var(--gold)] sm:text-2xl"
        >
          नाच, महसुस गर, एक बन
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mx-auto mt-6 max-w-xl font-body text-sm text-[var(--ivory)]/80 sm:text-base"
        >
          {t("heroSub")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button asChild variant="gold" size="xl">
            <Link to="/workshops">{t("ctaWorkshops")}</Link>
          </Button>
          <Button asChild variant="goldOutline" size="xl">
            <Link to="/book">{t("ctaBook")}</Link>
          </Button>
        </motion.div>
      </div>

      <Link
        to="/"
        hash="story"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[var(--gold)]"
        aria-label="Scroll down"
      >
        <ChevronDown className="animate-chevron h-8 w-8" />
      </Link>
    </section>
  );
}
