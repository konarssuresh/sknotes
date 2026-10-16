"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * @param {{
 *   show: boolean;
 *   children: React.ReactNode;
 *   className?: string;
 * }} props
 */
export function AnimatedListItem({ show, children, className }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.li
          layout={!reduceMotion}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          className={className}
        >
          {children}
        </motion.li>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * @param {{
 *   open: boolean;
 *   children: React.ReactNode;
 *   className?: string;
 * }} props
 */
export function AnimatedOverlay({ open, children, className }) {
  const reduceMotion = useReducedMotion();
  if (!open) {
    return null;
  }
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
