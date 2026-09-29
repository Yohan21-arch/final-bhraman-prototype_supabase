import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  animate,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import { interpolate } from "flubber";

const GOLD = "#C9A227"; // "dark yellow" ink color
const BASE = 205; // shared ground line every silhouette sits on -- keeps the morph anchored

// --- tiny helper for battlement / balustrade teeth, used by the Red Fort and
// Qutub Minar silhouettes. Assumes the pen is already at (xStart, yBase). ---
function crenellations(xStart: number, xEnd: number, yTop: number, yBase: number, teeth: number) {
  const step = (xEnd - xStart) / (teeth * 2);
  let d = "";
  let x = xStart;
  for (let i = 0; i < teeth; i++) {
    d += `L${x},${yTop} L${x + step},${yTop} L${x + step},${yBase} L${x + step * 2},${yBase} `;
    x += step * 2;
  }
  return d;
}

// Three closed silhouette outlines, same 400x240 viewBox and baseline, so they
// read as one continuous "ground" while flubber morphs the skyline above it.
const TAJ_MAHAL_PATH =
  `M43,${BASE} L43,68 A7,7 0 0 1 57,68 L57,${BASE} ` +
  `L98,${BASE} L98,118 A12,12 0 0 1 122,118 L122,${BASE} ` +
  `L150,${BASE} L150,95 L150,85 A50,45 0 0 1 250,85 L250,95 L250,${BASE} ` +
  `L278,${BASE} L278,118 A12,12 0 0 1 302,118 L302,${BASE} ` +
  `L343,${BASE} L343,68 A7,7 0 0 1 357,68 L357,${BASE} Z`;

// A small decorative iwan (entrance arch) accent, shown only during the Taj stage.
const TAJ_ARCH_ACCENT = `M180,${BASE} L180,150 A20,20 0 0 1 220,150 L220,${BASE}`;

const RED_FORT_PATH =
  `M35,${BASE} L35,140 L45,140 L45,125 A8,8 0 0 1 61,125 L61,140 L71,140 L71,${BASE} ` +
  crenellations(71, 170, 175, BASE, 5) +
  `L170,110 A30,30 0 0 1 230,110 L230,${BASE} ` +
  crenellations(230, 329, 175, BASE, 5) +
  `L329,140 L339,140 L339,125 A8,8 0 0 1 355,125 L355,140 L365,140 L365,${BASE} Z`;

const QUTUB_MINAR_PATH =
  `M40,${BASE} ` +
  crenellations(40, 150, 190, BASE, 3) +
  `L150,120 L158,120 L158,70 L164,70 L164,35 A36,20 0 0 1 236,35 L236,70 L242,70 L242,120 L250,120 L250,${BASE} ` +
  crenellations(250, 360, 190, BASE, 3) +
  `Z`;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface IntroAnimationSketchProps {
  onFinished: () => void;
}

export function IntroAnimationSketch({ onFinished }: IntroAnimationSketchProps) {
  const cancelledRef = useRef(false);
  const skipRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [stage, setStage] = useState<"sketch" | "dissolve" | "title" | "exit">("sketch");
  const [showArchAccent, setShowArchAccent] = useState(false);
  const [visible, setVisible] = useState(true);

  const drawProgress = useMotionValue(0); // 0 -> 1, initial "sketching in" of the Taj outline
  const morphT = useMotionValue(0); // 0 -> 1, reused for each morph phase
  const dValue = useMotionValue(TAJ_MAHAL_PATH);

  useEffect(() => {
    let cancelled = false;
    cancelledRef.current = false;

    const run = async () => {
      if (shouldReduceMotion) {
        // Respect prefers-reduced-motion: skip straight to the title, no morphing.
        setStage("title");
        await wait(500);
      if (cancelled || cancelledRef.current) return;
        if (cancelled || cancelledRef.current) return;
        setStage("exit");
        await wait(200);
        if (!cancelled && !cancelledRef.current) setVisible(false);
        return;
      }

      // 1. Sketch the Taj Mahal outline in.
      await animate(drawProgress, 1, { duration: 1.8, ease: [0.65, 0, 0.35, 1] });
      if (cancelled || cancelledRef.current) return;
      setShowArchAccent(true);
      await wait(500);
      if (cancelled || cancelledRef.current) return;
      if (cancelled || cancelledRef.current) return;
      setShowArchAccent(false);

      // 2. Morph Taj Mahal -> Red Fort.
      const tajToFort = interpolate(TAJ_MAHAL_PATH, RED_FORT_PATH, { maxSegmentLength: 2 });
      morphT.set(0);
      await animate(morphT, 1, {
        duration: 1.5,
        ease: [0.65, 0, 0.35, 1],
        onUpdate: (t) => dValue.set(tajToFort(t)),
      });
      if (cancelled || cancelledRef.current) return;
      await wait(500);
      if (cancelled || cancelledRef.current) return;

      // 3. Morph Red Fort -> Qutub Minar.
      const fortToMinar = interpolate(RED_FORT_PATH, QUTUB_MINAR_PATH, { maxSegmentLength: 2 });
      morphT.set(0);
      await animate(morphT, 1, {
        duration: 1.5,
        ease: [0.65, 0, 0.35, 1],
        onUpdate: (t) => dValue.set(fortToMinar(t)),
      });
      if (cancelled || cancelledRef.current) return;
      await wait(500);
      if (cancelled || cancelledRef.current) return;

      // 4. Dissolve the sketch outward, then reveal the title.
      setStage("dissolve");
      await wait(700);
      if (cancelled || cancelledRef.current) return;
      setStage("title");
      await wait(1700);
      if (cancelled || cancelledRef.current) return;
      setStage("exit");
      await wait(700);
      if (!cancelled && !cancelledRef.current) setVisible(false);
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (!visible) onFinished();
  }, [visible, onFinished]);

  const skip = () => {
    setStage("exit");
    cancelledRef.current = true;
  };

  useEffect(() => {
    if (stage !== "exit") return;
    const timer = window.setTimeout(() => setVisible(false), shouldReduceMotion ? 200 : 700);
    return () => window.clearTimeout(timer);
  }, [stage, shouldReduceMotion]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") { e.preventDefault(); skipRef.current?.focus(); }
      if (e.key === "Escape") {
        skip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => {
        if (previousFocus && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
        else document.getElementById("main-content")?.focus({ preventScroll: true });
      });
    };
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      onClick={skip}
      initial={{ opacity: 1 }}
      animate={{ opacity: stage === "exit" ? 0 : 1 }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
      style={{
        background: "radial-gradient(120% 100% at 50% 40%, #1a1a1a 0%, #000000 70%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Bhraman introduction"
    >
      {/* Top right skip button / prompt */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
        <button
          ref={skipRef}
          onClick={(e) => {
            e.stopPropagation();
            skip();
          }}
          className="min-h-11 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/20 transition-all font-mono"
        >
          Skip Intro ✕
        </button>
      </div>

      {/* Sketch group: outline + Taj arch accent. Fades/blurs/scales away once we leave "sketch". */}
      <motion.div
        animate={
          stage === "sketch"
            ? { opacity: 1, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, scale: shouldReduceMotion ? 1 : 1.18, filter: shouldReduceMotion ? "none" : "blur(8px)" }
        }
        transition={{ duration: shouldReduceMotion ? 0.15 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-[85vw] max-w-xl"
      >
        <svg viewBox="0 0 400 240" className="w-full h-auto overflow-visible">
          <motion.path
            d={dValue}
            style={{ pathLength: drawProgress }}
            fill="none"
            stroke={GOLD}
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <AnimatePresence>
            {showArchAccent && (
              <motion.path
                key="arch-accent"
                d={TAJ_ARCH_ACCENT}
                fill="none"
                stroke={GOLD}
                strokeWidth={1.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>
        </svg>
      </motion.div>

      {/* Title reveal */}
      <AnimatePresence>
        {(stage === "title" || stage === "exit") && (
          <motion.div
            key="title"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.85, filter: shouldReduceMotion ? "none" : "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center"
          >
            <h1
              className="text-5xl sm:text-7xl font-sans font-semibold tracking-[0.02em]"
              style={{ color: GOLD }}
            >
              Bhraman
            </h1>
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.35, duration: shouldReduceMotion ? 0.15 : 0.6 }}
              className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/50"
            >
              Discover India
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


