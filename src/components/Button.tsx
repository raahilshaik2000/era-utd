"use client";

import Link from "next/link";
import Magnetic from "./Magnetic";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  external?: boolean;
  cursor?: string;
};

// Pill with a fill that rises from below on hover and a text roll.
export default function Button({ href, children, variant = "solid", external, cursor = "hover" }: Props) {
  const base =
    "group relative inline-flex h-14 items-center overflow-hidden rounded-full px-8 text-[15px] font-medium tracking-tight transition-colors duration-500";
  const styles =
    variant === "solid"
      ? "bg-bone text-ink"
      : "border border-bone/25 text-bone hover:text-ink";
  const fill = variant === "solid" ? "bg-glow" : "bg-bone";
  const inner = (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 translate-y-full rounded-full ${fill} transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-y-0`}
      />
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-700 ease-[var(--ease-expo)] group-hover:-translate-y-full">{children}</span>
        <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-y-0">
          {children}
        </span>
      </span>
    </>
  );
  return (
    <Magnetic>
      {external ? (
        <a href={href} target="_blank" rel="noreferrer" data-cursor={cursor} className={`${base} ${styles}`}>
          {inner}
        </a>
      ) : (
        <Link href={href} data-cursor={cursor} className={`${base} ${styles}`}>
          {inner}
        </Link>
      )}
    </Magnetic>
  );
}
