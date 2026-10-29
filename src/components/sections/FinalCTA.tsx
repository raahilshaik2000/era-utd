"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "../Button";
import { LINKS } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

const WORD = "JOIN ERA";

// Each letter swells in weight and height the closer the cursor gets (Geist is a variable font).
export default function FinalCTA() {
  const root = useRef<HTMLElement>(null);
  const word = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cta-letter", {
        yPercent: 100,
        opacity: 0,
        stagger: 0.05,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: word.current, start: "top 85%" },
      });
    }, root);

    const letters = Array.from(word.current?.querySelectorAll<HTMLElement>(".cta-letter") ?? []);
    const state = letters.map(() => ({ w: 500, s: 1 }));
    const apply = () =>
      letters.forEach((el, i) => {
        el.style.fontVariationSettings = `"wght" ${state[i].w.toFixed(0)}`;
        el.style.transform = `scaleY(${state[i].s.toFixed(3)})`;
      });

    const move = (e: PointerEvent) => {
      letters.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        const k = Math.max(0, 1 - d / 420);
        gsap.to(state[i], { w: 300 + k * 600, s: 1 + k * 0.18, duration: 0.6, ease: "power3.out", onUpdate: apply });
      });
    };
    const reset = () => state.forEach((s) => gsap.to(s, { w: 500, s: 1, duration: 1, ease: "power3.out", onUpdate: apply }));

    const el = root.current;
    if (el && window.matchMedia("(pointer: fine)").matches) {
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", reset);
    }
    return () => {
      el?.removeEventListener("pointermove", move);
      el?.removeEventListener("pointerleave", reset);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden py-32 md:py-44">
      <div className="container-wide text-center">
        <span className="eyebrow">(06) Your move</span>
        <div
          ref={word}
          aria-label="Join ERA"
          className="mt-10 flex justify-center overflow-hidden text-[clamp(4.5rem,17vw,17rem)] leading-[0.85] tracking-[-0.06em] whitespace-nowrap"
        >
          {WORD.split("").map((c, i) => (
            <span
              key={i}
              aria-hidden
              className={`cta-letter inline-block origin-bottom ${c === " " ? "w-[0.25em]" : ""} ${i > 4 ? "text-glow" : ""}`}
              style={{ fontVariationSettings: '"wght" 500' }}
            >
              {c === " " ? " " : c}
            </span>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-md text-lg text-bone/65">
          Students, sign up in under a minute. Companies, tell us who you want to hire.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/join">Sign up</Button>
          <Button href={LINKS.discord} variant="ghost" external>
            Join the Discord
          </Button>
        </div>
      </div>
    </section>
  );
}
