import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Brain, Target, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const STEPS = [
  { id: 'upload', label: 'Resume Uploaded', icon: UploadCloud, desc: 'Securely uploaded to system storage' },
  { id: 'extraction', label: 'Text Extraction', icon: FileText, desc: 'Parsing PDF structure and raw text metadata' },
  { id: 'analysis', label: 'AI Analysis', icon: Brain, desc: 'Cross-referencing experience with target profile via LLM' },
  { id: 'matching', label: 'Skill Matching', icon: Target, desc: 'Calculating ATS matching index and keyword scoring' },
  { id: 'report', label: 'Report Generated', icon: CheckCircle2, desc: 'Formatting candidate intelligence report' }
];

export default function AnalysisTimeline({ isProcessing = false, jobStatus = 'pending', errorMsg = '' }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progressVal, setProgressVal] = useState(10); // Start at 10%

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStepIdx(0);
      setProgressVal(10);
      return;
    }

    // Step mapping and simulation based on job status
    if (jobStatus === 'pending') {
      setCurrentStepIdx(1); // Resume Uploaded is done, Text Extraction is active
      setProgressVal(20);
    } else if (jobStatus === 'processing') {
      // If backend is processing, simulate progress through Text Extraction -> AI Analysis -> Skill Matching
      setCurrentStepIdx(1);
      setProgressVal(35);

      const extractionTimeout = setTimeout(() => {
        setCurrentStepIdx(2); // AI Analysis is active
        setProgressVal(60);
      }, 2500);

      const analysisTimeout = setTimeout(() => {
        setCurrentStepIdx(3); // Skill Matching is active
        setProgressVal(85);
      }, 6000);

      return () => {
        clearTimeout(extractionTimeout);
        clearTimeout(analysisTimeout);
      };
    } else if (jobStatus === 'done') {
      setCurrentStepIdx(5); // All steps completed
      setProgressVal(100);
    } else if (jobStatus === 'failed') {
      // Don't advance index, show failed state
    }
  }, [isProcessing, jobStatus]);

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-md flex flex-col items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg card-glass rounded-[32px] p-8 md:p-10 overflow-hidden shadow-2xl glow-border"
      >
        {/* Scanning laser effect */}
        {jobStatus !== 'failed' && jobStatus !== 'done' && (
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent shadow-[0_0_20px_var(--accent)] z-20"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        )}

        <div className="relative z-10 flex flex-col items-center">
          {/* Header */}
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 mb-6 relative">
            <Brain size={28} className="text-[var(--primary)] animate-pulse" />
            {jobStatus !== 'failed' && jobStatus !== 'done' && (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-4px] border border-[var(--primary)]/30 rounded-[20px] border-t-[var(--accent)]"
              />
            )}
          </div>

          <h3 className="text-2xl font-black text-white mb-1 tracking-tight">
            {jobStatus === 'failed' ? 'Analysis Failed' : jobStatus === 'done' ? 'Intelligence Complete' : 'Analyzing Candidate Profile'}
          </h3>
          <p className="text-[var(--text-muted)] text-sm mb-8 text-center max-w-sm">
            {jobStatus === 'failed' 
              ? 'An error occurred during extraction.' 
              : jobStatus === 'done' 
                ? 'Your career intelligence report is ready.' 
                : 'Processing profile metrics using Neural Networks & NLP.'}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-8 relative border border-white/5">
            <motion.div 
              className={`h-full rounded-full ${jobStatus === 'failed' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] shadow-[0_0_10px_var(--accent)]'}`}
              initial={{ width: '10%' }}
              animate={{ width: `${progressVal}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Timeline Steps */}
          <div className="w-full space-y-6 text-left relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-[2px] before:bg-white/5">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIdx && jobStatus !== 'failed';
              const isActive = index === currentStepIdx && jobStatus !== 'failed';
              const isPending = index > currentStepIdx || (jobStatus === 'failed' && index >= currentStepIdx);
              const isFailedStep = jobStatus === 'failed' && index === currentStepIdx;

              const Icon = step.icon;

              return (
                <div 
                  key={step.id} 
                  className={`flex items-start gap-4 transition-all duration-300 relative ${isPending ? 'opacity-30' : 'opacity-100'}`}
                >
                  {/* Node Icon/Indicator */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border relative z-10 transition-all ${
                    isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    isActive ? 'bg-[var(--accent)]/10 border-[var(--accent)]/40 text-[var(--accent)] shadow-[0_0_15px_rgba(0,243,255,0.2)]' :
                    isFailedStep ? 'bg-red-500/10 border-red-500/40 text-red-400' :
                    'bg-white/5 border-white/10 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 size={18} />
                    ) : isActive ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : isFailedStep ? (
                      <AlertCircle size={18} />
                    ) : (
                      <Icon size={18} />
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="space-y-0.5 flex-1 pt-0.5">
                    <h4 className={`text-sm font-bold tracking-tight ${
                      isCompleted ? 'text-gray-200' : 
                      isActive ? 'text-white' : 
                      isFailedStep ? 'text-red-400' : 
                      'text-gray-500'
                    }`}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                      {isFailedStep ? errorMsg || 'Extraction or connection failed' : step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
