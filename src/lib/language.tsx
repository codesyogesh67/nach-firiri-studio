import { createContext, useContext, type ReactNode } from "react";

const dict = {
  home: "Home",
  workshops: "Workshops",
  learn: "Learn",
  book: "Book Me",
  shop: "Shop",
  heroLabel: "NEPALI · SOUTH ASIAN · DANCE",
  heroTitle: "Feel Every Beat",
  heroSub: "Workshops · Tutorials · Private Bookings · South Asian Fashion",
  ctaWorkshops: "Upcoming Workshops",
  ctaBook: "Book Swastika",
} as const;

type Key = keyof typeof dict;

interface Ctx {
  t: (k: Key) => string;
}

const LanguageContext = createContext<Ctx>({ t: (k) => dict[k] });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const t = (k: Key) => dict[k];
  return <LanguageContext.Provider value={{ t }}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
