import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Settings, Bell, Shield, Palette, BrainCircuit, Activity,
  ChevronDown, Check, Minus, RotateCcw
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { usePreferences } from '../context/PreferencesContext';

const TABS = [
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Choose which in-app alerts reach the notification bell.',
    items: [
      {
        key: 'pref_notifications',
        label: 'In-App Alerts',
        description: 'Master switch for the notification bell and its toast popups.'
      },
      {
        key: 'pref_analysis_alerts',
        label: 'Analysis Alerts',
        description: 'Notify when a resume analysis finishes or fails.'
      },
      {
        key: 'pref_connection_alerts',
        label: 'Connection Alerts',
        description: 'Show the banner when the app goes offline or comes back online.'
      }
    ]
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    title: 'Security',
    description: 'Control how long an idle session stays signed in.',
    items: [
      {
        key: 'pref_idle_timeout',
        label: 'Auto Sign-Out',
        description: 'Sign out automatically after a stretch with no mouse or keyboard activity.',
        type: 'select',
        options: [
          { value: 'off', label: 'Off' },
          { value: '15', label: '15 minutes' },
          { value: '30', label: '30 minutes' },
          { value: '60', label: '60 minutes' }
        ]
      },
      {
        key: 'pref_session_warning',
        label: 'Expiry Warning',
        description: 'Warn 60 seconds before an idle auto sign-out happens.'
      }
    ]
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
    title: 'Appearance',
    description: 'Adjust density, contrast and motion across the whole app.',
    items: [
      {
        key: 'pref_compact_mode',
        label: 'Compact Density',
        description: 'Tighten spacing and padding everywhere to fit more on screen.'
      },
      {
        key: 'pref_reduced_motion',
        label: 'Reduced Motion',
        description: 'Disable interface animations and transitions.'
      },
      {
        key: 'pref_high_contrast',
        label: 'High Contrast',
        description: 'Increase text, border and surface contrast for readability.'
      }
    ]
  },
  {
    id: 'ai',
    label: 'AI Preferences',
    icon: BrainCircuit,
    title: 'AI Preferences',
    description: 'Tune what the AI engine shows you and when it runs.',
    items: [
      {
        key: 'pref_auto_analyze',
        label: 'Auto-Analyze on Upload',
        description: 'Run the analysis automatically as soon as a resume finishes uploading.'
      },
      {
        key: 'pref_ai_recommendations',
        label: 'AI Recommendations',
        description: 'Show the improvement roadmap and suggested-role panels.'
      },
      {
        key: 'pref_detailed_summary',
        label: 'Detailed AI Summaries',
        description: 'Include interview questions, learning roadmap and career growth breakdowns.'
      }
    ]
  },
  {
    id: 'system',
    label: 'System',
    icon: Activity,
    title: 'System',
    description: 'Rendering and caching behaviour for this device.',
    items: [
      {
        key: 'pref_performance_mode',
        label: 'Performance Mode',
        description: 'Drop glass blur and looping animations for lower GPU usage.'
      },
      {
        key: 'pref_offline_cache',
        label: 'Offline Cache',
        description: 'Cache dashboard data locally and fall back to it when the API is unreachable.'
      }
    ]
  }
];

function StatusPill({ active, activeLabel = 'Active' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        active
          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
          : 'border-white/10 bg-white/5 text-(--text-muted)'
      }`}
    >
      {active ? <Check size={10} /> : <Minus size={10} />}
      {active ? activeLabel : 'Disabled'}
    </span>
  );
}

function ToggleSwitch({ checked, label, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Toggle ${label}`}
      onClick={onToggle}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--background) ${
        checked ? 'bg-(--primary)/25 border-(--primary)/50' : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full transition-transform duration-300 ${
          checked ? 'translate-x-5.5 bg-(--primary) shadow-[0_0_10px_var(--primary)]' : 'bg-gray-500'
        }`}
      />
    </button>
  );
}

function SelectControl({ value, options, label, onChange }) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-(--border) bg-(--surface-elevated) py-2 pl-3.5 pr-9 text-xs font-bold text-white outline-none transition-colors cursor-pointer hover:border-white/20 focus:border-(--primary)/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted)"
      />
    </div>
  );
}

function SettingRow({ item, preferences, setPreference }) {
  const isSelect = item.type === 'select';
  const value = preferences[item.key];
  const selectedLabel = isSelect
    ? item.options.find((option) => option.value === value)?.label
    : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-(--border) bg-(--surface-elevated) p-5 transition-colors hover:border-white/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1.5 sm:pr-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <h4 className="text-sm font-bold text-white tracking-tight">{item.label}</h4>
          <StatusPill active={Boolean(isSelect ? value !== 'off' : value)} activeLabel={selectedLabel || undefined} />
        </div>
        <p className="text-xs leading-relaxed text-(--text-muted)">{item.description}</p>
      </div>

      {isSelect ? (
        <SelectControl
          value={value}
          options={item.options}
          label={item.label}
          onChange={(next) => setPreference(item.key, next)}
        />
      ) : (
        <ToggleSwitch
          checked={Boolean(value)}
          label={item.label}
          onToggle={() => setPreference(item.key, !value)}
        />
      )}
    </div>
  );
}

export default function Preferences() {
  const { preferences, setPreference, resetPreferences } = usePreferences();
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const Icon = currentTab.icon;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            Preferences <Settings className="text-(--primary)" />
          </h2>
          <p className="text-(--text-muted)">Tailor the AI Intelligence Platform to your workflow.</p>
        </div>

        <button
          type="button"
          onClick={resetPreferences}
          className="flex shrink-0 items-center gap-2 self-start px-4 py-2.5 rounded-xl border border-(--border) bg-(--surface-elevated) text-xs font-bold text-(--text-muted) transition-colors hover:text-white hover:border-white/20 active:scale-95"
        >
          <RotateCcw size={14} /> Reset to defaults
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[15rem_1fr] gap-6 items-start">
        {/* Tab navigation — vertical rail on desktop, scrollable row on mobile */}
        <nav role="tablist" aria-label="Preference sections" aria-orientation="vertical">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0 custom-scrollbar">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = tab.id === activeTab;
              const enabledCount = tab.items.filter((item) => {
                const value = preferences[item.key];
                return item.type === 'select' ? value !== 'off' : Boolean(value);
              }).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="preferences-tabpanel"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors duration-300 ${
                    isActive
                      ? 'bg-(--primary)/10 border-(--primary)/30 text-white'
                      : 'border-transparent text-(--text-muted) hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="preferences-tab-indicator"
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-(--primary) shadow-[0_0_10px_var(--primary)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <TabIcon size={18} className={isActive ? 'text-(--primary)' : ''} />
                  <span className="text-sm font-bold whitespace-nowrap">{tab.label}</span>
                  <span className="ml-auto hidden lg:inline text-[10px] font-mono text-(--text-muted)">
                    {enabledCount}/{tab.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Active section */}
        <GlassCard className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab.id}
              id="preferences-tabpanel"
              role="tabpanel"
              aria-label={currentTab.title}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="flex items-start gap-4 pb-6 mb-6 border-b border-(--border)">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-(--primary)/10 border border-(--primary)/20 flex items-center justify-center">
                  <Icon size={22} className="text-(--primary)" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white tracking-tight">{currentTab.title}</h3>
                  <p className="text-sm text-(--text-muted) mt-0.5">{currentTab.description}</p>
                </div>
              </header>

              <div className="space-y-3">
                {currentTab.items.map((item) => (
                  <SettingRow
                    key={item.key}
                    item={item}
                    preferences={preferences}
                    setPreference={setPreference}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}
