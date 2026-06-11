import { useState, useCallback, memo } from 'react';
import { UploadCloud, File as FileIcon, Search, Plus, RefreshCw, Sparkles, Activity, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ATSScoreCard from '../components/ui/ATSScoreCard';
import GlassCard from '../components/ui/GlassCard';
import MotionWrapper from '../components/ui/MotionWrapper';
import AIProcessing from '../components/ui/AIProcessing';
import ErrorState from '../components/ui/ErrorState';
import ReportCard from '../components/ui/ReportCard';
import { resumeService } from '../services/resumeService';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

const MemoizedScoreCard = memo(ATSScoreCard);

const STATUS = {
  EMPTY: 'EMPTY',
  SELECTED: 'SELECTED',
  UPLOADING: 'UPLOADING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export default function CandidateOverview() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState(STATUS.EMPTY);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  
  const { toasts, addToast, removeToast } = useToast();

  const handleReset = () => {
    setFile(null);
    setJobDescription('');
    setResumeId(null);
    setAnalysis(null);
    setStatus(STATUS.EMPTY);
    setErrorMsg('');
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    if (status === STATUS.EMPTY || status === STATUS.SELECTED) {
      setIsDragActive(true);
    }
  }, [status]);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (status !== STATUS.EMPTY && status !== STATUS.SELECTED) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setStatus(STATUS.SELECTED);
      } else {
        addToast('Only PDF files are supported', 'error');
      }
    }
  }, [status, addToast]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus(STATUS.SELECTED);
    }
  };

  const handleWorkflow = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription) {
       addToast("Please provide both a resume and job description.", "error");
       return;
    }

    try {
      // Step 1: Upload
      setStatus(STATUS.UPLOADING);
      const uploadData = await resumeService.upload(file);
      const newResumeId = uploadData.id;
      setResumeId(newResumeId);

      // Step 2: Analyze
      setStatus(STATUS.PROCESSING);
      const analysisData = await resumeService.analyze(newResumeId, jobDescription);
      setAnalysis(analysisData);
      setStatus(STATUS.COMPLETED);
      addToast('Analysis completed successfully!', 'success');
      
    } catch (err) {
      setStatus(STATUS.FAILED);
      setErrorMsg(err.response?.data?.detail || 'The intelligence extraction encountered an error.');
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
    } catch (err) {
      addToast('Failed to download report', 'error');
    }
  }, [resumeId, addToast]);

  return (
    <MotionWrapper variant="page" className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto relative space-y-10">
      
      <AIProcessing isProcessing={status === STATUS.PROCESSING} />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Candidate'} <Sparkles className="text-[var(--accent)]" />
          </h2>
          <p className="text-[var(--text-muted)] text-base max-w-lg">
            Upload your resume and the target job description to run a comprehensive ATS intelligence match.
          </p>
        </div>
        {(status === STATUS.COMPLETED || status === STATUS.FAILED) && (
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-white/10 text-white transition-all text-sm border border-[var(--border)] hover-lift"
          >
            <RefreshCw size={16} /> <span>New Analysis</span>
          </button>
        )}
      </div>

      {status === STATUS.FAILED ? (
        <ErrorState 
          title="Analysis Failed" 
          message={errorMsg}
          onRetry={handleReset} 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDE - Inputs */}
          <div className="lg:col-span-5 space-y-8">
            <GlassCard glow className="p-8">
              <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 shadow-inner">
                  <Plus className="text-[var(--primary)]" size={20} />
                </div>
                Provide Context
              </h3>

              <form onSubmit={handleWorkflow} className="space-y-8">
                {/* Drag and Drop Zone */}
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
                      disabled={status !== STATUS.EMPTY && status !== STATUS.SELECTED}
                    />
                    
                    {file ? (
                      <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4 text-left">
                           <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                             <FileIcon size={24} />
                           </div>
                           <div>
                             <p className="text-sm font-bold text-white max-w-[200px] truncate">{file.name}</p>
                             <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF</p>
                           </div>
                        </div>
                        {status === STATUS.SELECTED && (
                          <label htmlFor="resume-upload" className="px-3 py-1.5 text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 rounded-lg cursor-pointer transition-colors">
                            Change
                          </label>
                        )}
                      </div>
                    ) : (
                      <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-4 py-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all ${isDragActive ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)] shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-[var(--border)] text-[var(--text-muted)] group-hover:text-white'}`}>
                          <UploadCloud size={32} />
                        </div>
                        <div className="space-y-1">
                          <span className="block text-base font-bold text-gray-200 group-hover:text-white transition-colors">
                            Drag & Drop PDF
                          </span>
                          <span className="text-xs text-[var(--text-muted)] font-medium">or click to browse local files</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Job Description Textarea */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">2. Target Job Description</label>
                  </div>
                  <div className="relative group">
                    <textarea
                      className="w-full h-48 p-5 rounded-[24px] bg-[var(--surface-elevated)] border border-[var(--border)] focus:border-[var(--primary)]/50 focus:bg-white/5 outline-none resize-none text-white text-sm transition-all placeholder:text-[var(--text-muted)] leading-relaxed custom-scrollbar"
                      placeholder="Paste the full job description here to enable the neural matching engine..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      disabled={status !== STATUS.EMPTY && status !== STATUS.SELECTED}
                    />
                    <div className="absolute bottom-4 right-4 text-[10px] text-[var(--text-muted)] font-mono tracking-widest uppercase bg-[var(--surface-elevated)] px-2 py-1 rounded-md border border-[var(--border)]">
                      {jobDescription.length} char
                    </div>
                  </div>
                </div>

                {status === STATUS.EMPTY || status === STATUS.SELECTED ? (
                  <button
                    type="submit"
                    disabled={!file || jobDescription.length < 50}
                    className="w-full py-4 premium-gradient-bg border border-[var(--primary)]/30 text-white rounded-2xl transition-all disabled:opacity-20 font-bold text-base hover-lift shadow-[0_10px_30px_rgba(0,243,255,0.15)] flex items-center justify-center gap-2"
                  >
                    Run Intelligence Sync <Sparkles size={18} className="text-[var(--accent)]" />
                  </button>
                ) : (
                  <div className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 rounded-2xl font-bold text-base flex items-center justify-center gap-3 cursor-not-allowed">
                    {status === STATUS.UPLOADING && 'Uploading Document...'}
                    {status === STATUS.PROCESSING && 'Processing Insights...'}
                    {status === STATUS.COMPLETED && 'Analysis Active'}
                  </div>
                )}
              </form>
            </GlassCard>
          </div>

          {/* RIGHT SIDE - Results */}
          <div className="lg:col-span-7 h-full">
            {status !== STATUS.COMPLETED ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[400px]">
                 <GlassCard className="flex flex-col items-center justify-center p-12 text-center">
                   <Search size={48} className="text-[var(--border)] mb-6" />
                   <h4 className="text-xl font-bold text-white mb-2">Awaiting Analysis</h4>
                   <p className="text-[var(--text-muted)] text-sm">Provide context to unlock insights.</p>
                 </GlassCard>
                 <GlassCard className="flex flex-col items-center justify-center p-12 text-center">
                   <Activity size={48} className="text-[var(--border)] mb-6" />
                   <h4 className="text-xl font-bold text-white mb-2">Live Tracking</h4>
                   <p className="text-[var(--text-muted)] text-sm">Metrics will compile in real-time.</p>
                 </GlassCard>
              </div>
            ) : (
              <MotionWrapper variant="slideUp" delay={0.1} className="space-y-8">
                {/* Embedded Score Card with Analysis Details */}
                <MemoizedScoreCard analysis={analysis} />
                
                {/* Download/Share Report Card */}
                <ReportCard onDownload={handleDownload} />
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
