import { Settings, Bell, Shield, Palette } from 'lucide-react';

export default function Preferences() {
  const sections = [
    { icon: Bell, title: 'Notifications', desc: 'Manage AI analysis alerts and system updates.' },
    { icon: Shield, title: 'Security', desc: 'Configure multi-factor authentication and session keys.' },
    { icon: Palette, title: 'Appearance', desc: 'Customize your obsidian dashboard theme and effects.' },
  ];

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10">
      <div className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
          Preferences <Settings className="text-[#8b5cf6]" />
        </h2>
        <p className="text-gray-500">Tailor the AI Intelligence Platform to your workflow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((s, i) => (
          <div key={i} className="glass-panel p-8 rounded-[32px] border border-white/5 hover:border-[#00f3ff]/20 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <s.icon size={24} className="text-gray-400 group-hover:text-[#00f3ff]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="glass-panel p-10 rounded-[40px] border border-white/5">
        <h3 className="text-xl font-bold text-white mb-6">System Configuration</h3>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="space-y-1">
                <div className="text-sm font-bold text-gray-300 tracking-tight">Configuration Module {i}</div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest">Active State Optimization</div>
              </div>
              <div className="w-12 h-6 rounded-full bg-[#00f3ff]/20 relative">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
