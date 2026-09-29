/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { Settings, Bell, Shield, Palette, BrainCircuit, Activity } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import useToast from '../hooks/useToast';
import Toast from '../components/ui/Toast';
import { activityService } from '../services/activityService';

function ToggleItem({ label, description, defaultChecked = false, storageKey }) {
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved !== null ? JSON.parse(saved) : defaultChecked;
    } catch { return defaultChecked; }
  });
  const { addToast, toasts, removeToast } = useToast();

  const handleToggle = () => {
    const newVal = !checked;
    setChecked(newVal);
    localStorage.setItem(storageKey, JSON.stringify(newVal));
    activityService.notifyPreferencesChanged({ key: storageKey, value: newVal });
    addToast(`${label} ${newVal ? 'enabled' : 'disabled'}`, 'success');
    
    // Immediate DOM Effects
    if (storageKey === 'pref_dark_mode') {
      if (newVal) document.body.classList.add('dark');
      else document.body.classList.remove('dark');
    }
    if (storageKey === 'pref_reduced_motion') {
      if (newVal) document.body.classList.add('reduce-motion');
      else document.body.classList.remove('reduce-motion');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-5 rounded-2xl bg-(--surface-elevated) border border-(--border) hover:bg-white/2 transition-colors">
        <div className="space-y-1 pr-4">
          <div className="text-sm font-bold text-white tracking-tight">{label}</div>
          <div className="text-[10px] text-(--text-muted) uppercase tracking-widest">{description}</div>
        </div>
        <button 
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={`Toggle ${label}`}
          onClick={handleToggle}
          className={`w-12 h-6 rounded-full relative transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-(--primary) focus:ring-offset-2 focus:ring-offset-[#0a0a0f] ${checked ? 'bg-(--primary)/20 border border-(--primary)/30' : 'bg-white/10 border border-white/10'}`}
        >
          <div className={`absolute top-0.75 w-4 h-4 rounded-full transition-transform ${checked ? 'right-1 bg-(--primary) shadow-[0_0_10px_var(--primary)]' : 'left-1 bg-gray-400'}`}></div>
        </button>
      </div>
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </>
  );
}

function SettingsSection({ icon, title, desc, items }) {
  const IconComponent = icon;
  return (
    <div className="glass-panel p-6 lg:p-8 rounded-4xl border border-white/5 flex flex-col h-full hover:border-white/10 transition-colors">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shrink-0">
        <IconComponent size={24} className="text-(--text-muted)" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-(--text-muted) leading-relaxed mb-8">{desc}</p>
      <div className="space-y-3 mt-auto">
        {items.map((item, i) => (
          <ToggleItem key={i} label={item.label} description={item.desc} defaultChecked={item.checked} storageKey={item.id} />
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
        { id: 'pref_email_notif', label: 'Email Notifications', desc: 'Core platform alerts', checked: true },
        { id: 'pref_resume_complete', label: 'Resume Complete', desc: 'Analysis completion alerts', checked: true },
        { id: 'pref_weekly_report', label: 'Weekly Report', desc: 'Platform activity summary', checked: false },
        { id: 'pref_interview_reminder', label: 'Interview Reminder', desc: 'AI prep notifications', checked: true },
        { id: 'pref_system_updates', label: 'System Updates', desc: 'New feature releases', checked: false },
      ]
    },
    {
      icon: Shield, title: 'Security', desc: 'Configure multi-factor authentication and session keys.',
      items: [
        { id: 'pref_2fa', label: 'Two-Factor Auth', desc: 'Require code on login', checked: false },
        { id: 'pref_session_timeout', label: 'Session Timeout', desc: 'Auto-logout after 30m', checked: true },
        { id: 'pref_login_history', label: 'Login History', desc: 'Track device access', checked: true },
        { id: 'pref_active_devices', label: 'Active Devices', desc: 'Monitor concurrent sessions', checked: true },
      ]
    },
    {
      icon: Palette, title: 'Appearance', desc: 'Customize your obsidian dashboard theme and effects.',
      items: [
        { id: 'pref_dark_mode', label: 'Dark Mode', desc: 'Force dark theme', checked: true },
        { id: 'pref_system_theme', label: 'System Theme', desc: 'Match OS settings', checked: false },
        { id: 'pref_compact_mode', label: 'Compact Mode', desc: 'Reduce padding', checked: false },
        { id: 'pref_reduced_motion', label: 'Reduced Motion', desc: 'Disable animations', checked: false },
        { id: 'pref_density', label: 'Dashboard Density', desc: 'Show more metrics', checked: true },
      ]
    },
    {
      icon: BrainCircuit, title: 'AI Preferences', desc: 'Tune the intelligence engine analysis depth.',
      items: [
        { id: 'pref_detailed_summary', label: 'Detailed Summary', desc: 'Expand executive briefs', checked: true },
        { id: 'pref_deep_parse', label: 'Deep Resume Parsing', desc: 'Aggressive extraction', checked: true },
        { id: 'pref_auto_ats', label: 'Auto ATS Analysis', desc: 'Scan on upload', checked: true },
        { id: 'pref_ai_recs', label: 'AI Recommendations', desc: 'Proactive suggestions', checked: true },
        { id: 'pref_smart_scan', label: 'Smart Resume Scan', desc: 'Contextual mapping', checked: true },
      ]
    }
  ];

  const systemConfigItems = [
    { id: 'sys_perf', label: 'Performance Mode', desc: 'Optimize render cycles', checked: true },
    { id: 'sys_cache', label: 'Cache Optimization', desc: 'Store local assets', checked: true },
    { id: 'sys_ws', label: 'Real-time AI Sync', desc: 'WebSocket connections', checked: false },
    { id: 'sys_gpu', label: 'GPU Acceleration', desc: 'Hardware rendering', checked: true },
    { id: 'sys_analytics', label: 'Analytics Collection', desc: 'Anonymous usage data', checked: false },
  ];

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
          Preferences <Settings className="text-(--primary)" />
        </h2>
        <p className="text-(--text-muted)">Tailor the AI Intelligence Platform to your workflow.</p>
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
            <ToggleItem key={i} label={item.label} description={item.desc} defaultChecked={item.checked} storageKey={item.id} />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
