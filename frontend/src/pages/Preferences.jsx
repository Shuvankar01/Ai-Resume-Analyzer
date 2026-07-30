import { useState } from 'react';
import { Settings, Bell, Shield, Palette, BrainCircuit, Activity } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

function ToggleItem({ label, description, defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:bg-white/[0.02] transition-colors">
      <div className="space-y-1 pr-4">
        <div className="text-sm font-bold text-white tracking-tight">{label}</div>
        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{description}</div>
      </div>
      <button 
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle ${label}`}
        onClick={() => setChecked(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[#0a0a0f] ${checked ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/30' : 'bg-white/10 border border-white/10'}`}
      >
        <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-transform ${checked ? 'right-1 bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]' : 'left-1 bg-gray-400'}`}></div>
      </button>
    </div>
  );
}

function SettingsSection({ icon, title, desc, items }) {
  const IconComponent = icon;
  return (
    <div className="glass-panel p-6 lg:p-8 rounded-[32px] border border-white/5 flex flex-col h-full hover:border-white/10 transition-colors">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shrink-0">
        <IconComponent size={24} className="text-[var(--text-muted)]" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8">{desc}</p>
      <div className="space-y-3 mt-auto">
        {items.map((item, i) => (
          <ToggleItem key={i} label={item.label} description={item.desc} defaultChecked={item.checked} />
        ))}
      </div>
    </div>
  );
}

export default function Preferences() {
  const configSections = [
    {
      icon: Bell, title: 'Notifications', desc: 'Manage AI analysis alerts and system updates.',
      items: [
        { label: 'Email Notifications', desc: 'Core platform alerts', checked: true },
        { label: 'Resume Complete', desc: 'Analysis completion alerts', checked: true },
        { label: 'Weekly Report', desc: 'Platform activity summary', checked: false },
        { label: 'Interview Reminder', desc: 'AI prep notifications', checked: true },
        { label: 'System Updates', desc: 'New feature releases', checked: false },
      ]
    },
    {
      icon: Shield, title: 'Security', desc: 'Configure multi-factor authentication and session keys.',
      items: [
        { label: 'Two-Factor Auth', desc: 'Require code on login', checked: false },
        { label: 'Session Timeout', desc: 'Auto-logout after 30m', checked: true },
        { label: 'Login History', desc: 'Track device access', checked: true },
        { label: 'Active Devices', desc: 'Monitor concurrent sessions', checked: true },
      ]
    },
    {
      icon: Palette, title: 'Appearance', desc: 'Customize your obsidian dashboard theme and effects.',
      items: [
        { label: 'Dark Mode', desc: 'Force dark theme', checked: true },
        { label: 'System Theme', desc: 'Match OS settings', checked: false },
        { label: 'Compact Mode', desc: 'Reduce padding', checked: false },
        { label: 'Reduced Motion', desc: 'Disable animations', checked: false },
        { label: 'Dashboard Density', desc: 'Show more metrics', checked: true },
      ]
    },
    {
      icon: BrainCircuit, title: 'AI Preferences', desc: 'Tune the intelligence engine analysis depth.',
      items: [
        { label: 'Detailed Summary', desc: 'Expand executive briefs', checked: true },
        { label: 'Deep Resume Parsing', desc: 'Aggressive extraction', checked: true },
        { label: 'Auto ATS Analysis', desc: 'Scan on upload', checked: true },
        { label: 'AI Recommendations', desc: 'Proactive suggestions', checked: true },
        { label: 'Smart Resume Scan', desc: 'Contextual mapping', checked: true },
      ]
    }
  ];

  const systemConfigItems = [
    { label: 'Performance Mode', desc: 'Optimize render cycles', checked: true },
    { label: 'Cache Optimization', desc: 'Store local assets', checked: true },
    { label: 'Real-time AI Sync', desc: 'WebSocket connections', checked: false },
    { label: 'GPU Acceleration', desc: 'Hardware rendering', checked: true },
    { label: 'Analytics Collection', desc: 'Anonymous usage data', checked: false },
  ];

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
          Preferences <Settings className="text-[var(--primary)]" />
        </h2>
        <p className="text-[var(--text-muted)]">Tailor the AI Intelligence Platform to your workflow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {configSections.map((s, i) => (
          <SettingsSection key={i} {...s} />
        ))}
      </div>
      
      <GlassCard className="p-6 lg:p-10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <Activity className="text-emerald-400" size={24} /> System Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemConfigItems.map((item, i) => (
            <ToggleItem key={i} label={item.label} description={item.desc} defaultChecked={item.checked} />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
