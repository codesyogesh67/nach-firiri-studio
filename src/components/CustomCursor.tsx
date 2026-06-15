import { useEffect, useRef } from "react";

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.body.style.cursor = "none";

    let mx = 0, my = 0, rx = 0, ry = 0;
    let isHover = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      // instant sharp dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px)`;
      }
      // detect hoverable elements
      const el = document.elementFromPoint(mx, my);
      isHover = !!(el?.closest("a, button, [role='button'], input, select, textarea, label, [tabindex]"));
    };

    let raf = 0;
    const loop = () => {
      // trailing ring
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringRef.current) {
        const scale = isHover ? 1.6 : 1;
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px) scale(${scale})`;
        ringRef.current.style.opacity   = isHover ? "0.5" : "1";
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
      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
        style={{
          width: 28,
          height: 28,
          marginLeft: -14,
          marginTop: -14,
          border: "1.5px solid oklch(0.74 0.11 85 / 0.7)",
          borderRadius: "50%",
          transition: "transform 0.08s ease, opacity 0.15s ease",
        }}
      />
      {/* Sharp precision dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
        style={{
          width: 5,
          height: 5,
          marginLeft: -2.5,
          marginTop: -2.5,
          background: "oklch(0.81 0.14 88)",
          borderRadius: "50%",
          boxShadow: "0 0 6px 1px oklch(0.81 0.14 88 / 0.6)",
        }}
      />
    </>
  );
}
