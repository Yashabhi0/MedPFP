import { useState } from 'react';
import { toast } from 'sonner';
import {
  Bell, Clock, Calendar, MessageSquare, Eye,
  Phone, ToggleLeft, ToggleRight, Send, Sparkles,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────
type TimeMode = 'now' | 'schedule';
type DayMode  = 'none' | 'everyday' | 'custom';

interface FormState {
  enabled:     boolean;
  phone:       string;
  timeMode:    TimeMode;
  scheduleTime:string;
  dayMode:     DayMode;
  customDate:  string;
  message:     string;
}

// ── Helpers ───────────────────────────────────────────────────────────────
const SAMPLE = { name: 'Ramesh', medicine: 'Lisinopril', time: '08:00 AM' };

function resolvePreview(msg: string): string {
  return msg
    .replace(/\{\{name\}\}/g, SAMPLE.name)
    .replace(/\{\{medicine\}\}/g, SAMPLE.medicine)
    .replace(/\{\{time\}\}/g, SAMPLE.time);
}

function isValidPhone(p: string) {
  return /^\+?[0-9]{10,15}$/.test(p.replace(/\s/g, ''));
}

// ── Sub-components ────────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-widest text-purple-300 mb-2">{children}</p>
);

const GlassInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30
      focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all ${props.className ?? ''}`}
  />
);

const RadioPill = ({
  label, checked, onChange, icon,
}: { label: string; checked: boolean; onChange: () => void; icon?: React.ReactNode }) => (
  <button
    type="button"
    onClick={onChange}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
      ${checked
        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
        : 'bg-white/5 border-white/10 text-white/60 hover:border-purple-500/40 hover:text-white/80'
      }`}
  >
    {icon}
    {label}
  </button>
);

// ── Main Page ─────────────────────────────────────────────────────────────
const MsgPage = () => {
  const [form, setForm] = useState<FormState>({
    enabled:      true,
    phone:        '',
    timeMode:     'now',
    scheduleTime: '',
    dayMode:      'none',
    customDate:   '',
    message:      'Hi {{name}}, this is a reminder to take your {{medicine}} at {{time}}. Stay healthy! 💊',
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const phoneValid = form.phone === '' || isValidPhone(form.phone);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.phone || !form.message) {
      toast.error('Phone and message are required');
      return;
    }
    if (form.timeMode === 'schedule' && !form.scheduleTime) {
      toast.error('Please pick a schedule time');
      return;
    }
    if (form.dayMode === 'custom' && !form.customDate) {
      toast.error('Please pick a custom date');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone:        form.phone,
          message:      resolvePreview(form.message),
          timeMode:     form.timeMode,
          scheduleTime: form.scheduleTime,
          dayMode:      form.dayMode,
          customDate:   form.customDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.mode === 'sent_now')            toast.success('WhatsApp message sent!');
        else if (data.mode === 'scheduled_everyday') toast.success(`Reminder scheduled daily at ${form.scheduleTime}`);
        else if (data.mode === 'scheduled_custom')   toast.success(`Reminder scheduled for ${form.customDate} at ${form.scheduleTime}`);
        else                                         toast.success(`Reminder scheduled for today at ${form.scheduleTime}`);
      } else {
        toast.error(data.error ?? 'Failed to send message');
      }
    } catch {
      toast.error('Could not reach backend. Is it running on port 5000?');
    } finally {
      setSaving(false);
    }
  };

  const preview = resolvePreview(form.message);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

      <div className="w-full max-w-2xl animate-fade-in-up">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{ color: '#fff' }}>WhatsApp Reminders</h1>
            <p className="text-xs text-white/40">Configure automated medication reminders</p>
          </div>
          {/* Toggle */}
          <button
            className="ml-auto flex items-center gap-2 text-sm font-medium transition-colors"
            onClick={() => set('enabled', !form.enabled)}
          >
            {form.enabled
              ? <><ToggleRight className="w-8 h-8 text-purple-400" /><span className="text-purple-300">Enabled</span></>
              : <><ToggleLeft  className="w-8 h-8 text-white/30"   /><span className="text-white/30">Disabled</span></>
            }
          </button>
        </div>

        {/* Main card */}
        <div className="rounded-3xl border border-white/10 p-6 space-y-6"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>

          {/* Phone */}
          <div className="animate-fade-in-up animate-delay-100">
            <Label><Phone className="w-3 h-3 inline mr-1" />Phone Number</Label>
            <GlassInput
              type="tel"
              placeholder="+91XXXXXXXXXX"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
            />
            {!phoneValid && (
              <p className="text-xs text-red-400 mt-1">Enter a valid phone number (10–15 digits)</p>
            )}
          </div>

          {/* Time */}
          <div className="animate-fade-in-up animate-delay-200">
            <Label><Clock className="w-3 h-3 inline mr-1" />Send Time</Label>
            <div className="flex gap-3 flex-wrap">
              <RadioPill label="Now"           checked={form.timeMode === 'now'}      onChange={() => set('timeMode', 'now')}      icon={<Sparkles className="w-3.5 h-3.5" />} />
              <RadioPill label="Schedule Time" checked={form.timeMode === 'schedule'} onChange={() => set('timeMode', 'schedule')} icon={<Clock     className="w-3.5 h-3.5" />} />
            </div>
            {form.timeMode === 'schedule' && (
              <div className="mt-3 animate-fade-in-up">
                <GlassInput
                  type="time"
                  value={form.scheduleTime}
                  onChange={e => set('scheduleTime', e.target.value)}
                  className="max-w-[180px]"
                />
              </div>
            )}
          </div>

          {/* Day */}
          <div className="animate-fade-in-up animate-delay-300">
            <Label><Calendar className="w-3 h-3 inline mr-1" />Repeat</Label>
            <div className="flex gap-3 flex-wrap">
              <RadioPill label="No Repeat"  checked={form.dayMode === 'none'}     onChange={() => set('dayMode', 'none')}     icon={<Bell     className="w-3.5 h-3.5" />} />
              <RadioPill label="Everyday"   checked={form.dayMode === 'everyday'} onChange={() => set('dayMode', 'everyday')} icon={<Bell     className="w-3.5 h-3.5" />} />
              <RadioPill label="Custom Day" checked={form.dayMode === 'custom'}   onChange={() => set('dayMode', 'custom')}   icon={<Calendar className="w-3.5 h-3.5" />} />
            </div>
            {form.dayMode === 'custom' && (
              <div className="mt-3 animate-fade-in-up">
                <GlassInput
                  type="date"
                  value={form.customDate}
                  onChange={e => set('customDate', e.target.value)}
                  className="max-w-[200px]"
                />
              </div>
            )}
          </div>

          {/* Message */}
          <div className="animate-fade-in-up animate-delay-400">
            <Label><MessageSquare className="w-3 h-3 inline mr-1" />Message</Label>
            <textarea
              rows={3}
              placeholder="Enter your reminder message..."
              value={form.message}
              onChange={e => set('message', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30
                focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {['{{name}}', '{{medicine}}', '{{time}}'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('message', form.message + v)}
                  className="text-xs px-2.5 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300
                    hover:bg-purple-600/40 transition-all font-mono"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-white/10 p-4"
            style={{ background: 'rgba(139,92,246,0.08)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-semibold text-purple-300 uppercase tracking-widest">Live Preview</p>
            </div>
            {/* WhatsApp bubble */}
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {preview || <span className="text-white/30 italic">Your message will appear here…</span>}
                <p className="text-[10px] text-white/30 mt-1 text-right">
                  {form.timeMode === 'schedule' && form.scheduleTime ? form.scheduleTime : 'Now'} ·{' '}
                  {form.dayMode === 'custom' && form.customDate ? form.customDate : form.dayMode === 'none' ? 'Once' : 'Everyday'}
                </p>
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!form.enabled || !phoneValid || saving}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2
              transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
              hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <Send className="w-4 h-4" />
            {saving ? 'Sending…' : 'Save Reminder Config'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default MsgPage;
