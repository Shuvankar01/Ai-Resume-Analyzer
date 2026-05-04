import { useState, useCallback, memo } from 'react';
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Download,
  FileText,
  Search,
  Plus,
  RefreshCw,
  Sparkles
} from 'lucide-react';

import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import ATSScoreCard from '../components/ui/ATSScoreCard';
import Chip from '../components/ui/Chip';
import Skeleton from '../components/ui/Skeleton';
import { resumeService } from '../services/resumeService';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

const MemoizedScoreCard = memo(ATSScoreCard);

export default function CandidateDashboard({ setUser }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toasts, addToast, removeToast } = useToast();

  const role = localStorage.getItem('role');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  }, [setUser]);

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
    <div className="flex min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="flex-1 ml-20 md:ml-64 transition-all duration-300">
        <Navbar user={{ full_name: 'Candidate', role: 'candidate' }} />
        
        <div className="p-4 md:p-10 max-w-7xl mx-auto relative">
          {/* PREMIUM LOADER */}
          {loading && (
            <div className="fixed inset-0 bg-[#0a0a0f]/80 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-[#00f3ff]/20 border-t-[#00f3ff] rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00f3ff] animate-pulse" size={24} />
              </div>
              <p className="mt-8 text-xl text-white font-medium tracking-widest uppercase animate-pulse">{step}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                Career Intelligence <Sparkles className="text-[#00f3ff]" />
              </h2>
              <p className="text-gray-500 text-base max-w-lg">
                Upload your resume and the target job description to get AI-powered compatibility insights.
              </p>
            </div>
            {(analysis || resumeId) && (
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-sm border border-white/5 glass-panel-hover"
              >
                <RefreshCw size={16} /> <span>Start Fresh</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT SIDE - Inputs */}
            <div className="lg:col-span-5 space-y-8">
              <div className="glass-panel p-8 rounded-3xl premium-glow">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00f3ff]/10 flex items-center justify-center border border-[#00f3ff]/20">
                    <Plus className="text-[#00f3ff]" size={20} />
                  </div>
                  Step 1: Upload Resume
                </h3>

                <form onSubmit={handleUpload}>
                  <div className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer bg-black/20 group ${resumeId ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-[#00f3ff]/50'}`}>
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
                         <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            <CheckCircle size={32} className="text-green-500" />
                         </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#00f3ff]/40 transition-all">
                           <UploadCloud size={32} className="text-gray-400 group-hover:text-[#00f3ff]" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <span className={`block text-lg font-semibold ${resumeId ? 'text-green-400' : 'text-gray-300'}`}>
                          {file ? file.name : "Choose PDF Document"}
                        </span>
                        {!file && <span className="text-xs text-gray-500 uppercase tracking-widest">Supports PDF up to 10MB</span>}
                      </div>
                    </label>
                  </div>

                  {!resumeId && (
                    <button
                      type="submit"
                      disabled={!file || loading}
                      className="w-full mt-6 py-4 premium-gradient text-white rounded-2xl transition-all disabled:opacity-50 font-bold text-lg shadow-[0_10px_30px_rgba(0,243,255,0.15)] active:scale-[0.98]"
                    >
                      Process Intelligence
                    </button>
                  )}
                </form>
              </div>

              <div className={`glass-panel p-8 rounded-3xl transition-all duration-700 ${resumeId ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4 blur-[2px] pointer-events-none'}`}>
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <FileText className="text-purple-400" size={20} />
                  </div>
                  Step 2: Job Context
                </h3>

                <form onSubmit={handleAnalyze}>
                  <div className="relative group">
                    <textarea
                      className="w-full h-56 p-5 rounded-2xl bg-black/40 border border-white/10 focus:border-[#00f3ff]/40 outline-none resize-none text-gray-300 text-base transition-all placeholder:text-gray-600 leading-relaxed"
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      disabled={!resumeId || loading}
                    />
                    <div className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono tracking-widest uppercase">
                      {jobDescription.length} characters
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!resumeId || jobDescription.length < 50 || loading}
                    className="w-full mt-6 py-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-white font-bold rounded-2xl transition-all shadow-xl disabled:opacity-20 group active:scale-[0.98]"
                  >
                    <span className="flex items-center justify-center gap-3">
                      Begin AI Matching <Sparkles size={20} className="text-[#00f3ff]" />
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT SIDE - Results */}
            <div className="lg:col-span-7">
              {!analysis ? (
                <div className="glass-panel p-20 rounded-[40px] flex flex-col items-center justify-center h-full text-center border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f3ff]/20 to-transparent"></div>
                  <div className="w-32 h-32 rounded-full bg-white/[0.02] flex items-center justify-center mb-10 relative group">
                    <div className="absolute inset-0 rounded-full bg-[#00f3ff]/5 blur-3xl animate-pulse"></div>
                    <Search size={48} className="text-gray-700 relative z-10 group-hover:text-[#00f3ff]/40 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Awaiting Analysis</h3>
                  <p className="text-gray-500 max-w-md text-base leading-relaxed">
                    Once you provide your resume and the target job description, our AI will generate a comprehensive ATS compatibility report.
                  </p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                  <MemoizedScoreCard score={analysis.ats_score} />
                  
                  <div className="glass-panel p-10 rounded-[40px] border border-white/5 space-y-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/5 pb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Intelligence Report</h3>
                        <p className="text-sm text-gray-500 mt-2">Personalized insights based on your professional profile.</p>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto text-sm flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-white/10 transition-all text-gray-300 font-bold active:scale-95"
                      >
                        <Download size={18} /> Export Intelligence
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="text-xs font-bold text-green-500 uppercase tracking-[0.3em] flex items-center gap-2">
                           Matched Proficiency
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {analysis.matched_keywords.map((kw, i) => (
                            <Chip key={i} label={kw} variant="success" />
                          ))}
                          {analysis.matched_keywords.length === 0 && (
                            <div className="text-gray-600 text-sm italic py-2">No direct keyword matches found.</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-[0.3em] flex items-center gap-2">
                           Critical Skill Gaps
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {analysis.missing_keywords.map((kw, i) => (
                            <Chip key={i} label={kw} variant="error" />
                          ))}
                          {analysis.missing_keywords.length === 0 && (
                            <div className="text-gray-600 text-sm italic py-2">Perfect skill alignment detected!</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#00f3ff]/5 to-transparent border border-[#00f3ff]/10 relative group overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#00f3ff]/5 blur-3xl rounded-full"></div>
                      <h4 className="text-xs font-bold text-[#00f3ff] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                         Strategic Recommendations
                      </h4>
                      <p className="text-base text-gray-300 leading-relaxed font-serif italic relative z-10">
                        "{analysis.recommendations}"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}