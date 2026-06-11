import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import GlassCard from './GlassCard';

export default function ErrorState({ 
  title = "System Error", 
  message = "An unexpected anomaly occurred during intelligence processing.",
  onRetry 
}) {
  return (
    <GlassCard className="flex flex-col items-center justify-center p-12 text-center border-rose-500/20 bg-rose-500/5">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 mb-6"
      >
        <AlertTriangle size={28} className="text-rose-500" />
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-[var(--text-muted)] text-sm max-w-sm mb-8 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold border border-rose-500/20 transition-all active:scale-95"
        >
          <RefreshCw size={16} /> Reinitialize
        </button>
      )}
    </GlassCard>
  );
}
