"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STEPS } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

// Sticky cards that stack; each one sinks back as the next slides over it.
export default function Steps() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".step-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card.querySelector(".step-inner"), {
          scale: 0.9,
          opacity: 0.35,
          filter: "blur(2px)",
          ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 18%", scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="container-wide py-32 md:py-48">
      <div className="mb-16 grid gap-8 md:mb-24 md:grid-cols-2">
        <span className="eyebrow">(03) For students</span>
        <h2 className="text-[clamp(2.6rem,5.5vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.05em]">
          From first meeting to <span className="font-serif font-normal text-glow italic">offer letter.</span>
        </h2>
      </div>

      <div className="space-y-6">
        {STEPS.map((s, i) => (
          <div key={s.n} className="step-card sticky" style={{ top: `calc(14vh + ${i * 28}px)` }}>
            <div className="step-inner grid min-h-[56vh] origin-top gap-10 overflow-hidden rounded-[32px] border border-line bg-gradient-to-br from-deep via-abyss to-ink p-8 md:grid-cols-[1fr_1.2fr] md:p-14">
              <div className="flex flex-col justify-between">
                <span className="font-mono text-sm text-glow">Step {s.n}</span>
                <span className="text-[clamp(6rem,16vw,15rem)] leading-[0.8] font-medium tracking-[-0.07em] text-bone/[0.07]">{s.n}</span>
              </div>
              <div className="flex flex-col justify-end">
                <h3 className="text-[clamp(2rem,4vw,3.6rem)] leading-none font-medium tracking-[-0.04em]">{s.title}</h3>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-bone/65">{s.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
