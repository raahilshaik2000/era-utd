"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LINKS } from "@/lib/content";

function DallasClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time}</span>;
}

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink/70 backdrop-blur-md">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-5xl font-semibold tracking-[-0.06em]">ERA</div>
          <p className="mt-4 max-w-sm text-bone/55">The premier tech and entrepreneurial network rooted in faith at UT Dallas.</p>
        </div>
        <div>
          <div className="eyebrow mb-5">Connect</div>
          <ul className="space-y-3 text-bone/80">
            <li><a className="transition-colors hover:text-glow" href={LINKS.instagram} target="_blank" rel="noreferrer">Instagram</a></li>
            <li><a className="transition-colors hover:text-glow" href={LINKS.discord} target="_blank" rel="noreferrer">Discord</a></li>
            <li><a className="transition-colors hover:text-glow" href={LINKS.linktree} target="_blank" rel="noreferrer">All links</a></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-5">Get involved</div>
          <ul className="space-y-3 text-bone/80">
            <li><Link className="transition-colors hover:text-glow" href="/join">Student sign up</Link></li>
            <li><Link className="transition-colors hover:text-glow" href="/join?type=company">Company partners</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-wide flex flex-col justify-between gap-2 border-t border-line py-6 font-mono text-xs text-mist sm:flex-row">
        <span>© {new Date().getFullYear()} ERA at UT Dallas</span>
        <span>Richardson, TX · <DallasClock /></span>
      </div>
    </footer>
  );
}
