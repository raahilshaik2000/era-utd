"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// Dot + trailing ring. Anything with [data-cursor] grows the ring; data-cursor="Label" shows text.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine)").matches);
  }, []);

  // Runs once the dot and ring are actually mounted.
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");
    gsap.set([dot.current, ring.current], { opacity: 0 });
    let shown = false;

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3" });

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
        gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, textarea, label");
      const text = el?.dataset.cursor ?? "";
      setLabel(text && text !== "hover" ? text : "");
      gsap.to(ring.current, {
        scale: el ? (text && text !== "hover" ? 2.6 : 1.8) : 1,
        backgroundColor: el ? "rgba(68,211,197,0.12)" : "rgba(68,211,197,0)",
        duration: 0.4,
        ease: "power3.out",
      });
      gsap.to(dot.current, { scale: el ? 0 : 1, duration: 0.3 });
    };
    const leave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 });
    const enter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 });

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] -mt-5 -ml-5 flex h-10 w-10 items-center justify-center rounded-full border border-glow/60"
      >
        <span className="font-mono text-[5px] font-semibold tracking-[0.2em] text-glow uppercase">{label}</span>
      </div>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] -mt-1 -ml-1 h-2 w-2 rounded-full bg-glow"
      />
    </>
  );
}
