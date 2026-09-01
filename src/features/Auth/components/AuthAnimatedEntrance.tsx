/**
 * AuthAnimatedEntrance — entrance overlay animation for Auth pages.
 */
import { motion } from "framer-motion";

export function AuthAnimatedEntrance() {
  return (
    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1, delay: 0.8 }}
      className="fixed inset-0 z-[100] bg-brand-dark pointer-events-none" />
  );
}
