"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PILLARS } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

// Rotate around the SVG centre, not the shape's own (often lopsided) bounding box.
const SPIN_ORIGIN = { transformBox: "view-box", transformOrigin: "100px 100px" } as const;

// One generative line drawing per pillar.
function Glyph({ i }: { i: number }) {
  const stroke = "currentColor";
  if (i === 0)
    return (
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <g className="animate-[spin-slow_40s_linear_infinite]" style={SPIN_ORIGIN}>
          {[...Array(7)].map((_, k) => {
            const a = (k / 7) * Math.PI * 2;
            const x = 100 + Math.cos(a) * 70;
            const y = 100 + Math.sin(a) * 70;
            return (
              <g key={k}>
                <line x1="100" y1="100" x2={x} y2={y} stroke={stroke} strokeOpacity=".35" />
                <circle cx={x} cy={y} r="5" fill={stroke} className="animate-[pulse-soft_3s_ease-in-out_infinite]" style={{ animationDelay: `${k * 0.4}s` }} />
              </g>
            );
          })}
        </g>
        <circle cx="100" cy="100" r="10" fill="var(--color-glow)" />
      </svg>
    );
  if (i === 1)
    return (
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <g className="animate-[spin-slow_24s_linear_infinite]" style={SPIN_ORIGIN}>
          <circle cx="78" cy="100" r="52" fill="none" stroke={stroke} strokeOpacity=".6" />
          <circle cx="122" cy="100" r="52" fill="none" stroke="var(--color-glow)" />
        </g>
      </svg>
    );
  if (i === 2)
    return (
      <svg viewBox="0 0 200 200" className="h-full w-full">
        {[20, 40, 60, 80].map((r, k) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke={k === 3 ? "var(--color-glow)" : stroke} strokeOpacity={0.25 + k * 0.2} strokeDasharray={k % 2 ? "4 6" : undefined} className="animate-[spin-slow_30s_linear_infinite]" style={{ ...SPIN_ORIGIN, animationDirection: k % 2 ? "reverse" : "normal" }} />
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      {[...Array(8)].map((_, r) =>
        [...Array(8)].map((_, c) => {
          const lit = r === 3 && c === 5;
          return <circle key={`${r}-${c}`} cx={30 + c * 20} cy={30 + r * 20} r={lit ? 6 : 2} fill={lit ? "var(--color-glow)" : stroke} fillOpacity={lit ? 1 : 0.35} className={lit ? "animate-[pulse-soft_2s_ease-in-out_infinite]" : ""} />;
        }),
      )}
    </svg>
  );
}

export default function Pillars() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current!;
        const dist = () => t.scrollWidth - window.innerWidth;
        const tween = gsap.to(t, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            pin: true,
            scrub: 1.2,
            end: () => `+=${dist()}`,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>(".pillar").forEach((card) => {
          gsap.from(card.querySelector(".pillar-glyph"), {
            scale: 0.6,
            rotate: -45,
            opacity: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 95%", end: "left 45%", scrub: true },
          });
        });
        gsap.to(".pillars-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, scrub: true },
        });
      });
      mm.add("(max-width: 899px)", () => {
        gsap.utils.toArray<HTMLElement>(".pillar").forEach((card) => {
          gsap.from(card, { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 85%" } });
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="what-we-do" ref={root} className="relative overflow-hidden min-[900px]:h-[100svh]">
      <div ref={track} className="flex h-full flex-col gap-6 px-4 py-24 min-[900px]:w-max min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-8 min-[900px]:px-10 min-[900px]:py-0">
        <div className="flex shrink-0 flex-col justify-center min-[900px]:w-[38vw] min-[900px]:pr-10">
          <span className="eyebrow">(02) What we do</span>
          <h2 className="mt-6 text-[clamp(2.8rem,6vw,6rem)] leading-[0.95] font-medium tracking-[-0.05em]">
            Four ways we move <span className="font-serif font-normal text-glow italic">careers</span> forward.
          </h2>
          <p className="mt-6 max-w-sm text-bone/60 max-[899px]:hidden">Keep scrolling. Everything ERA does fits into one of these.</p>
        </div>

        {PILLARS.map((p, i) => (
          <article
            key={p.n}
            data-cursor="hover"
            className="pillar group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[28px] border border-line bg-abyss/70 p-8 backdrop-blur-md transition-colors duration-700 hover:border-glow/40 min-[900px]:h-[68vh] min-[900px]:w-[min(34vw,520px)] md:p-10"
          >
            <span aria-hidden className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-teal/0 blur-3xl transition-colors duration-1000 group-hover:bg-teal/30" />
            <div className="relative flex items-start justify-between">
              <span className="font-mono text-sm text-glow">{p.n}</span>
              <span className="eyebrow">ERA / {String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="pillar-glyph relative mx-auto my-10 h-40 w-40 text-bone md:h-52 md:w-52">
              <Glyph i={i} />
            </div>
            <div className="relative">
              <h3 className="text-3xl font-medium tracking-[-0.03em] md:text-4xl">{p.title}</h3>
              <p className="mt-4 max-w-md leading-relaxed text-bone/60">{p.body}</p>
            </div>
          </article>
        ))}
        <div className="hidden w-[10vw] shrink-0 min-[900px]:block" />
      </div>
      <div className="absolute inset-x-10 bottom-10 hidden h-px bg-line min-[900px]:block">
        <div className="pillars-progress h-px origin-left scale-x-0 bg-glow" />
      </div>
    </section>
  );
}
