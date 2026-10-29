"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const split = SplitText.create(".manifesto", { type: "words" });
      // Words light up one by one as you read down.
      gsap.fromTo(
        split.words,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: ".manifesto", start: "top 75%", end: "bottom 45%", scrub: true },
        },
      );
      gsap.from(".about-rule", {
        scaleX: 0,
        transformOrigin: "left",
        duration: 1.6,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={root} className="container-wide py-32 md:py-56">
      <div className="mb-14 flex items-center gap-6">
        <span className="eyebrow shrink-0">(01) About ERA</span>
        <span className="about-rule h-px flex-1 bg-line" />
      </div>
      <p className="manifesto max-w-6xl text-[clamp(1.9rem,4.4vw,4.2rem)] leading-[1.08] font-medium tracking-[-0.035em]">
        ERA is a network of builders at UT Dallas. We put ambitious students in front of the{" "}
        <span className="font-serif font-normal text-glow italic">internships</span>, mentors and companies that move
        careers forward, and we do it on a foundation of{" "}
        <span className="font-serif font-normal text-glow italic">faith</span>, character and service.
      </p>
    </section>
  );
}
