// Tiny signal so sections can wait for the preloader before playing intros.
let loaded = false;
const subs = new Set<() => void>();

export function onLoaded(fn: () => void) {
  if (loaded) {
    fn();
    return () => {};
  }
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function markLoaded() {
  if (loaded) return;
  loaded = true;
  subs.forEach((fn) => fn());
  subs.clear();
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
