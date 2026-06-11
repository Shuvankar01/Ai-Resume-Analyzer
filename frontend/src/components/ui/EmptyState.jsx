import { motion } from 'framer-motion';
import { FileSearch } from 'lucide-react';
import GlassCard from './GlassCard';

export default function EmptyState({ 
  icon: Icon = FileSearch, 
  title = "No Data Available", 
  description = "Get started by uploading a document or performing an action.",
  action 
}) {
  return (
    <GlassCard className="flex flex-col items-center justify-center p-16 text-center border-dashed border-white/10 hover:border-white/20 transition-all">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
        className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 relative"
      >
        <div className="absolute inset-0 rounded-full bg-[var(--primary)]/20 blur-xl animate-pulse" />
        <Icon size={32} className="text-[var(--primary)] relative z-10" />
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </GlassCard>
  );
}
