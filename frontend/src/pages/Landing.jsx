import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BrainCircuit, ShieldCheck, Zap, BarChart, ArrowRight, UploadCloud, Cpu, Database, Blocks } from 'lucide-react';
import MotionWrapper from '../components/ui/MotionWrapper';
import GlassCard from '../components/ui/GlassCard';

export default function Landing() {
  const features = [
    { icon: BrainCircuit, title: "AI Resume Scoring", desc: "Get an instant, objective analysis of your resume's impact." },
    { icon: ShieldCheck, title: "ATS Optimization", desc: "Ensure your resume passes through automated tracking systems." },
    { icon: Zap, title: "Skill Gap Detection", desc: "Identify missing keywords based on real job descriptions." },
    { icon: BarChart, title: "Recruiter Matching", desc: "Benchmark your profile against the top talent pool." }
  ];

  const workflow = [
    { step: "01", title: "Upload", desc: "Provide your resume and target job description." },
    { step: "02", title: "AI Analysis", desc: "Our neural engine scans for alignment and gaps." },
    { step: "03", title: "Improvement", desc: "Receive actionable, strategic recommendations." },
    { step: "04", title: "Report", desc: "Download a comprehensive intelligence report." }
  ];

  return (
    <MotionWrapper variant="page" className="min-h-screen bg-[var(--background)] overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent)]/10 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--primary)]/10 blur-[150px] rounded-full pointer-events-none" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <BrainCircuit size={24} className="text-[var(--primary)]" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter">Resume<span className="text-[var(--accent)]">AI</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">Sign In</Link>
          <Link to="/login" className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/10 transition-all hover-lift">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-16 pb-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mt-20 md:mt-32 space-y-8 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-bold uppercase tracking-widest"
          >
            <SparklesIcon /> System Version 2.0 Active
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1]"
          >
            AI Powered <br className="hidden md:block" />
            <span className="gradient-text">Resume Intelligence</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl leading-relaxed"
          >
            Analyze, optimize and improve your resume with advanced AI. Bypass the ATS filter and secure interviews faster.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-8"
          >
            <Link to="/login" className="flex items-center gap-3 px-8 py-4 premium-gradient-bg border border-[var(--accent)]/30 text-white rounded-2xl font-bold text-lg hover-lift shadow-[0_0_30px_rgba(0,243,255,0.2)]">
              Analyze Resume <ArrowRight size={20} />
            </Link>
            <a href="#workflow" className="flex items-center gap-3 px-8 py-4 bg-[var(--surface-elevated)] border border-[var(--border)] text-gray-300 rounded-2xl font-bold text-lg hover:bg-white/5 transition-all">
              Learn How It Works
            </a>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 md:mt-48 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <GlassCard key={i} hover delay={0.5 + (i * 0.1)} className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center">
                <feat.icon size={24} className="text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-bold text-white">{feat.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">{feat.desc}</p>
            </GlassCard>
          ))}
        </div>

        {/* Workflow Section */}
        <div id="workflow" className="mt-32 md:mt-48 scroll-mt-32">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Intelligence Workflow</h2>
            <p className="text-[var(--text-muted)] text-lg">Four steps to professional perfection.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
            {workflow.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                key={i} className="relative flex flex-col items-center text-center space-y-6 group"
              >
                <div className="w-24 h-24 rounded-full card-glass border-2 border-[var(--border)] flex items-center justify-center relative z-10 group-hover:border-[var(--accent)]/50 transition-colors">
                  <span className="text-3xl font-black text-white">{item.step}</span>
                  <div className="absolute inset-0 bg-[var(--accent)]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-[var(--text-muted)]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-32 md:mt-48 border-t border-[var(--border)] pt-24 text-center">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-10">Powered by Enterprise Technology</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-xl font-bold text-white"><Blocks size={28} /> React 19</div>
            <div className="flex items-center gap-2 text-xl font-bold text-white"><Zap size={28} /> FastAPI</div>
            <div className="flex items-center gap-2 text-xl font-bold text-white"><BrainCircuit size={28} /> Gemini AI</div>
            <div className="flex items-center gap-2 text-xl font-bold text-white"><Database size={28} /> PostgreSQL</div>
          </div>
        </div>
      </main>
    </MotionWrapper>
  );
}

function SparklesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" />
    </svg>
  );
}
