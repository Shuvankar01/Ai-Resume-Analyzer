import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Scan, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AIProcessing({ isProcessing = false }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { id: 0, label: "Extracting Resume" },
    { id: 1, label: "Analyzing Skills" },
    { id: 2, label: "Matching Job Requirements" },
    { id: 3, label: "Generating Insights" }
  ];

  useEffect(() => {
    if (!isProcessing) {
      setActiveStep(0);
      return;
    }

    // Simulate progress steps
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(interval);
  }, [isProcessing]);

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-md flex flex-col items-center justify-center z-[100]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border)] rounded-[40px] p-10 overflow-hidden shadow-2xl"
      >
        {/* Scanning laser effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent shadow-[0_0_20px_var(--accent)] z-20"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Neural Particles Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[var(--primary)]/5 blur-[100px] rounded-full animate-pulse pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/30 mb-8 relative">
            <Scan size={32} className="text-[var(--primary)] animate-pulse" />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-4px] border border-[var(--primary)]/30 rounded-full border-t-[var(--accent)]"
            />
          </div>

          <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Neural Analysis Active</h3>
          <p className="text-[var(--text-muted)] text-sm mb-10">Please hold while AI cross-references intelligence.</p>

          <div className="w-full space-y-4 text-left">
            {steps.map((step, index) => {
              const isCompleted = index < activeStep;
              const isActive = index === activeStep;
              const isPending = index > activeStep;

              return (
                <div key={step.id} className={`flex items-center gap-4 transition-all duration-500 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    isCompleted ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' :
                    isActive ? 'bg-[var(--accent)]/20 border-[var(--accent)]/50 text-[var(--accent)] shadow-[0_0_15px_rgba(0,243,255,0.3)]' :
                    'bg-white/5 border-white/10 text-gray-600'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : isActive ? <Loader2 size={16} className="animate-spin" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <span className={`text-sm font-bold tracking-tight ${isCompleted ? 'text-gray-300' : isActive ? 'text-white' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
