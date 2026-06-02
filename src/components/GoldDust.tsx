import { useEffect, useState } from "react";

interface Dust {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

export function GoldDust({ count = 28 }: { count?: number }) {
  const [dust, setDust] = useState<Dust[]>([]);

  useEffect(() => {
    const items = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 14,
      duration: Math.random() * 12 + 10,
    }));
    setDust(items);
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      {dust.map((d) => (
        <span
          key={d.id}
          className="absolute bottom-0 rounded-full bg-[var(--gold)]"
          style={{
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            boxShadow: "0 0 6px var(--gold)",
            animation: `float-dust ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
