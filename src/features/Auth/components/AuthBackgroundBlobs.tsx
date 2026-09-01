/**
 * AuthBackgroundBlobs — animated background blobs for Auth pages.
 */
import { motion } from "framer-motion";

export function AuthBackgroundBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <motion.div animate={{ x: [0, -40, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, delay: 1 }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
    </div>
  );
}
