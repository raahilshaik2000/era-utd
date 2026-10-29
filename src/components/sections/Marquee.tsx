"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ROW_A = ["Internships", "Mentorship", "Founders", "Faith", "Careers", "Community"];
const ROW_B = ["Engineers", "Operators", "Builders", "Companies", "Panels", "UT Dallas"];

// Each row drifts on its own; scroll velocity speeds it up and scroll direction flips it.
function Row({ words, reverse }: { words: string[]; reverse?: boolean }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let x = 0;
    let dir = 1;
    let boost = 0;
    const base = 0.045; // % of track per frame

    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        dir = self.direction;
        boost = Math.min(Math.abs(self.getVelocity()) / 140, 2.4);
      },
    });

    const tick = () => {
      boost *= 0.94;
      x -= (base + base * boost * 6) * dir * (reverse ? -1 : 1);
      if (x <= -50) x += 50;
      if (x > 0) x -= 50;
      gsap.set(el, { xPercent: x });
      gsap.set(el.children, { skewX: -boost * 4 * dir });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, [reverse]);

  const items = [...words, ...words];
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div ref={track} className="inline-flex w-max will-change-transform">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            {items.map((w, i) => (
              <span key={i} className="flex items-center">
                <span
                  className={`px-6 text-[clamp(3rem,9vw,8rem)] leading-none font-medium tracking-[-0.05em] md:px-10 ${
                    i % 2 ? "text-outline" : reverse ? "font-serif font-normal text-glow italic" : ""
                  }`}
                >
                  {w}
                </span>
                <svg width="28" height="28" viewBox="0 0 24 24" className="shrink-0 text-glow/70" aria-hidden>
                  <path d="M12 0 L13.6 10.4 L24 12 L13.6 13.6 L12 24 L10.4 13.6 L0 12 L10.4 10.4 Z" fill="currentColor" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section aria-label="What ERA is about" className="relative space-y-4 border-y border-line bg-ink/40 py-14 backdrop-blur-[2px] md:py-20">
      <Row words={ROW_A} />
      <Row words={ROW_B} reverse />
    </section>
  );
}
