import { useRef, useState } from 'react';
import { motion as MotionPrimitive, AnimatePresence } from 'framer-motion';
const MotionDiv = MotionPrimitive.div;
import {
  Building2, Layers, UserCog, Target, Sparkles, Upload, Loader2, X,
  CheckCircle2, FileText, ShieldCheck, Pencil
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { recruiterService } from '../../services/recruiterService';
import { useNotifications } from '../../context/NotificationContext';

const EMPTY_FORM = {
  company_name: '',
  industry: '',
  designation: '',
  hiring_goals: '',
  experience_level: '',
  bio_summary: '',
  tech_stack: [],
};

const toForm = (profile) => ({
  company_name: profile?.company_name || '',
  industry: profile?.industry || '',
  designation: profile?.designation || '',
  hiring_goals: profile?.hiring_goals || '',
  experience_level: profile?.experience_level || '',
  bio_summary: profile?.bio_summary || '',
  tech_stack: Array.isArray(profile?.tech_stack) ? profile.tech_stack : [],
});

// eslint-disable-next-line no-unused-vars
const Field = ({ icon: Icon, label, value, onChange, placeholder, textarea = false }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest flex items-center gap-1.5">
      <Icon size={11} /> {label}
    </span>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-(--background) border border-(--border) rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-(--accent)/40 resize-y placeholder:text-(--text-muted)"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-(--background) border border-(--border) rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-(--accent)/40 placeholder:text-(--text-muted)"
      />
    )}
  </label>
);

const ParsedResult = ({ parsed }) => {
  if (!parsed) return null;
  const rows = [
    ['Name', parsed.full_name],
    ['Experience Level', parsed.experience_level],
    ['Company', parsed.company_name],
    ['Industry', parsed.industry],
    ['Designation', parsed.designation],
  ].filter(([, value]) => value);

  return (
    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
      <div className="flex items-center gap-2 text-emerald-400">
        <Sparkles size={14} />
        <span className="text-[10px] font-black uppercase tracking-widest">
          {parsed.parse_status === 'ai' ? 'Parsed by Gemini' : 'Heuristic extraction'}
        </span>
      </div>

      {rows.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-widest text-(--text-muted) font-bold">{label}</span>
              <span className="text-xs font-bold text-white truncate">{value}</span>
            </div>
          ))}
        </div>
      )}

      {parsed.tech_stack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {parsed.tech_stack.map((skill) => (
            <span key={skill} className="px-2 py-0.5 rounded-lg bg-(--primary)/10 border border-(--primary)/20 text-(--primary) text-[10px] font-bold">
              {skill}
            </span>
          ))}
        </div>
      )}

      {parsed.bio_summary && (
        <p className="text-[11px] text-gray-300 leading-relaxed border-t border-emerald-500/20 pt-2">
          {parsed.bio_summary}
        </p>
      )}
    </div>
  );
};

/**
 * Recruiter onboarding — Option A (manual form) or Option B (AI bio parse).
 *
 * Nothing is mocked: a brand new recruiter starts at zero on every metric
 * because the profile row is created empty by `GET /recruiter/profile` and
 * `onboarding_completed` stays false until real values are supplied. Re-upload
 * of the bio is always available from the profile page.
 */
export default function RecruiterOnboarding({ profile, onProfileSaved, onSkip, embedded = false }) {
  const { addNotification } = useNotifications();
  const [mode, setMode] = useState('manual');
  const [form, setForm] = useState(() => toForm(profile));
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [stackInput, setStackInput] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  // Re-seed the form when the parent hands us a different profile object (the
  // initial load, or a re-fetch after a save). Done during render using React's
  // documented "adjust state when a prop changes" pattern, which avoids the
  // extra render pass an equivalent `useEffect` sync would cause.
  const [seededProfile, setSeededProfile] = useState(profile);
  if (profile !== seededProfile) {
    setSeededProfile(profile);
    setForm(toForm(profile));
  }

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const addSkills = (raw) => {
    const parts = raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setForm((f) => ({ ...f, tech_stack: Array.from(new Set([...f.tech_stack, ...parts])) }));
    setStackInput('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await recruiterService.saveProfile({ ...form });
      onProfileSaved?.(saved);
      addNotification('Recruiter profile saved', 'success', { category: 'system' });
      onSkip?.();
    } catch (err) {
      addNotification(err.response?.data?.detail || 'Could not save your profile', 'error', { category: 'system' });
    } finally {
      setSaving(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      addNotification('Please upload a PDF file', 'warning', { category: 'system' });
      return;
    }
    setSaving(true);
    setParsed(null);
    try {
      const result = await recruiterService.parseBio(file);
      setParsed(result.parsed);
      // The backend has already persisted the extracted fields; mirror them into
      // the form so the recruiter can review/adjust before closing.
      setForm(toForm(result.profile));
      onProfileSaved?.(result.profile);
      addNotification(
        result.parsed?.parse_status === 'ai' ? 'Bio parsed and applied' : 'Bio read with limited AI — review the fields',
        result.parsed?.parse_status === 'ai' ? 'success' : 'warning',
        { category: 'system' }
      );
    } catch (err) {
      addNotification(err.response?.data?.detail || 'Could not parse that PDF', 'error', { category: 'system' });
    } finally {
      setSaving(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const body = (
    <div className="space-y-6">
      {/* Option switch */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'manual', label: 'Enter Manually', icon: Pencil, desc: 'Fill in the hiring profile yourself.' },
          { id: 'upload', label: 'Upload Bio / Resume', icon: Sparkles, desc: 'Let Gemini extract your hiring profile.' },
        ].map((option) => {
          const Icon = option.icon;
          const isActive = mode === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              aria-pressed={isActive}
              className={`flex flex-col items-start gap-1.5 p-4 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-(--primary)/10 border-(--primary)/30'
                  : 'bg-white/2 border-(--border) hover:border-white/10'
              }`}
            >
              <span className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${isActive ? 'text-(--primary)' : 'text-(--text-muted)'}`}>
                <Icon size={13} /> {option.label}
              </span>
              <span className="text-[11px] text-(--text-muted) leading-relaxed">{option.desc}</span>
            </button>
          );
        })}
      </div>

      {mode === 'manual' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={Building2} label="Company Name" value={form.company_name} onChange={set('company_name')} placeholder="e.g. Northwind Labs" />
            <Field icon={Layers} label="Hiring Domain / Industry" value={form.industry} onChange={set('industry')} placeholder="e.g. Fintech, HealthTech" />
            <Field icon={UserCog} label="Role / Designation" value={form.designation} onChange={set('designation')} placeholder="e.g. Senior Talent Partner" />
            <Field icon={Target} label="Experience Level" value={form.experience_level} onChange={set('experience_level')} placeholder="e.g. Senior (8+ years)" />
          </div>

          <Field
            icon={Target}
            label="Active Hiring Goals"
            value={form.hiring_goals}
            onChange={set('hiring_goals')}
            placeholder="What are you hiring for right now?"
            textarea
          />

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={11} /> Tech Stack You Hire For
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkills(stackInput);
                  }
                }}
                placeholder="Python, React, AWS…"
                className="flex-1 bg-(--background) border border-(--border) rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-(--accent)/40 placeholder:text-(--text-muted)"
              />
              <button
                type="button"
                onClick={() => addSkills(stackInput)}
                disabled={!stackInput.trim()}
                className="px-4 rounded-xl bg-(--primary)/15 border border-(--primary)/25 text-(--primary) text-xs font-bold disabled:opacity-40 hover:bg-(--primary)/25 transition-colors"
              >
                Add
              </button>
            </div>
            {form.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.tech_stack.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, tech_stack: f.tech_stack.filter((s) => s !== skill) }))}
                    className="px-2 py-0.5 rounded-lg bg-(--primary)/10 border border-(--primary)/20 text-(--primary) text-[10px] font-bold hover:bg-(--primary)/20 transition-colors"
                  >
                    {skill} ×
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
              dragging ? 'border-(--primary)/50 bg-(--primary)/5' : 'border-(--border) hover:border-(--primary)/30'
            }`}
          >
            {saving ? (
              <Loader2 size={28} className="animate-spin text-(--primary)" />
            ) : (
              <Upload size={28} className="text-(--text-muted)" />
            )}
            <div>
              <p className="text-sm font-bold text-white">
                {saving ? 'Reading your document…' : 'Drop your bio or resume PDF here'}
              </p>
              <p className="text-xs text-(--text-muted) mt-1">
                PDF only, up to 10MB. Re-upload any time to refresh the extracted profile.
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <ParsedResult parsed={parsed} />

          {form.experience_level || form.tech_stack.length > 0 || form.bio_summary ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">
                <CheckCircle2 size={12} className="text-emerald-400" /> Saved to your profile — edit anything below
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field icon={Building2} label="Company Name" value={form.company_name} onChange={set('company_name')} placeholder="e.g. Northwind Labs" />
                <Field icon={Layers} label="Hiring Domain / Industry" value={form.industry} onChange={set('industry')} placeholder="e.g. Fintech" />
                <Field icon={UserCog} label="Role / Designation" value={form.designation} onChange={set('designation')} placeholder="e.g. Senior Talent Partner" />
                <Field icon={Target} label="Experience Level" value={form.experience_level} onChange={set('experience_level')} placeholder="e.g. Senior (8+ years)" />
              </div>
              <Field icon={Target} label="Active Hiring Goals" value={form.hiring_goals} onChange={set('hiring_goals')} placeholder="What are you hiring for?" textarea />
              {form.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.tech_stack.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-lg bg-(--primary)/10 border border-(--primary)/20 text-(--primary) text-[10px] font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-(--border)">
        <p className="text-[10px] text-(--text-muted) flex items-center gap-1.5">
          <ShieldCheck size={11} /> Company and industry unlock your dashboard metrics.
        </p>
        <div className="flex items-center gap-2">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-(--text-muted) hover:text-white border border-(--border) transition-colors"
            >
              {profile?.onboarding_completed ? 'Cancel' : 'Skip for now'}
            </button>
          )}
          {mode === 'manual' && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-(--primary) text-white text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Save Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <GlassCard className="p-8">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <FileText size={18} className="text-(--primary)" /> Hiring Profile
        </h3>
        <p className="text-xs text-(--text-muted) mb-6">
          These details drive your dashboard. Update them or re-upload your bio at any time.
        </p>
        {body}
      </GlassCard>
    );
  }

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Recruiter onboarding"
    >
      <MotionDiv
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <GlassCard glow className="p-8 relative">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              aria-label="Close onboarding"
              className="absolute top-5 right-5 text-(--text-muted) hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <h2 className="text-2xl font-black text-white mb-1">Set up your hiring profile</h2>
          <p className="text-xs text-(--text-muted) mb-6">
            Your dashboard starts at zero until this is filled in — no sample numbers, only your real activity.
          </p>
          {body}
        </GlassCard>
      </MotionDiv>
    </MotionDiv>
  );
}
