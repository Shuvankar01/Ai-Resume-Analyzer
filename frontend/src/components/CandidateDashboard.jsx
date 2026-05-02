import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertCircle, Download, LogOut, FileText } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function CandidateDashboard({ setUser }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post(`${API_URL}/resumes/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setResumeId(res.data.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    }
    setLoading(false);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeId || !jobDescription) return;

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('job_description', jobDescription);

    try {
      const res = await axios.post(`${API_URL}/resumes/${resumeId}/analyze`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // using Form(...) in FastAPI
        }
      });
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed');
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      const res = await axios.get(`${API_URL}/resumes/${resumeId}/report`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${resumeId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      setError('Failed to download report');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-10 pb-4 border-b border-[#00f3ff]/20">
        <h1 className="text-3xl font-bold neon-text flex items-center gap-2">
          <FileText className="text-[#00f3ff]" /> Candidate Dashboard
        </h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <LogOut size={18} /> Logout
        </button>
      </header>

      {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-500/30 flex items-center gap-2"><AlertCircle size={20}/> {error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Input */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl neon-border">
            <h2 className="text-xl font-semibold mb-4 text-white">1. Upload Resume</h2>
            <form onSubmit={handleUpload}>
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-[#00f3ff]/50 transition cursor-pointer bg-black/20">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  className="hidden" 
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-3">
                  <UploadCloud size={40} className="text-[#00f3ff]/70" />
                  <span className="text-gray-300">
                    {file ? file.name : "Click or drag PDF here"}
                  </span>
                </label>
              </div>
              <button 
                type="submit" 
                disabled={!file || loading}
                className="w-full mt-4 py-2 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 border border-[#00f3ff]/30 text-[#00f3ff] rounded-lg transition disabled:opacity-50"
              >
                Upload Document
              </button>
            </form>
            {resumeId && <p className="mt-3 text-sm text-green-400 flex items-center gap-1"><CheckCircle size={14}/> Resume uploaded successfully</p>}
          </div>

          <div className={`glass-panel p-6 rounded-2xl border ${resumeId ? 'border-[#00f3ff]/30' : 'border-gray-800 opacity-50'}`}>
            <h2 className="text-xl font-semibold mb-4 text-white">2. Enter Job Description</h2>
            <form onSubmit={handleAnalyze}>
              <textarea 
                className="w-full h-40 p-4 rounded-xl bg-black/40 border border-gray-600 focus:border-[#00f3ff] outline-none resize-none"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={!resumeId}
              />
              <button 
                type="submit" 
                disabled={!resumeId || !jobDescription || loading}
                className="w-full mt-4 py-3 bg-gradient-to-r from-[#00f3ff]/30 to-blue-600/30 hover:from-[#00f3ff]/40 hover:to-blue-600/40 border border-[#00f3ff]/50 text-white font-medium rounded-lg transition shadow-[0_0_15px_rgba(0,243,255,0.15)] disabled:opacity-50"
              >
                {loading ? 'Analyzing with AI...' : 'Analyze Match'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent opacity-50"></div>
          
          <h2 className="text-2xl font-bold mb-6 flex justify-between items-center">
            Analysis Results
            {analysis && (
              <button onClick={handleDownload} className="text-sm flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md border border-white/10 transition text-gray-300">
                <Download size={16} /> Export PDF
              </button>
            )}
          </h2>

          {!analysis ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p>Upload a resume and provide a job<br/>description to see your ATS score</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" className="stroke-gray-800" strokeWidth="12" fill="none" />
                    <circle 
                      cx="80" cy="80" r="70" 
                      className="stroke-[#00f3ff] drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]" 
                      strokeWidth="12" fill="none" 
                      strokeDasharray="440" 
                      strokeDashoffset={440 - (440 * analysis.ats_score) / 100} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold neon-text">{analysis.ats_score}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">ATS Score</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-green-400 mb-2 border-b border-green-400/20 pb-1">Matched Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.matched_keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-300 rounded-full text-sm">
                      {kw}
                    </span>
                  ))}
                  {analysis.matched_keywords.length === 0 && <span className="text-gray-500 text-sm">No significant matches found.</span>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-red-400 mb-2 border-b border-red-400/20 pb-1">Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-300 rounded-full text-sm">
                      {kw}
                    </span>
                  ))}
                  {analysis.missing_keywords.length === 0 && <span className="text-gray-500 text-sm">All required skills present!</span>}
                </div>
              </div>

              <div className="bg-[#00f3ff]/5 border border-[#00f3ff]/20 p-4 rounded-xl">
                <h3 className="text-md font-semibold text-[#00f3ff] mb-2">Recommendations</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {analysis.recommendations}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
