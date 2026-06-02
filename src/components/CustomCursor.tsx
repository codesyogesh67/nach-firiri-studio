import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.body.style.cursor = "none";

    let tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };
    let raf = 0;
    const loop = () => {
      tx += (x - tx) * 0.18;
      ty += (y - ty) * 0.18;
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <>
      <div
        ref={trailRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
        style={{ marginLeft: -16, marginTop: -16, background: "radial-gradient(circle, oklch(0.74 0.11 85 / 0.35), transparent 70%)" }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-2 w-2 rounded-full bg-[var(--gold-bright)] md:block"
        style={{ marginLeft: -4, marginTop: -4, boxShadow: "0 0 10px var(--gold-bright)" }}
      />
    </>
  );
}
