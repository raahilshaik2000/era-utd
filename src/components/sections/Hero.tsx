"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Button from "../Button";
import { onLoaded } from "@/lib/loaded";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const split = SplitText.create(".hero-line", { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 115 });
      gsap.set([".hero-sub", ".hero-cta", ".hero-cue"], { autoAlpha: 0, y: 30 });

      const off = onLoaded(() => {
        gsap.timeline({ delay: 0.15 })
          .to(split.chars, { yPercent: 0, stagger: 0.035, duration: 1.4, ease: "expo.out" })
          .to(".hero-sub", { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out" }, "-=1.0")
          .to(".hero-cta", { autoAlpha: 1, y: 0, stagger: 0.1, duration: 1.2, ease: "expo.out" }, "-=1.0")
          .to(".hero-cue", { autoAlpha: 1, y: 0, duration: 1 }, "-=0.8");
      });

      // Headline drifts up, spreads and blurs out as you leave the hero.
      gsap.to(".hero-content", {
        yPercent: -30,
        autoAlpha: 0,
        filter: "blur(8px)",
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-line", {
        letterSpacing: "0.04em",
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      return off;
    }, root);

    // 3D tilt toward the cursor.
    const el = title.current;
    let cleanup = () => {};
    if (el && window.matchMedia("(pointer: fine)").matches) {
      const rx = gsap.quickTo(el, "rotationX", { duration: 1.2, ease: "power3" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 1.2, ease: "power3" });
      const move = (e: PointerEvent) => {
        ry((e.clientX / window.innerWidth - 0.5) * 14);
        rx(-(e.clientY / window.innerHeight - 0.5) * 10);
      };
      window.addEventListener("pointermove", move);
      cleanup = () => window.removeEventListener("pointermove", move);
    }

    return () => {
      cleanup();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative flex h-[100svh] min-h-[640px] items-center justify-center">
      <div className="hero-content container-wide flex flex-col items-center text-center [perspective:1200px]">
        <h1
          ref={title}
          className="text-[clamp(3.6rem,11vw,10.5rem)] leading-[0.9] font-medium tracking-[-0.055em] [transform-style:preserve-3d]"
        >
          <span className="hero-line block">Build your</span>
          <span className="hero-line block font-serif font-normal tracking-[-0.03em] text-glow italic">era.</span>
        </h1>
        <p className="hero-sub mt-8 max-w-xl text-base leading-relaxed text-bone/70 md:text-lg">
          The premier tech and entrepreneurial network rooted in faith at UT Dallas. We connect students with
          internships and the companies offering them.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <div className="hero-cta">
            <Button href="/join">Join ERA</Button>
          </div>
          <div className="hero-cta">
            <Button href="/join?type=company" variant="ghost">
              Hire our members
            </Button>
          </div>
        </div>
      </div>

      <div className="hero-cue absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="eyebrow">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_1.8s_ease-in-out_infinite] bg-glow" />
        </span>
      </div>
    </section>
  );
}
