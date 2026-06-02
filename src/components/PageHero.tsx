import { motion } from "motion/react";
import type { ReactNode } from "react";

export function PageHero({
  label,
  title,
  deva,
  children,
}: {
  label: string;
  title: ReactNode;
  deva?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-12 pt-36">
      <div className="absolute inset-0 dhaka-texture opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--maroon)]/20 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-5 text-center">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="label-mono">
          {label}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-3 font-display text-5xl font-semibold leading-tight text-[var(--ivory)] sm:text-6xl"
        >
          {title}
        </motion.h1>
        {deva && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="font-deva mt-3 text-xl text-[var(--gold)]">
            {deva}
          </motion.p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
