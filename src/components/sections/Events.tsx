"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EVENTS, LINKS } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

export default function Events() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ev-row", {
        clipPath: "inset(0 100% 0 0)",
        stagger: 0.15,
        duration: 1.6,
        ease: "expo.inOut",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const rows = [
    ...EVENTS.map((e) => ({ ...e, tag: "Recent" })),
    { date: "Next", year: "", title: "Follow @era.utd for what's next", meta: "Kickoffs, panels and build nights", href: LINKS.instagram, tag: "Upcoming" },
  ];

  return (
    <section id="events" ref={root} className="container-wide py-32 md:py-40">
      <div className="mb-14 flex items-end justify-between gap-6">
        <div>
          <span className="eyebrow">(05) Events</span>
          <h2 className="mt-6 text-[clamp(2.6rem,5.5vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.05em]">
            In the <span className="font-serif font-normal text-glow italic">room.</span>
          </h2>
        </div>
      </div>

      <ul className="border-t border-line">
        {rows.map((e) => (
          <li key={e.title} className="ev-row">
            <a
              href={e.href}
              target="_blank"
              rel="noreferrer"
              data-cursor="Open"
              className="group relative grid grid-cols-[90px_1fr] items-center gap-6 border-b border-line py-8 transition-[padding] duration-700 ease-[var(--ease-expo)] hover:px-4 md:grid-cols-[180px_1fr_auto] md:py-12 md:hover:px-8"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-bone transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-x-100" aria-hidden />
              <span className="relative transition-colors duration-500 group-hover:text-ink">
                <span className="block text-3xl font-medium tracking-[-0.04em] md:text-5xl">{e.date}</span>
                <span className="font-mono text-xs text-mist group-hover:text-ink/60">{e.year}</span>
              </span>
              <span className="relative transition-[color,transform] duration-700 ease-[var(--ease-expo)] group-hover:translate-x-4 group-hover:text-ink">
                <span className="block text-2xl font-medium tracking-[-0.03em] md:text-4xl">{e.title}</span>
                <span className="mt-1 block text-bone/55 group-hover:text-ink/60">{e.meta}</span>
              </span>
              <span className="eyebrow relative hidden group-hover:text-ink md:block">{e.tag}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
