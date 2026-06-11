import { useState } from 'react';
import { LogIn, UserPlus, BrainCircuit, Loader2, Sparkles, Target, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import MotionWrapper from '../components/ui/MotionWrapper';
import GlassCard from '../components/ui/GlassCard';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  
  const { login } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        addToast('Authentication successful', 'success');
      } else {
        await authService.register({
          email,
          password,
          full_name: fullName,
          is_recruiter: isRecruiter
        });
        setIsLogin(true);
        addToast('Profile initialized successfully', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.detail || 'Authentication failed', 'error');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] overflow-hidden">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 relative overflow-hidden bg-[var(--surface)]">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[var(--accent)]/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--primary)]/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <BrainCircuit size={24} className="text-[var(--primary)]" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">Resume<span className="text-[var(--accent)]">AI</span></span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <h1 className="text-5xl font-black text-white tracking-tighter leading-tight">
            Unlock the power of <br />
            <span className="gradient-text">Neural Matching</span>
          </h1>
          <p className="text-xl text-[var(--text-muted)] leading-relaxed">
            Join the industry's leading predictive talent intelligence platform.
          </p>
          
          <div className="space-y-6 pt-8 border-t border-[var(--border)]">
            {[
              { icon: Sparkles, text: "Automated Resume Optimization" },
              { icon: Target, text: "Precision ATS Benchmarking" },
              { icon: Zap, text: "Real-time Skill Gap Analysis" }
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                key={i} className="flex items-center gap-4 text-gray-300"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[var(--accent)]">
                  <feature.icon size={14} />
                </div>
                <span className="font-medium text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-[var(--text-muted)] font-mono">
          System Status: OPTIMAL | Version: 2.0.0
        </div>
      </div>

      {/* Right side - Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Mobile background elements */}
        <div className="lg:hidden absolute top-0 left-0 w-[100%] h-[100%] bg-[var(--accent)]/5 blur-[150px] rounded-full pointer-events-none"></div>

        <MotionWrapper variant="slideUp" className="w-full max-w-md relative z-10">
          <GlassCard glow className="p-10 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-2 text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-center text-[var(--text-muted)] text-sm mb-10">
              {isLogin ? 'Enter your credentials to access the system.' : 'Initialize your intelligence profile.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)]/40 focus:bg-white/5 outline-none transition-all text-white placeholder:text-gray-700 text-sm"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Email Protocol</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)]/40 focus:bg-white/5 outline-none transition-all text-white placeholder:text-gray-700 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Secure Password</label>
                  {isLogin && <a href="#" className="text-xs text-[var(--accent)] hover:underline">Forgot?</a>}
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)]/40 focus:bg-white/5 outline-none transition-all text-white placeholder:text-gray-700 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 p-4 mt-2 rounded-2xl bg-white/[0.02] border border-[var(--border)] transition-all hover:bg-white/[0.04] overflow-hidden"
                  >
                    <input
                      type="checkbox"
                      id="recruiter"
                      className="w-5 h-5 rounded-lg border-white/10 bg-black/40 text-[var(--accent)] focus:ring-[var(--accent)]/20 outline-none cursor-pointer"
                      checked={isRecruiter}
                      onChange={(e) => setIsRecruiter(e.target.checked)}
                    />
                    <label htmlFor="recruiter" className="text-sm text-gray-400 cursor-pointer select-none">
                      Request Recruiter Privileges
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={localLoading}
                className="w-full mt-6 py-4 premium-gradient-bg border border-[var(--primary)]/30 text-white rounded-2xl font-bold text-sm shadow-[0_10px_30px_rgba(0,243,255,0.15)] transition-all active:scale-[0.98] hover-lift disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
              >
                {localLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : isLogin ? (
                  <><LogIn size={20} /> <span>Establish Link</span></>
                ) : (
                  <><UserPlus size={20} /> <span>Create Identifier</span></>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                {isLogin ? "New user?" : "Existing identifier?"}
                <button
                  className="ml-2 text-[var(--accent)] font-bold hover:underline transition-all"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Initialize Profile' : 'Establish Link'}
                </button>
              </p>
            </div>
          </GlassCard>
        </MotionWrapper>
      </div>

      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
