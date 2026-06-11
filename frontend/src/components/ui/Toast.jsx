import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-emerald-400" size={20} />,
    error: <AlertCircle className="text-rose-400" size={20} />,
    info: <Info className="text-[var(--accent)]" size={20} />
  };

  const backgrounds = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-rose-500/10 border-rose-500/20',
    info: 'bg-[var(--accent)]/10 border-[var(--accent)]/20'
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl card-glass shadow-2xl ${backgrounds[type]}`}>
          {icons[type]}
          <p className="text-sm font-medium text-white pr-4">{message}</p>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition">
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
