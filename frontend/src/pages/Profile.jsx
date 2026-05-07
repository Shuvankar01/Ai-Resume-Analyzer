import { User, Mail, Briefcase, MapPin, Camera } from 'lucide-react';

export default function Profile() {
  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="w-full md:w-80 glass-panel p-8 rounded-[40px] border border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#00f3ff]/10 to-transparent"></div>
          <div className="relative mt-8">
            <div className="w-32 h-32 rounded-[40px] bg-white/5 border-2 border-white/10 flex items-center justify-center relative group-hover:border-[#00f3ff]/50 transition-all overflow-hidden shadow-2xl">
              <User size={64} className="text-gray-600" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[#00f3ff] flex items-center justify-center shadow-[0_0_15px_#00f3ff]">
              <div className="w-3 h-3 rounded-full bg-black"></div>
            </div>
          </div>
          
          <div className="mt-8 space-y-1">
            <h3 className="text-2xl font-bold text-white tracking-tight">Alex Rivera</h3>
            <p className="text-sm text-[#00f3ff] font-mono tracking-widest uppercase">Senior Recruiter</p>
          </div>

          <div className="w-full mt-10 space-y-4 pt-10 border-t border-white/5">
            <div className="flex items-center gap-4 text-gray-500 hover:text-gray-300 transition-colors">
              <Mail size={18} /> <span className="text-sm">alex.r@resumai.com</span>
            </div>
            <div className="flex items-center gap-4 text-gray-500 hover:text-gray-300 transition-colors">
              <MapPin size={18} /> <span className="text-sm">San Francisco, CA</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-10 w-full">
          <div className="glass-panel p-10 rounded-[40px] border border-white/5">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <Briefcase size={20} className="text-[#8b5cf6]" /> Professional Summary
            </h3>
            <p className="text-gray-400 leading-relaxed italic">
              "Dedicated recruiter with over 8 years of experience in technical talent acquisition. Currently leveraging AI-driven benchmarking to optimize high-volume hiring pipelines at ResumeAI."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="glass-panel p-8 rounded-[32px] border border-white/5">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Hiring Velocity</h4>
                <div className="text-4xl font-black text-white">4.2<span className="text-xs text-gray-600 ml-2">days / hire</span></div>
             </div>
             <div className="glass-panel p-8 rounded-[32px] border border-white/5">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Accuracy Rating</h4>
                <div className="text-4xl font-black text-[#00f3ff]">98.5%<span className="text-xs text-gray-600 ml-2">matching</span></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
