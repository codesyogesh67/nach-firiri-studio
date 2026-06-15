import { useEffect } from "react";

export function CustomCursor() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='22' viewBox='0 0 16 22'>
      <path d='M0 0 L0 18 L4.5 13.5 L7.5 21 L9.5 20 L6.5 13 L12 13 Z' fill='%23C9A96E' stroke='%231A1410' stroke-width='1'/>
    </svg>`;

    document.body.style.cursor = `url("data:image/svg+xml,${svg}") 0 0, auto`;

    return () => { document.body.style.cursor = ""; };
  }, []);

  return null;
}
