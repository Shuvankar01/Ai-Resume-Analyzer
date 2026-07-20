import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, ShieldCheck, Zap, BarChart, ArrowRight, 
  UploadCloud, Cpu, Database, Blocks, Sparkles, CheckCircle2, 
  ChevronDown, HelpCircle, FileText, User, Users, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import MotionWrapper from '../components/ui/MotionWrapper';
import GlassCard from '../components/ui/GlassCard';

export default function Landing() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, completed
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (scanStatus !== 'idle') return;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      triggerScan(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      triggerScan(selectedFile);
    }
  };

  const triggerScan = (selectedFile) => {
    setFile(selectedFile);
    setScanStatus('scanning');
    setScanProgress(10);
    
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanStatus('completed');
          // Scroll to preview section
          setTimeout(() => {
            document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 600);
          return 100;
        }
        return prev + 15;
      });
    }, 300);
  };

  const features = [
    { icon: ShieldCheck, title: "ATS Score Analysis", desc: "Grade your resume against parsing algorithms with detailed telemetry." },
    { icon: Zap, title: "Missing Keyword Detection", desc: "Instantly surface critical skill gaps and terminology mismatches." },
    { icon: BrainCircuit, title: "Multi-Role Matching", desc: "Compare your experience across multiple career paths simultaneously." },
    { icon: Cpu, title: "AI Career Coach", desc: "Get continuous interactive feedback and improvements on your resume points." },
    { icon: FileText, title: "Resume Section Review", desc: "Detailed structural audit of formatting, summary, and work achievements." },
    { icon: Database, title: "Downloadable Reports", desc: "Generate client-ready PDF intelligence summaries with one-click." }
  ];

  const trustChips = [
    "ATS Score Analysis",
    "Skill Gap Detection",
    "Role Matching",
    "AI Resume Coach",
    "PDF Reports",
    "Candidate History"
  ];

  return (
    <MotionWrapper variant="page" className="min-h-screen bg-[#05050A] text-white overflow-x-hidden selection:bg-[var(--accent)] selection:text-black">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-[var(--accent)]/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-[40%] right-[-15%] w-[60%] h-[60%] bg-[var(--primary)]/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <BrainCircuit size={24} className="text-[var(--primary)]" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter">Resume<span className="text-[var(--accent)]">AI</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">Sign In</Link>
          <Link to="/login" className="px-6 py-2.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-sm font-bold border border-[var(--primary)]/20 transition-all hover-lift shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 pt-12 pb-24 md:pt-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-black uppercase tracking-wider">
            <Sparkles size={12} className="animate-pulse" /> Career Intelligence Engine 2.5
          </div>
          
          <h1 className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-white">
            Bypass the ATS filter with <span className="gradient-text">Resume AI</span>
          </h1>
          
          <p className="text-base md:text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Upload your resume, analyze skill gaps, and optimize for target descriptions. Leverage deep neural diagnostics to fast-track your job search pipeline.
          </p>

          {/* Trust Chips */}
          <div className="flex flex-wrap gap-2.5 max-w-xl">
            {trustChips.map((chip, idx) => (
              <span key={idx} className="px-3.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-gray-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[var(--accent)]" /> {chip}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/login" className="flex items-center gap-2.5 px-8 py-4 premium-gradient-bg border border-[var(--accent)]/30 text-white rounded-2xl font-bold text-lg hover-lift shadow-[0_0_30px_rgba(0,243,255,0.2)]">
              Analyze Resume <ArrowRight size={20} />
            </Link>
            <a href="#how-it-works" className="flex items-center gap-2.5 px-8 py-4 bg-[var(--surface-elevated)] border border-[var(--border)] text-gray-300 rounded-2xl font-bold text-lg hover:bg-white/5 transition-all">
              Learn Workflow
            </a>
          </div>
        </div>

        {/* Hero Right: Upload/Analyze Card */}
        <div className="lg:col-span-5">
          <GlassCard glow className="p-8 relative">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-sm font-black">
                AI
              </span>
              Instant Resume Scan
            </h3>

            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all bg-[var(--surface-elevated)] relative overflow-hidden group
                ${scanStatus === 'scanning' ? 'border-[var(--primary)]/50 bg-[var(--primary)]/5' : 'border-[var(--border)] hover:border-[var(--primary)]/40'}
              `}
            >
              {scanStatus === 'idle' && (
                <label className="cursor-pointer flex flex-col items-center gap-4">
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-gray-400 group-hover:text-white transition-all group-hover:border-[var(--accent)]/30">
                    <UploadCloud size={28} />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-sm font-bold text-gray-200 group-hover:text-white">Drag & drop your resume</span>
                    <span className="block text-xs text-[var(--text-muted)] font-medium">Supports PDF formats up to 10MB</span>
                  </div>
                </label>
              )}

              {scanStatus === 'scanning' && (
                <div className="space-y-6 py-4">
                  <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)] animate-spin mx-auto" />
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-white">Analyzing profile indicators...</p>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[var(--accent)] h-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {scanStatus === 'completed' && (
                <div className="space-y-6 py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Temporary Analysis Complete!</p>
                    <p className="text-xs text-[var(--text-muted)]">{file?.name}</p>
                  </div>
                  <button 
                    onClick={() => setScanStatus('idle')}
                    className="text-xs font-bold text-[var(--accent)] underline hover:text-white transition-colors"
                  >
                    Upload Another
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest">
              <span>Security: AES-256</span>
              <span>Process: Private Session</span>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-24 border-t border-b border-[var(--border)] bg-white/[0.01]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">How It Works</h2>
            <p className="text-[var(--text-muted)] text-base md:text-lg">Deploy neural analysis on your resume credentials in three easy steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
            
            {[
              { idx: "01", title: "Upload & Align", desc: "Upload your resume file and specify target job criteria." },
              { idx: "02", title: "NLP Diagnostics", desc: "Our neural engine scans format schemas, matches skill arrays, and detects gaps." },
              { idx: "03", title: "Apply Optimization", desc: "Deploy tailored recommendations, score bump profiles, and export reports." }
            ].map((step, i) => (
              <div key={i} className="text-center flex flex-col items-center space-y-6">
                <div className="w-24 h-24 rounded-full card-glass border-2 border-[var(--border)] flex items-center justify-center relative z-10">
                  <span className="text-2xl font-black text-[var(--primary)]">{step.idx}</span>
                </div>
                <div className="space-y-2 max-w-sm">
                  <h4 className="text-lg font-bold text-white">{step.title}</h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">Designed For Modern Hiring</h2>
          <p className="text-[var(--text-muted)] text-base md:text-lg">Equipped with enterprise-grade features to optimize your professional profiles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <GlassCard key={i} className="p-8 space-y-5 flex flex-col justify-between border border-[var(--border)]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--accent)]">
                  <feat.icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-white">{feat.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feat.desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Marketing Preview Console */}
      <section id="preview-section" className="relative z-10 py-24 bg-white/[0.01] border-t border-b border-[var(--border)]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">Resume Intelligence Console</h2>
            <p className="text-[var(--text-muted)] text-base md:text-lg">Experience what candidate intelligence looks like on our portal.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Console Left: Overview */}
            <div className="lg:col-span-5 space-y-6">
              <GlassCard glow className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Analysis Metadata</span>
                  <span className="px-2.5 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase border border-[var(--accent)]/20">Active Preview</span>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Mock Score Circle */}
                  <div className="w-28 h-28 rounded-full border-[6px] border-white/5 border-t-[var(--accent)] border-r-[var(--primary)] flex flex-col items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-white">78%</span>
                    <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest">ATS Score</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white">{file ? file.name : "demo_resume.pdf"}</h4>
                    <p className="text-xs text-[var(--text-muted)]">Senior Software Engineer profile</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase">Optimal formatting check passed</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-[var(--border)] pt-6">
                  <h5 className="text-xs font-black text-white uppercase tracking-wider">AI Executive Summary</h5>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Strong technical leadership foundations with extensive full-stack experience. High relevance to modern cloud architecture roles, though minor gaps in strategic security keywords were detected.
                  </p>
                </div>
              </GlassCard>
            </div>

            {/* Console Right: Skill breakdown */}
            <div className="lg:col-span-7 space-y-6 relative">
              <GlassCard className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Matched skills */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 size={14} /> Matched Skillsets (8)
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Git', 'Agile'].map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing skills */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle size={14} /> Missing Keywords (5)
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {['AWS ECS', 'Kubernetes', 'CI/CD Pipelines', 'GraphQL', 'OAuth2'].map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-[var(--border)] pt-6">
                  <h5 className="text-xs font-black text-white uppercase tracking-wider">Career Alignment Indicators</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs text-[var(--primary)] font-bold">
                      Full-Stack Dev: 88% Match
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400 font-bold">
                      Cloud Architect: 55% Match
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Unlock Overlap UI */}
              <div className="absolute inset-0 bg-[#05050A]/70 backdrop-blur-sm rounded-3xl flex items-center justify-center p-6 border border-white/5">
                <div className="text-center max-w-sm space-y-6">
                  <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center mx-auto shadow-inner animate-bounce">
                    <Sparkles size={20} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white">Unlock Deep Analytics</h4>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Sign in to save files, get coach assistance, and compile complete reports.</p>
                  </div>
                  <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-xs font-bold transition-all hover-lift">
                    Sign Up / Sign In <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Candidate vs Recruiter Use Cases */}
      <section className="relative z-10 py-24 max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Candidate Box */}
        <GlassCard className="p-8 md:p-10 space-y-6 border border-[var(--border)]">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <User size={24} />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white">For Candidates</h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Diagnose formatting mismatches, optimize keywords, and track improvement scores using a personal dashboard. Receive live instructions from your dedicated AI Career Coach.
          </p>
          <ul className="space-y-3 pt-2">
            {["ATS Score check", "Skill gap analysis", "Download reports", "Coaching chat"].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-xs font-bold text-gray-300">
                <Check size={14} className="text-blue-400" /> {item}
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Recruiter Box */}
        <GlassCard className="p-8 md:p-10 space-y-6 border border-[var(--border)]">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
            <Users size={24} />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white">For Talent Pools</h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Sort through hundreds of candidate resumes. Review rankings based on job criteria matches and explore summaries compiled directly from pdf uploads.
          </p>
          <ul className="space-y-3 pt-2">
            {["Candidate lists", "Benchmarked scores", "Organizational grids", "Interactive tables"].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-xs font-bold text-gray-300">
                <Check size={14} className="text-[var(--accent)]" /> {item}
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>

      {/* Report Preview */}
      <section className="relative z-10 py-24 bg-white/[0.01] border-t border-[var(--border)]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 space-y-8">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Export Comprehensive PDF Reports
            </h2>
            <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
              Generate dynamic summaries to share offline with mentors or recruiters. Reports contain fully formatted matched skill sheets, structural checks, and recommendations.
            </p>
            <div className="flex gap-4">
              <Link to="/login" className="flex items-center gap-2.5 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all">
                Download Sample PDF <FileText size={16} />
              </Link>
            </div>
          </div>

          {/* Report visual mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <GlassCard glow className="w-80 h-[420px] p-6 relative overflow-hidden shadow-2xl border border-white/5">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]" />
              <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                  <div>
                    <h4 className="text-xs font-black text-white">RECRUITER FEEDBACK REPORT</h4>
                    <p className="text-[8px] text-[var(--text-muted)]">SYSTEM ID #9082</p>
                  </div>
                  <span className="text-sm font-black text-[var(--accent)]">84/100</span>
                </div>

                {/* Mock lines */}
                <div className="space-y-3">
                  <div className="h-2 w-3/4 bg-white/5 rounded" />
                  <div className="h-2 w-full bg-white/5 rounded" />
                  <div className="h-2 w-5/6 bg-white/5 rounded" />
                </div>

                <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                  <h5 className="text-[10px] font-black text-white">SCORE ROADMAP</h5>
                  <div className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 self-center" />
                    <p className="text-[8px] text-gray-400">Technical competency matches requirement logs.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 self-center" />
                    <p className="text-[8px] text-gray-400">Add AWS cloud services metrics to resume summaries.</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* FAQ and CTA */}
      <section className="relative z-10 py-24 max-w-[1600px] mx-auto px-6 md:px-12 space-y-24">
        {/* Accordions */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h3 className="text-2xl md:text-3xl font-black text-center text-white mb-10">Frequently Asked Questions</h3>
          
          {[
            { q: "Is the scan result saved locally?", a: "No, active scanning on the landing page is session-only. Register or log in to keep a historical log." },
            { q: "How long does a complete ATS report analysis take?", a: "Typically under 10 seconds. The Celery worker processes all elements asynchronously." },
            { q: "Can recruiters use this as an applicant tracking system?", a: "Yes, recruiters have a talent pool dashboard to filter and sort candidate matches easily." }
          ].map((faq, idx) => (
            <div key={idx} className="border-b border-[var(--border)] pb-4">
              <button 
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between py-3 text-left font-bold text-white hover:text-[var(--accent)] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown size={16} className={`transform transition-transform ${faqOpen[idx] ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {faqOpen[idx] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="py-2 text-sm text-[var(--text-muted)] leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Final CTA Banner */}
        <div className="relative rounded-[32px] overflow-hidden p-10 md:p-16 text-center card-glass border border-[var(--border)] glow-border max-w-5xl mx-auto">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[var(--primary)]/5 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Ready to Upgrade Your Career?
            </h2>
            <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
              Join thousands of applicants optimizing their professional profiles. Instant setup, private data.
            </p>
            <div className="pt-4">
              <Link to="/login" className="inline-flex items-center gap-2.5 px-8 py-4 premium-gradient-bg border border-[var(--accent)]/30 text-white rounded-2xl font-bold text-lg hover-lift shadow-[0_0_35px_rgba(0,243,255,0.2)]">
                Get Started Free <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MotionWrapper>
  );
}
