import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface BrandLanguage {
  text: string;
  lang: string;
  label: string;
  fontClass: string;
  dir?: "ltr" | "rtl";
}

export const BRAND_LANGUAGES: BrandLanguage[] = [
  {
    text: "Bhraman",
    lang: "en",
    label: "English",
    fontClass: "display-font",
    dir: "ltr",
  },
  {
    text: "भ्रमण",
    lang: "hi",
    label: "Hindi",
    fontClass: "font-devanagari",
    dir: "ltr",
  },
  {
    text: "بھرمَن",
    lang: "ur",
    label: "Urdu",
    fontClass: "font-urdu",
    dir: "rtl",
  },
];

export function CyclingBrandName({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      // Respect prefers-reduced-motion by keeping it static on English
      return;
    }

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % BRAND_LANGUAGES.length);
    }, 6500);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const current = BRAND_LANGUAGES[index];

  return (
    <div
      className={cn(
        "relative inline-flex items-center min-w-[4.8rem] sm:min-w-[6.2rem] h-7 overflow-visible shrink-0",
        className
      )}
      aria-label="Bhraman"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current.lang}
          lang={current.lang}
          dir={current.dir}
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, y: 3, filter: "blur(0px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, y: -3, filter: "blur(2px)" }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            "text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors inline-block leading-none select-none whitespace-nowrap",
            current.fontClass
          )}
        >
          {current.text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

