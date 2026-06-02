import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ne";

const dict = {
  en: {
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
  },
  ne: {
    home: "गृह",
    workshops: "कार्यशाला",
    learn: "सिक्नुहोस्",
    book: "बुक गर्नुहोस्",
    shop: "पसल",
    heroLabel: "नेपाली · दक्षिण एसियाली · नृत्य",
    heroTitle: "हरेक ताल महसुस गर",
    heroSub: "कार्यशाला · ट्युटोरियल · निजी बुकिङ · दक्षिण एसियाली फेसन",
    ctaWorkshops: "आगामी कार्यशाला",
    ctaBook: "स्वस्तिका बुक गर्नुहोस्",
  },
} as const;

type Key = keyof (typeof dict)["en"];

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
}

const LanguageContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem("nf-lang")) as Lang | null;
    if (stored) setLang(stored);
  }, []);
  const update = (l: Lang) => {
    setLang(l);
    if (typeof localStorage !== "undefined") localStorage.setItem("nf-lang", l);
  };
  const t = (k: Key) => dict[lang][k];
  return (
    <LanguageContext.Provider value={{ lang, setLang: update, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
