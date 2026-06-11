import { Download, FileText, Share2 } from 'lucide-react';
import GlassCard from './GlassCard';

export default function ReportCard({ onDownload, onShare }) {
  return (
    <GlassCard className="p-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shadow-inner">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Intelligence Report</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">Exportable PDF containing full metric breakdown.</p>
          </div>
        </div>

        <div className="flex w-full sm:w-auto gap-3">
          {onShare && (
            <button onClick={onShare} className="flex-1 sm:flex-none p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center group">
              <Share2 size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
          <button onClick={onDownload} className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-white text-black font-bold border border-transparent hover:bg-gray-200 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
