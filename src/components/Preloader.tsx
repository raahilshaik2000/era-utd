"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { markLoaded, prefersReducedMotion } from "@/lib/loaded";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("era-loaded") === "1";
    } catch {}
    if (seen || prefersReducedMotion()) {
      setDone(true);
      markLoaded();
      return;
    }
    window.__lenis?.stop();
    const counter = { v: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem("era-loaded", "1");
          } catch {}
          window.__lenis?.start();
          setDone(true);
        },
      });
      tl.from(".pl-letter", { yPercent: 110, stagger: 0.08, duration: 1, ease: "expo.out" })
        .to(counter, {
          v: 100,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: () => {
            if (count.current) count.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        }, 0.1)
        .to(bar.current, { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0.1)
        .to(".pl-letter", { yPercent: -110, stagger: 0.05, duration: 0.7, ease: "expo.in" }, "+=0.15")
        // setTimeout escapes GSAP callback scope; otherwise intros created by listeners
        // join this context and get reverted when the preloader unmounts.
        .add(() => setTimeout(markLoaded, 0), "-=0.1")
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, "-=0.2");
    }, root);
    return () => ctx.revert();
  }, []);

  if (done) return null;
  return (
    <div
      ref={root}
      className="fixed inset-0 z-[90] flex flex-col justify-between bg-ink p-4 md:p-10"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <div className="eyebrow">ERA · UT Dallas</div>
      <div className="flex justify-center overflow-hidden">
        {"ERA".split("").map((l, i) => (
          <span key={i} className="pl-letter inline-block text-[28vw] leading-[0.85] font-semibold tracking-[-0.06em] md:text-[18vw]">
            {l}
          </span>
        ))}
      </div>
      <div>
        <div className="flex items-end justify-between">
          <span className="eyebrow">Loading</span>
          <span ref={count} className="font-mono text-5xl text-glow tabular-nums md:text-7xl">000</span>
        </div>
        <div className="mt-4 h-px w-full bg-line">
          <div ref={bar} className="h-px w-full origin-left scale-x-0 bg-glow" />
        </div>
      </div>
    </div>
  );
}
