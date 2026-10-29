"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import Button from "@/components/Button";
import { LINKS } from "@/lib/content";
import { companySchema, studentSchema } from "@/lib/signup";
import { onLoaded } from "@/lib/loaded";

gsap.registerPlugin(SplitText);

type Mode = "student" | "company";
type Field =
  | { key: string; kind: "text" | "email"; q: string; hint?: string; placeholder: string; optional?: boolean }
  | { key: string; kind: "textarea"; q: string; hint?: string; placeholder: string; optional?: boolean }
  | { key: string; kind: "single" | "multi"; q: string; hint?: string; options: string[]; optional?: boolean };

const FLOWS: Record<Mode, Field[]> = {
  student: [
    { key: "name", kind: "text", q: "First, what's your name?", placeholder: "Full name" },
    { key: "email", kind: "email", q: "Your UT Dallas email?", hint: "We only accept @utdallas.edu addresses.", placeholder: "netid@utdallas.edu" },
    { key: "year", kind: "single", q: "What year are you?", options: ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"] },
    { key: "major", kind: "text", q: "What are you studying?", placeholder: "Major" },
    { key: "interests", kind: "multi", q: "What fields pull you in?", hint: "Pick as many as you like.", options: ["Software", "Data and AI", "Product", "Finance", "Consulting", "Entrepreneurship", "Design", "Something else"] },
    { key: "goals", kind: "multi", q: "What do you want from ERA?", hint: "Pick as many as you like.", options: ["Land an internship", "Find mentors", "Start a company", "Find my people"] },
  ],
  company: [
    { key: "name", kind: "text", q: "Who are we talking to?", placeholder: "Full name" },
    { key: "email", kind: "email", q: "Best email to reach you?", placeholder: "you@company.com" },
    { key: "company", kind: "text", q: "Which company?", placeholder: "Company name" },
    { key: "interests", kind: "multi", q: "How do you want to work with ERA?", hint: "Pick as many as you like.", options: ["Recruit interns", "Host a panel or workshop", "Sponsor an event", "Post a role"] },
    { key: "message", kind: "textarea", q: "Anything we should know?", hint: "Roles, timing, majors you hire from. Optional.", placeholder: "Tell us a little more", optional: true },
  ],
};

type Values = Record<string, string | string[]>;

export default function JoinForm({ initialType }: { initialType: Mode }) {
  const [mode, setMode] = useState<Mode>(initialType);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({});
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [honey, setHoney] = useState("");
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const busy = useRef(false);

  // Desktop only: on phones, auto-focus throws the keyboard over the page before they've read it.
  const focusField = () => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
  };

  const flow = FLOWS[mode];
  const field = flow[step];
  const isLast = step === flow.length - 1;

  // Page intro
  useEffect(() => {
    const ctx = gsap.context(() => {
      const split = SplitText.create(".join-title", { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set(".join-fade", { autoAlpha: 0, y: 24 });
      return onLoaded(() => {
        // Focus at the end: the card is visibility:hidden until then and can't take focus.
        gsap.timeline({ onComplete: focusField })
          .to(split.chars, { yPercent: 0, stagger: 0.03, duration: 1.3, ease: "expo.out" })
          .to(".join-fade", { autoAlpha: 1, y: 0, stagger: 0.08, duration: 1.1, ease: "expo.out" }, "-=0.9");
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // Each new question rises in
  useLayoutEffect(() => {
    if (!stage.current) return;
    // Opacity, not autoAlpha: the input must stay focusable so fast typists don't lose keystrokes.
    gsap.fromTo(
      stage.current.querySelectorAll(".q-anim"),
      { yPercent: 60, opacity: 0 },
      { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.9, ease: "expo.out" },
    );
    focusField();
  }, [step, mode, status]);

  const transition = useCallback((fn: () => void) => {
    if (busy.current) return; // ignore repeat Enter mid-transition
    if (!stage.current) return fn();
    busy.current = true;
    gsap.to(stage.current.querySelectorAll(".q-anim"), {
      yPercent: -50,
      opacity: 0,
      stagger: 0.03,
      duration: 0.35,
      ease: "power3.in",
      onComplete: () => {
        busy.current = false;
        fn();
      },
    });
  }, []);

  const validateStep = (): string => {
    const schema = mode === "student" ? studentSchema : companySchema;
    const shape = schema.shape as Record<string, { safeParse: (v: unknown) => { success: boolean; error?: { issues: { message: string }[] } } }>;
    const v = values[field.key] ?? (field.kind === "multi" ? [] : "");
    const r = shape[field.key].safeParse(v);
    return r.success ? "" : r.error?.issues[0]?.message ?? "Check this one";
  };

  const submit = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: mode, ...values, website: honey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      transition(() => setStatus("done"));
    } catch (e) {
      setStatus("idle");
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const next = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      gsap.fromTo(".q-field", { x: -10 }, { x: 0, duration: 0.6, ease: "elastic.out(1,0.3)" });
      return;
    }
    setError("");
    if (isLast) return void submit();
    transition(() => setStep((s) => s + 1));
  };

  const back = () => {
    if (step === 0) return;
    setError("");
    transition(() => setStep((s) => s - 1));
  };

  const switchMode = (m: Mode) => {
    if (m === mode || status !== "idle") return;
    transition(() => {
      setMode(m);
      setStep(0);
      setValues({});
      setError("");
      window.history.replaceState(null, "", m === "company" ? "/join?type=company" : "/join");
    });
  };

  const set = (key: string, v: string | string[]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (error) setError("");
  };

  const toggle = (opt: string) => {
    if (field.kind === "single") {
      set(field.key, opt);
      return;
    }
    const cur = (values[field.key] as string[]) ?? [];
    set(field.key, cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt]);
  };

  // On choice steps: letter keys toggle options, Enter continues (focus is on a chip, not an input).
  const keyHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandler.current = (e) => {
    if (status !== "idle" || (field.kind !== "single" && field.kind !== "multi")) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Enter") {
      e.preventDefault();
      next();
      return;
    }
    const i = e.key.toUpperCase().charCodeAt(0) - 65;
    if (e.key.length === 1 && i >= 0 && i < field.options.length) toggle(field.options[i]);
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyHandler.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const progress = status === "done" ? 1 : step / flow.length;
  const firstName = String(values.name ?? "").split(" ")[0];

  return (
    <main ref={root} className="relative min-h-[100svh] pt-28 pb-16">
      <div className="container-wide grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* Left: title and context */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <h1 className="join-title text-[clamp(3.4rem,8vw,7.5rem)] leading-[0.9] font-medium tracking-[-0.055em]">
            Join <span className="font-serif font-normal text-glow italic">ERA.</span>
          </h1>
          <p className="join-fade mt-6 max-w-md text-lg leading-relaxed text-bone/65">
            {mode === "student"
              ? "Takes under a minute. You'll hear about roles, panels and introductions first."
              : "Tell us who you want to hire and how you'd like to show up. We'll reply by email."}
          </p>

          <div className="join-fade mt-10 inline-flex rounded-full border border-line p-1" role="tablist" aria-label="Sign up as">
            {(["student", "company"] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`relative h-11 rounded-full px-6 text-sm font-medium transition-colors duration-500 ${mode === m ? "bg-bone text-ink" : "text-bone/70 hover:text-bone"}`}
              >
                {m === "student" ? "I'm a student" : "I'm a company"}
              </button>
            ))}
          </div>

          <div className="join-fade mt-12 hidden lg:block">
            <div className="eyebrow mb-4">Or skip ahead</div>
            <a href={LINKS.discord} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-3 text-bone/80 transition-colors hover:text-glow">
              Join the Discord
              <svg viewBox="0 0 24 24" className="h-4 w-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0" aria-hidden>
                <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
          </div>
        </aside>

        {/* Right: the form card */}
        <section className="join-fade relative overflow-hidden rounded-[32px] border border-line bg-abyss/60 backdrop-blur-xl">
          <div className="h-px w-full bg-line">
            <div className="h-px origin-left bg-glow transition-transform duration-1000 ease-[var(--ease-expo)]" style={{ transform: `scaleX(${progress})` }} />
          </div>

          <div className="flex items-center justify-between px-6 pt-6 md:px-12 md:pt-10">
            <span className="font-mono text-xs text-glow">
              {status === "done" ? "Done" : `${String(step + 1).padStart(2, "0")} / ${String(flow.length).padStart(2, "0")}`}
            </span>
            <span className="eyebrow">{mode === "student" ? "Student" : "Company"}</span>
          </div>

          <div ref={stage} className="flex min-h-[460px] flex-col justify-between px-6 pt-10 pb-8 md:min-h-[520px] md:px-12 md:pb-12">
            {status === "done" ? (
              <div className="flex flex-1 flex-col justify-center">
                <div className="q-anim mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-glow text-ink">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                </div>
                <h2 className="q-anim text-[clamp(2.4rem,5vw,4.2rem)] leading-none font-medium tracking-[-0.045em]">
                  {mode === "student" ? <>You&apos;re in, {firstName}.</> : <>Thanks, {firstName}.</>}
                </h2>
                <p className="q-anim mt-6 max-w-md text-lg text-bone/65">
                  {mode === "student"
                    ? "Join the Discord next. That's where roles, events and introductions land first."
                    : "We got your details and will reach out by email soon."}
                </p>
                <div className="q-anim mt-10 flex flex-wrap gap-3">
                  {mode === "student" && (
                    <Button href={LINKS.discord} external>
                      Join the Discord
                    </Button>
                  )}
                  <Button href="/" variant="ghost">
                    Back home
                  </Button>
                </div>
              </div>
            ) : (
              <form
                className="flex flex-1 flex-col justify-between"
                onSubmit={(e) => {
                  e.preventDefault();
                  next();
                }}
                noValidate
              >
                <div>
                  <div className="overflow-hidden">
                    <label htmlFor={`f-${field.key}`} className="q-anim block text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] font-medium tracking-[-0.04em]">
                      {field.q}
                    </label>
                  </div>
                  {field.hint && <p className="q-anim mt-3 text-bone/50">{field.hint}</p>}

                  <div className="q-anim q-field mt-10">
                    {(field.kind === "text" || field.kind === "email") && (
                      <input
                        ref={inputRef}
                        id={`f-${field.key}`}
                        type={field.kind}
                        autoComplete={field.key === "name" ? "name" : field.kind === "email" ? "email" : field.key === "company" ? "organization" : "off"}
                        value={(values[field.key] as string) ?? ""}
                        onChange={(e) => set(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        aria-invalid={!!error}
                        aria-describedby="form-error"
                        className="w-full border-b border-bone/20 bg-transparent pb-4 text-2xl tracking-[-0.02em] outline-none transition-colors duration-500 placeholder:text-bone/25 focus:border-glow md:text-3xl"
                      />
                    )}
                    {field.kind === "textarea" && (
                      <textarea
                        ref={inputRef}
                        id={`f-${field.key}`}
                        rows={4}
                        value={(values[field.key] as string) ?? ""}
                        onChange={(e) => set(field.key, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) next();
                        }}
                        placeholder={field.placeholder}
                        className="w-full resize-none border-b border-bone/20 bg-transparent pb-4 text-xl outline-none transition-colors duration-500 placeholder:text-bone/25 focus:border-glow md:text-2xl"
                      />
                    )}
                    {(field.kind === "single" || field.kind === "multi") && (
                      <div className="flex flex-wrap gap-3" role="group" aria-labelledby={`f-${field.key}`}>
                        {field.options.map((opt, i) => {
                          const v = values[field.key];
                          const on = Array.isArray(v) ? v.includes(opt) : v === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              aria-pressed={on}
                              onClick={() => toggle(opt)}
                              className={`group relative h-12 overflow-hidden rounded-full border px-5 text-[15px] transition-[color,border-color] duration-500 ${
                                on ? "border-glow text-ink" : "border-bone/20 text-bone/80 hover:border-bone/50"
                              }`}
                            >
                              <span className={`absolute inset-0 rounded-full bg-glow transition-transform duration-500 ease-[var(--ease-expo)] ${on ? "scale-100" : "scale-0"}`} aria-hidden />
                              <span className="relative flex items-center gap-2">
                                <span className="font-mono text-[10px] opacity-60">{String.fromCharCode(65 + i)}</span>
                                {opt}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Honeypot */}
                  <input type="text" name="website" value={honey} onChange={(e) => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

                  <p id="form-error" role="alert" className="mt-4 min-h-6 text-sm text-[#ff8f8f]">
                    {error}
                  </p>
                </div>

                <div className="q-anim mt-10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={back}
                    disabled={step === 0}
                    className="text-sm text-bone/60 transition-opacity hover:text-bone disabled:pointer-events-none disabled:opacity-0"
                  >
                    ← Back
                  </button>
                  <div className="flex items-center gap-4">
                    <span className="hidden font-mono text-[11px] text-mist md:inline">
                      {field.kind === "textarea" ? "⌘ + Enter" : "Press Enter ↵"}
                    </span>
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      data-cursor="hover"
                      className="group relative inline-flex h-14 items-center overflow-hidden rounded-full bg-bone px-8 font-medium text-ink disabled:opacity-60"
                    >
                      <span className="absolute inset-0 translate-y-full rounded-full bg-glow transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-y-0" aria-hidden />
                      <span className="relative">{status === "sending" ? "Sending..." : isLast ? "Submit" : "Continue"}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>

      <div className="container-wide mt-16 lg:hidden">
        <Link href={LINKS.discord} target="_blank" className="text-bone/70 underline-offset-4 hover:underline">
          Or join the Discord →
        </Link>
      </div>
    </main>
  );
}
