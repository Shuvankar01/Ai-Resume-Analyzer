import { useState, useCallback, memo } from 'react';
import { UploadCloud, CheckCircle, Download, FileText, Search, Plus, RefreshCw, Sparkles, Activity, Target, Zap, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ATSScoreCard from '../components/ui/ATSScoreCard';
import Badge from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';
import MotionWrapper from '../components/ui/MotionWrapper';
import MetricCard from '../components/ui/MetricCard';
import { resumeService } from '../services/resumeService';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

const MemoizedScoreCard = memo(ATSScoreCard);

export default function CandidateOverview() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const { toasts, addToast, removeToast } = useToast();

  const handleReset = () => {
    setFile(null);
    setJobDescription('');
    setResumeId(null);
    setAnalysis(null);
    setStep('');
  };

  const handleUpload = useCallback(async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStep("Uploading resume...");

    try {
      const data = await resumeService.upload(file);
      setResumeId(data.id);
      addToast('Resume uploaded successfully', 'success');
      setStep("Upload complete ✅");
    } catch (err) {
      addToast(err.response?.data?.detail || 'Upload failed', 'error');
      setStep("");
    } finally {
      setLoading(false);
    }
  }, [file, addToast]);

  const handleAnalyze = useCallback(async (e) => {
    e.preventDefault();
    if (!resumeId || !jobDescription) return;

    setLoading(true);
    setStep("Extracting resume...");

    try {
      setTimeout(() => setStep("Analyzing job match..."), 800);
      setTimeout(() => setStep("Generating insights..."), 1600);

      const data = await resumeService.analyze(resumeId, jobDescription);
      setAnalysis(data);
      addToast('Analysis complete!', 'success');
      setStep("Analysis complete ✅");
    } catch (err) {
      addToast(err.response?.data?.detail || 'Analysis failed', 'error');
      setStep("");
    } finally {
      setLoading(false);
    }
  }, [resumeId, jobDescription, addToast]);

  const handleDownload = useCallback(async () => {
    try {
      setStep("Generating Report...");
      const data = await resumeService.getReport(resumeId);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${resumeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Report downloaded', 'success');
    } catch (err) {
      addToast('Failed to download report', 'error');
    } finally {
      setStep("");
    }
  }, [resumeId, addToast]);

  return (
    <MotionWrapper variant="page" className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto relative space-y-10">
      {/* PREMIUM LOADER */}
      {loading && (
        <div className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent)] animate-pulse" size={32} />
          </div>
          <p className="mt-8 text-xl text-white font-medium tracking-widest uppercase animate-pulse">{step}</p>
        </div>
      )}

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Candidate'} <Sparkles className="text-[var(--accent)]" />
          </h2>
          <p className="text-[var(--text-muted)] text-base max-w-lg">
            Upload your resume and the target job description to get AI-powered compatibility insights.
          </p>
        </div>
        {(analysis || resumeId) && (
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-all text-sm border border-[var(--border)]"
          >
            <RefreshCw size={16} /> <span>Start Fresh</span>
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDE - Inputs */}
        <div className="lg:col-span-5 space-y-8">
          <GlassCard glow className="p-8">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                <Plus className="text-[var(--primary)]" size={20} />
              </div>
              Step 1: Upload Resume
            </h3>

            <form onSubmit={handleUpload}>
              <div className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer bg-black/20 group ${resumeId ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-[var(--border)] hover:border-[var(--accent)]/50'}`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="resume-upload"
                  disabled={loading || !!resumeId}
                />
                <label htmlFor="resume-upload" className={`cursor-pointer flex flex-col items-center gap-5 ${resumeId ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                  {resumeId ? (
                     <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <CheckCircle size={32} className="text-emerald-500" />
                     </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)]/40 transition-all">
                       <UploadCloud size={32} className="text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <span className={`block text-lg font-semibold ${resumeId ? 'text-emerald-400' : 'text-gray-300'}`}>
                      {file ? file.name : "Choose PDF Document"}
                    </span>
                    {!file && <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Supports PDF up to 10MB</span>}
                  </div>
                </label>
              </div>

              {!resumeId && (
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full mt-6 py-4 premium-gradient-bg border border-[var(--primary)]/30 text-[var(--primary-foreground)] rounded-2xl transition-all disabled:opacity-50 font-bold text-lg hover:brightness-110 active:scale-[0.98]"
                >
                  Process Intelligence
                </button>
              )}
            </form>
          </GlassCard>

          <GlassCard className={`p-8 transition-all duration-700 ${resumeId ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4 blur-[2px] pointer-events-none'}`}>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <FileText className="text-purple-400" size={20} />
              </div>
              Step 2: Job Context
            </h3>

            <form onSubmit={handleAnalyze}>
              <div className="relative group">
                <textarea
                  className="w-full h-56 p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] focus:border-[var(--accent)]/40 outline-none resize-none text-gray-300 text-base transition-all placeholder:text-[var(--text-muted)] leading-relaxed"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={!resumeId || loading}
                />
                <div className="absolute bottom-4 right-4 text-[10px] text-[var(--text-muted)] font-mono tracking-widest uppercase">
                  {jobDescription.length} characters
                </div>
              </div>

              <button
                type="submit"
                disabled={!resumeId || jobDescription.length < 50 || loading}
                className="w-full mt-6 py-4 bg-white/[0.03] hover:bg-white/[0.07] border border-[var(--border)] text-white font-bold rounded-2xl transition-all shadow-xl disabled:opacity-20 hover-lift active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-3">
                  Begin AI Matching <Sparkles size={20} className="text-[var(--accent)]" />
                </span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* RIGHT SIDE - Results */}
        <div className="lg:col-span-7">
          {!analysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
               <GlassCard className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                 <Search size={48} className="text-[var(--border)] mb-6" />
                 <h4 className="text-xl font-bold text-white mb-2">Awaiting Analysis</h4>
                 <p className="text-[var(--text-muted)] text-sm">Upload your resume and JD to unlock insights.</p>
               </GlassCard>
               <GlassCard className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                 <Activity size={48} className="text-[var(--border)] mb-6" />
                 <h4 className="text-xl font-bold text-white mb-2">Live Tracking</h4>
                 <p className="text-[var(--text-muted)] text-sm">Your activity timeline will appear here.</p>
               </GlassCard>
            </div>
          ) : (
            <MotionWrapper variant="slideUp" delay={0.2} className="space-y-8">
              {/* Analytics Header Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <MetricCard title="Match Potential" value={analysis.ats_score} suffix="%" icon={Target} />
                 <MetricCard title="Skills Found" value={analysis.matched_keywords.length} icon={Zap} />
                 <MetricCard title="Improvement Areas" value={analysis.missing_keywords.length} icon={AlertTriangle} />
              </div>

              <MemoizedScoreCard score={analysis.ats_score} />
              
              <GlassCard className="p-10 space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[var(--border)] pb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Intelligence Report</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-2">Personalized insights based on your professional profile.</p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto text-sm flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-[var(--border)] transition-all text-gray-300 font-bold hover-lift"
                  >
                    <Download size={18} /> Export Intelligence
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                       Matched Proficiency
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matched_keywords.map((kw, i) => (
                        <Badge key={i} variant="success">{kw}</Badge>
                      ))}
                      {analysis.matched_keywords.length === 0 && (
                        <div className="text-[var(--text-muted)] text-sm italic py-2">No direct keyword matches found.</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-[0.3em] flex items-center gap-2">
                       Critical Skill Gaps
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missing_keywords.map((kw, i) => (
                        <Badge key={i} variant="danger">{kw}</Badge>
                      ))}
                      {analysis.missing_keywords.length === 0 && (
                        <div className="text-[var(--text-muted)] text-sm italic py-2">Perfect skill alignment detected!</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[32px] bg-gradient-to-br from-[var(--accent)]/5 to-transparent border border-[var(--accent)]/10 relative group overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[var(--accent)]/5 blur-3xl rounded-full"></div>
                  <h4 className="text-xs font-bold text-[var(--accent)] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                     Strategic Recommendations
                  </h4>
                  <p className="text-base text-gray-300 leading-relaxed font-serif italic relative z-10">
                    "{analysis.recommendations}"
                  </p>
                </div>
              </GlassCard>
            </MotionWrapper>
          )}
        </div>
      </div>
      
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </MotionWrapper>
  );
}
