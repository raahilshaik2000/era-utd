"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Button from "../Button";
import { COMPANY_OFFERS } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function Companies() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const split = SplitText.create(".co-title", { type: "lines", mask: "lines", linesClass: "split-line" });
      gsap.from(split.lines, {
        yPercent: 110,
        stagger: 0.1,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: ".co-title", start: "top 80%" },
      });
      gsap.from(".co-row", {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: ".co-list", start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="companies" ref={root} className="container-wide py-32 md:py-48">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <span className="eyebrow">(04) For companies</span>
          <h2 className="co-title mt-6 text-[clamp(2.8rem,6vw,6rem)] leading-[0.95] font-medium tracking-[-0.05em]">
            Hiring interns? Meet <span className="font-serif font-normal text-glow italic">ERA.</span>
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-bone/65">
            We work with companies that want driven, coachable students from UT Dallas. Tell us what you are hiring for
            and we will take it from there.
          </p>
          <div className="mt-10">
            <Button href="/join?type=company">Partner with us</Button>
          </div>
        </div>

        <ul className="co-list border-t border-line">
          {COMPANY_OFFERS.map((o, i) => (
            <li key={o.title} className="co-row group relative overflow-hidden border-b border-line" data-cursor="hover">
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-gradient-to-r from-teal/40 to-deep/10 transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-y-100"
              />
              <div className="relative grid grid-cols-[auto_1fr_auto] items-start gap-6 py-8 transition-[padding] duration-700 ease-[var(--ease-expo)] group-hover:px-6 md:py-10">
                <span className="pt-2 font-mono text-xs text-mist">0{i + 1}</span>
                <div>
                  <h3 className="text-2xl font-medium tracking-[-0.03em] md:text-4xl">{o.title}</h3>
                  <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[var(--ease-expo)] group-hover:grid-rows-[1fr] max-md:grid-rows-[1fr]">
                    <p className="overflow-hidden pt-0 text-bone/70 transition-[padding] duration-700 group-hover:pt-4 max-md:pt-3">{o.body}</p>
                  </div>
                </div>
                <svg viewBox="0 0 24 24" className="mt-2 h-6 w-6 -rotate-45 text-glow transition-transform duration-700 ease-[var(--ease-expo)] group-hover:rotate-0" aria-hidden>
                  <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
