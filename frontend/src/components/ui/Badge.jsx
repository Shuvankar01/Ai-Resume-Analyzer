import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: "bg-white/10 text-gray-300 border-white/10",
    primary: "bg-(--primary)/10 text-(--primary) border-(--primary)/20",
    accent: "bg-(--accent)/10 text-(--accent) border-(--accent)/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider backdrop-blur-sm",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
