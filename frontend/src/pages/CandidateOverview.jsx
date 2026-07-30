import { useState, useCallback, memo, useEffect } from 'react';
import {
  UploadCloud, File as FileIcon, Search, Plus, RefreshCw,
  Sparkles, Activity, FileText, GitCompare, Target, TrendingUp, Brain, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ATSScoreCard from '../components/ui/ATSScoreCard';
import GlassCard from '../components/ui/GlassCard';
import MotionWrapper from '../components/ui/MotionWrapper';
import AnalysisTimeline from '../components/ui/AnalysisTimeline';
import ActivityTimeline from '../components/ui/ActivityTimeline';
import ImprovementRoadmap from '../components/ui/ImprovementRoadmap';
import ErrorState from '../components/ui/ErrorState';
import ReportCard from '../components/ui/ReportCard';
import SkillRadar from '../components/ui/SkillRadar';
import CareerInsight from '../components/ui/CareerInsight';
import { resumeService } from '../services/resumeService';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import ResumePreviewDashboard from '../components/ui/preview/ResumePreviewDashboard';

const MemoizedScoreCard = memo(ATSScoreCard);
const MemoizedSkillRadar = memo(SkillRadar);
const MemoizedCareerInsight = memo(CareerInsight);

const STATUS = {
  EMPTY: 'EMPTY',
  SELECTED: 'SELECTED',
  UPLOADING: 'UPLOADING',
  PREVIEW_ACTIVE: 'PREVIEW_ACTIVE',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

const TABS = [
  { id: 'health', label: 'Resume Health', icon: Target },
  { id: 'skills', label: 'Skill Radar', icon: TrendingUp },
  { id: 'career', label: 'Career AI', icon: Brain },
];

// ─── AI Health Metrics Bar ─────────────────────────────────────────────────────
function HealthMetrics({ analysis }) {
  if (!analysis) return null;
  const score = analysis.ats_score ?? 0;
  const matchedPct = analysis.matched_keywords?.length
    ? Math.min(100, Math.round((analysis.matched_keywords.length / (analysis.matched_keywords.length + (analysis.missing_keywords?.length || 0))) * 100))
    : 0;
  const qualityScore = Math.min(100, Math.round((score * 0.6) + (analysis.strengths?.length || 0) * 8));

  const metrics = [
    { label: 'ATS Score', value: score, color: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e', suffix: '%' },
    { label: 'Keyword Match', value: matchedPct, color: '#3b82f6', suffix: '%' },
    { label: 'Resume Quality', value: qualityScore, color: '#8b5cf6', suffix: '%' },
    { label: 'Strengths Found', value: Math.min(analysis.strengths?.length || 0, 5), color: '#00f3ff', suffix: `/${Math.min((analysis.strengths?.length || 0) + 2, 7)}` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="card-glass rounded-2xl p-4 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 50% 0%, ${m.color}, transparent 70%)` }} />
          <p className="text-2xl font-black relative z-10" style={{ color: m.color }}>
            {m.value}{m.suffix}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1 relative z-10">{m.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function CandidateOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [status, setStatus] = useState(STATUS.EMPTY);
  const [jobStatus, setJobStatus] = useState('pending');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('health');
  const [history, setHistory] = useState([]);

  const { toasts, addToast, removeToast } = useToast();

  const loadHistory = useCallback(async () => {
    try {
      const data = await resumeService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, status]);

  const loadPastAnalysis = async (pastResumeId) => {
    try {
      setStatus(STATUS.PROCESSING);
      setJobStatus('pending');
      const analysisData = await resumeService.getAnalysis(pastResumeId);
      setResumeId(pastResumeId);
      setAnalysis(analysisData);
      setStatus(STATUS.COMPLETED);
      setJobStatus('done');
      addToast('Historical analysis loaded!', 'success');
    } catch (err) {
      setStatus(STATUS.FAILED);
      setErrorMsg('Failed to retrieve past analysis.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription('');
    setResumeId(null);
    setAnalysis(null);
    setPreviewData(null);
    setStatus(STATUS.EMPTY);
    setJobStatus('pending');
    setErrorMsg('');
    setActiveTab('health');
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    if (status === STATUS.EMPTY || status === STATUS.SELECTED) setIsDragActive(true);
  }, [status]);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const processUpload = async (uploadFile) => {
    try {
      setStatus(STATUS.UPLOADING);
      setIsPreviewLoading(true);
      const uploadData = await resumeService.upload(uploadFile);
      const newResumeId = uploadData.id;
      setResumeId(newResumeId);
      
      const preview = await resumeService.getPreview(newResumeId);
      setPreviewData(preview);
      setStatus(STATUS.PREVIEW_ACTIVE);
    } catch (err) {
      setStatus(STATUS.FAILED);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to upload or generate preview.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files?.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        processUpload(droppedFile);
      } else {
        addToast('Only PDF files are supported', 'error');
      }
    }
  }, [addToast]);

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processUpload(selectedFile);
    }
  };

  const handleWorkflow = async (e) => {
    e?.preventDefault();
    if (!resumeId || !jobDescription) {
      addToast('Please provide both a resume and job description.', 'error');
      return;
    }
    try {
      setStatus(STATUS.PROCESSING);
      setJobStatus('pending');
      const analysisData = await resumeService.analyze(resumeId, jobDescription, (statusData) => {
        setJobStatus(statusData.status);
      });
      setAnalysis(analysisData);
      setStatus(STATUS.COMPLETED);
      addToast('Intelligence analysis complete!', 'success');
    } catch (err) {
      setJobStatus('failed');
      setStatus(STATUS.FAILED);
      setErrorMsg(err.response?.data?.detail || err.message || 'The intelligence extraction encountered an error.');
    }
  };

  const handleDownload = useCallback(async () => {
    try {
      addToast('Preparing report for download...', 'info');
      const data = await resumeService.getReport(resumeId);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${resumeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      addToast('Failed to download report', 'error');
    }
  }, [resumeId, addToast]);

  const handleCompare = () => {
    navigate('/candidate/compare', { state: { analysis, resumeId } });
  };

  return (
    <MotionWrapper variant="page" className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto relative space-y-10">
      <AnalysisTimeline isProcessing={status === STATUS.PROCESSING} jobStatus={jobStatus} errorMsg={errorMsg} />

      {/* Hero */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Candidate'} <Sparkles className="text-[var(--accent)]" />
          </h2>
          <p className="text-[var(--text-muted)] text-base max-w-lg">
            Upload your resume and target job description for a comprehensive AI career intelligence report.
          </p>
        </div>
        {(status === STATUS.COMPLETED || status === STATUS.FAILED) && (
          <div className="flex items-center gap-3">
            {status === STATUS.COMPLETED && (
              <button
                onClick={handleCompare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] transition-all text-sm border border-[var(--primary)]/20 hover-lift font-bold"
              >
                <GitCompare size={16} /> Compare Resume
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-white/10 text-white transition-all text-sm border border-[var(--border)] hover-lift"
            >
              <RefreshCw size={16} /> <span>New Analysis</span>
            </button>
          </div>
        )}
      </div>

      {status === STATUS.FAILED ? (
        <ErrorState title="Analysis Failed" message={errorMsg} onRetry={handleReset} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT — Input Form */}
          <div className="lg:col-span-5 space-y-8">
            <GlassCard glow className="p-8">
              <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 shadow-inner">
                  <Plus className="text-[var(--primary)]" size={20} />
                </div>
                Provide Context
              </h3>

              <form onSubmit={handleWorkflow} className="space-y-8">
                {/* Drop Zone */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">1. Resume Document</label>
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`border-2 border-dashed rounded-[32px] p-8 text-center transition-all bg-[var(--surface-elevated)] relative overflow-hidden group
                      ${isDragActive ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:border-[var(--primary)]/40'}
                      ${status === STATUS.UPLOADING || status === STATUS.COMPLETED ? 'opacity-50 pointer-events-none' : ''}
                    `}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resume-upload"
                      disabled={status !== STATUS.EMPTY && status !== STATUS.SELECTED && status !== STATUS.PREVIEW_ACTIVE}
                    />
                    {file ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between bg-[var(--surface-elevated)] p-4 rounded-2xl border border-[var(--border)] relative overflow-hidden group">
                          {status === STATUS.UPLOADING && <div className="absolute inset-0 bg-[var(--primary)]/5 animate-pulse" />}
                          <div className="flex items-center gap-4 text-left relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                              <FileIcon size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white max-w-[200px] truncate">{file.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 relative z-10">
                            {(status === STATUS.PREVIEW_ACTIVE || status === STATUS.SELECTED || status === STATUS.FAILED) && (
                              <>
                                <label htmlFor="resume-upload" aria-label="Replace File" className="px-3 py-1.5 text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 rounded-lg cursor-pointer transition-colors">
                                  Replace
                                </label>
                                <button type="button" onClick={handleReset} aria-label="Remove File" className="px-3 py-1.5 text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 rounded-lg cursor-pointer transition-colors">
                                  Remove
                                </button>
                              </>
                            )}
                            {status === STATUS.UPLOADING && (
                              <div className="px-3 py-1.5 text-xs font-bold text-blue-400 bg-blue-400/10 rounded-lg animate-pulse">Uploading...</div>
                            )}
                          </div>
                        </div>
                        {status === STATUS.PREVIEW_ACTIVE && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-3 py-2 rounded-xl border border-emerald-400/20 justify-center">
                            <CheckCircle2 size={14} /> Upload & Extraction Complete
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-5 py-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-300 ${isDragActive ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)] shadow-[0_0_30px_rgba(59,130,246,0.3)] scale-110' : 'bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text-muted)] group-hover:text-white group-hover:scale-105 group-hover:border-white/20'}`}>
                          <UploadCloud size={32} />
                        </div>
                        <div className="space-y-2">
                          <span className="block text-lg font-bold text-white transition-colors">Upload your resume to begin AI analysis.</span>
                          <span className="block text-sm text-[var(--text-muted)] font-medium">Drag & Drop or click to browse local PDF files</span>
                        </div>
                        <div className="px-5 py-2 mt-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300 group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] group-hover:border-[var(--primary)]/30 transition-all">
                          Select File
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">2. Target Job Description</label>
                    <AnimatePresence>
                      {jobDescription.trim().length > 0 && jobDescription.trim().length < 50 && (
                        <motion.span 
                          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                          className="text-xs font-bold text-red-400"
                        >
                          ⚠ Please enter at least 50 meaningful characters.
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative group">
                    <textarea
                      className={`w-full h-48 p-5 rounded-[24px] bg-[var(--surface-elevated)] border outline-none resize-none text-white text-sm transition-all placeholder:text-[var(--text-muted)] leading-relaxed custom-scrollbar
                        ${jobDescription.trim().length > 0 && jobDescription.trim().length < 50 ? 'border-red-500/50 focus:border-red-500 focus:bg-red-500/5' : 'border-[var(--border)] focus:border-[var(--primary)]/50 focus:bg-white/5'}
                      `}
                      placeholder="Paste the full job description here to enable the neural matching engine..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      disabled={status !== STATUS.EMPTY && status !== STATUS.SELECTED && status !== STATUS.PREVIEW_ACTIVE}
                      aria-label="Target Job Description"
                    />
                    <div className={`absolute bottom-4 right-4 flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase bg-[var(--surface-elevated)] px-3 py-1.5 rounded-md border shadow-sm transition-colors
                      ${jobDescription.trim().length >= 50 ? 'text-emerald-400 border-emerald-400/30' : 'text-[var(--text-muted)] border-[var(--border)]'}
                    `}>
                      {jobDescription.trim().length >= 50 && <CheckCircle2 size={12} className="text-emerald-400" />}
                      <span>{jobDescription.trim().length} / 50 characters</span>
                    </div>
                  </div>
                </div>

                {status === STATUS.EMPTY || status === STATUS.SELECTED || status === STATUS.PREVIEW_ACTIVE ? (
                  <button
                    type="submit"
                    disabled={!resumeId || jobDescription.trim().length < 50}
                    className="w-full py-4 premium-gradient-bg border border-[var(--primary)]/30 text-white rounded-2xl transition-all disabled:opacity-20 disabled:grayscale font-bold text-base hover-lift shadow-[0_10px_30px_rgba(0,243,255,0.15)] flex items-center justify-center gap-2"
                    aria-label="Run Intelligence Sync"
                  >
                    Run Intelligence Sync <Sparkles size={18} className="text-[var(--accent)]" />
                  </button>
                ) : (
                  <div className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 rounded-2xl font-bold text-base flex items-center justify-center gap-3 cursor-not-allowed">
                    {status === STATUS.UPLOADING && 'Generating Preview...'}
                    {status === STATUS.PROCESSING && 'Processing Insights...'}
                    {status === STATUS.COMPLETED && 'Analysis Active'}
                  </div>
                )}
              </form>
            </GlassCard>
            {status === STATUS.COMPLETED && (
              <div className="mt-8">
                <ImprovementRoadmap analysis={analysis} />
              </div>
            )}
          </div>

          {/* RIGHT — Results Panel */}
          <div className="lg:col-span-7">
            {status === STATUS.UPLOADING || isPreviewLoading ? (
              <div className="space-y-6 animate-pulse opacity-70">
                {/* Header Skeleton */}
                <div className="card-glass rounded-2xl p-6 border-l-4 border-[var(--primary)]/30 flex gap-6 items-center">
                   <div className="w-16 h-16 rounded-full bg-white/10" />
                   <div className="flex-1 space-y-3">
                     <div className="h-6 bg-white/20 rounded w-1/3" />
                     <div className="h-4 bg-white/10 rounded w-1/4" />
                   </div>
                </div>
                {/* Grid Skeletons */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="card-glass rounded-2xl p-6 h-32 bg-white/5" />
                    <div className="card-glass rounded-2xl p-6 h-64 bg-white/5" />
                  </div>
                  <div className="space-y-6">
                    <div className="card-glass rounded-2xl p-6 h-40 bg-white/5" />
                    <div className="card-glass rounded-2xl p-6 h-56 bg-white/5" />
                  </div>
                </div>
              </div>
            ) : status === STATUS.PREVIEW_ACTIVE && previewData ? (
              <ResumePreviewDashboard 
                previewData={previewData} 
                onAction={(action) => {
                  if (action === 'analyze') {
                    if (jobDescription.length >= 50) {
                      handleWorkflow();
                    } else {
                      addToast('Please provide a Job Description (at least 50 chars) first.', 'error');
                    }
                  } else {
                    addToast(`Action '${action}' is not fully implemented yet.`, 'info');
                  }
                }} 
              />
            ) : status !== STATUS.COMPLETED ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Activity Timeline */}
                  <ActivityTimeline type="candidate" />

                  {/* Recent Analysis History */}
                  <div className="card-glass rounded-3xl p-6 border border-[var(--border)] relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <FileText size={18} className="text-[var(--primary)]" />
                        Recent Analyses
                      </h4>
                      
                      {history.length === 0 ? (
                        <div className="text-center py-12 text-[var(--text-muted)] text-xs font-bold">
                          No previous analysis sessions.
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {history.map((h) => (
                            <div key={h.id} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{h.filename}</p>
                                <p className="text-[10px] text-[var(--text-muted)] font-medium">
                                  {new Date(h.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => loadPastAnalysis(h.id)}
                                className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-black uppercase transition-colors shrink-0"
                              >
                                Load ({h.ats_score}%)
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <MotionWrapper variant="slideUp" delay={0.1} className="space-y-6">
                {/* AI Health Metrics */}
                <HealthMetrics analysis={analysis} />

                {/* Intelligence Tabs */}
                <div>
                  {/* Tab Bar */}
                  <div className="flex gap-1 p-1.5 rounded-2xl bg-white/[0.04] border border-[var(--border)] mb-6">
                    {TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                            isActive
                              ? 'bg-[var(--primary)] text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)]'
                              : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon size={15} />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeTab === 'health' && (
                        <div className="space-y-6">
                          <MemoizedScoreCard analysis={analysis} />
                          <ReportCard onDownload={handleDownload} />
                        </div>
                      )}
                      {activeTab === 'skills' && <MemoizedSkillRadar analysis={analysis} />}
                      {activeTab === 'career' && <MemoizedCareerInsight analysis={analysis} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </MotionWrapper>
            )}
          </div>
        </div>
      )}

      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </MotionWrapper>
  );
}
