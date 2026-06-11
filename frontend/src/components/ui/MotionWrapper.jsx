import { motion } from 'framer-motion';

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
};

export const pageTransition = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(10px)" },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function MotionWrapper({ children, variant = 'fade', className = '', delay = 0 }) {
  const variants = {
    fade,
    slideUp,
    scaleIn,
    page: pageTransition
  };

  const selectedVariant = variants[variant] || fade;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        ...selectedVariant,
        animate: {
          ...selectedVariant.animate,
          transition: { ...selectedVariant.transition, delay }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
