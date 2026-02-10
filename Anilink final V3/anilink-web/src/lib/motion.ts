/**
 * Shared motion variants and config for consistent UI across Farmer, Vet, Seller, Admin.
 * Use for page entrance, stagger children, and scroll-triggered animations.
 */

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.2, ease: [0.25, 0.4, 0.25, 1] as const },
};

export const sectionTransition = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
  transition: { duration: 0.3 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.06 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/** Tailwind classes for clickable/link cards - use with Card className */
export const cardHoverClass =
  "transition-all duration-200 hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 active:scale-[0.99]";
