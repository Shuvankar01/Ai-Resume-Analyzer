import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function GlassCard({ 
  children, 
  className = '', 
  glow = false, 
  hover = false,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "card-glass rounded-3xl relative overflow-hidden",
        glow && "glow-border",
        hover && "hover-lift cursor-pointer",
        className
      )}
    >
      {/* Internal ambient glow */}
      {glow && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary)]/10 blur-3xl rounded-full pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
