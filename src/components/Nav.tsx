"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { scrollToId } from "./SmoothScroll";
import { LINKS } from "@/lib/content";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "what-we-do", label: "What we do" },
  { id: "companies", label: "Companies" },
  { id: "events", label: "Events" },
];

// Letters scramble through glyphs before settling. Hover detail on every nav link.
function Scramble({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const run = () => {
    const el = ref.current;
    if (!el) return;
    const glyphs = "ERA/\\_#*+<>01";
    let frame = 0;
    const total = text.length * 2 + 4;
    const id = setInterval(() => {
      el.textContent = text
        .split("")
        .map((c, i) => (c === " " || i < (frame - 4) / 2 ? c : glyphs[Math.floor(Math.random() * glyphs.length)]))
        .join("");
      if (++frame > total) {
        clearInterval(id);
        el.textContent = text;
      }
    }, 28);
  };
  return (
    <span ref={ref} onPointerEnter={run}>
      {text}
    </span>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const bar = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const hide = y > last && y > 160;
      gsap.to(bar.current, { yPercent: hide ? -110 : 0, duration: 0.6, ease: "power3.out" });
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      window.__lenis?.stop();
      gsap.fromTo(".m-link", { yPercent: 110 }, { yPercent: 0, stagger: 0.06, duration: 0.9, ease: "expo.out", delay: 0.2 });
    } else window.__lenis?.start();
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    if (pathname !== "/") router.push(`/#${id}`);
    else scrollToId(id);
  };

  return (
    <>
      <header ref={bar} className="fixed inset-x-0 top-0 z-50">
        <div className="container-wide flex h-20 items-center justify-between">
          <Link href="/" data-cursor="hover" className="flex items-baseline gap-2" aria-label="ERA home">
            <span className="text-2xl font-semibold tracking-[-0.06em]">ERA</span>
            <span className="eyebrow hidden sm:inline">@ UT Dallas</span>
          </Link>

          <nav className="hidden items-center gap-9 text-sm text-bone/80 md:flex" aria-label="Main">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => go(s.id)} className="transition-colors hover:text-bone">
                <Scramble text={s.label} />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/join"
              data-cursor="hover"
              className="hidden h-11 items-center rounded-full bg-bone px-6 text-sm font-medium text-ink transition-colors duration-300 hover:bg-glow sm:inline-flex"
            >
              Join ERA
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-bone/20 md:hidden"
            >
              <span className={`absolute h-px w-4 bg-bone transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
              <span className={`absolute h-px w-4 bg-bone transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-ink/95 px-4 pt-28 pb-10 backdrop-blur-xl transition-[clip-path] duration-700 ease-[var(--ease-expo)] md:hidden ${
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <ul className="space-y-2">
          {[...SECTIONS.map((s) => ({ ...s, href: "" })), { id: "join", label: "Join ERA", href: "/join" }].map((s) => (
            <li key={s.id} className="overflow-hidden">
              {s.href ? (
                <Link href={s.href} onClick={() => setOpen(false)} className="m-link block text-5xl font-medium tracking-[-0.04em] text-glow">
                  {s.label}
                </Link>
              ) : (
                <button onClick={() => go(s.id)} className="m-link block text-5xl font-medium tracking-[-0.04em]">
                  {s.label}
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="flex gap-6 text-sm text-mist">
          <a href={LINKS.instagram} target="_blank" rel="noreferrer">Instagram</a>
          <a href={LINKS.discord} target="_blank" rel="noreferrer">Discord</a>
        </div>
      </div>
    </>
  );
}
