import { useState, useEffect } from "react";
import { useSpring, useMotionValue, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * AnimatedNumber — Smoothly animates between numeric values using a spring physics model.
 *
 * Usage:
 *   <AnimatedNumber value={42} className="text-2xl font-black" />
 */
export default function AnimatedNumber({
  value,
  className,
  springConfig = { stiffness: 80, damping: 20, mass: 1 },
}: {
  value: number;
  className?: string;
  springConfig?: { stiffness: number; damping: number; mass?: number };
}) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, springConfig);
  const [displayValue, setDisplayValue] = useState(value);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplayValue(Math.round(latest));
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <span className={cn("tabular-nums", className)}>{displayValue}</span>;
}
