import { useRef, useState, useEffect } from 'react';
import { Sparkles, Send, Loader2, X, User, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import ProfileDropdown from '../components/auth/ProfileDropdown';
import { getPassportByCode } from '../lib/api/passport';
import { getUserProfileByInternalId } from '../lib/api/user';
import { getReports } from '../lib/api/reports';
import { getDoctorPatients, removeDoctorPatient } from '../lib/api/doctorPatients';
import type { Passport, UserProfile, UploadedReport } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ── Types ─────────────────────────────────────────────────────────────────
type PatientData = {
  code: string;
  passport: Passport;
  profile: UserProfile | null;
  reports: UploadedReport[];
};

type Message = { role: 'user' | 'assistant'; text: string };

// ── Groq helpers ──────────────────────────────────────────────────────────
async function fetchStructuredSummary(p: PatientData): Promise<string> {
  const age = p.profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(p.profile.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const prompt = `You are a clinical assistant. Produce a structured medical summary for the doctor.

## Patient
Name: ${p.profile?.full_name ?? 'Unknown'}
DOB: ${p.profile?.date_of_birth ?? 'N/A'} ${age != null ? `(${age} yrs)` : ''}
Gender: ${p.profile?.gender ?? 'N/A'}
Blood Group: ${p.passport.blood_group ?? 'N/A'}

## Conditions
${p.passport.conditions.join(', ') || 'None recorded'}

## Allergies
${p.passport.allergies.join(', ') || 'None recorded'}

## Current Medications
${p.passport.medicines.map(m => `- ${m.name} ${m.dosage} (${m.frequency})`).join('\n') || 'None recorded'}

## Uploaded Reports (${p.reports.length})
${p.reports.map(r => `- ${r.file_name} (${new Date(r.uploaded_at).toLocaleDateString()})`).join('\n') || 'None'}

Produce a structured clinical summary with these exact sections:
1. **Overview** – 2-3 sentence patient snapshot
2. **Key Concerns** – bullet list of active issues
3. **Medication Review** – brief note on current medications
4. **Recommendations** – 2-3 actionable suggestions for the doctor`;

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const json = await res.json();
  return json.choices[0].message.content.trim();
}

// ── Single patient row (fetches its own data) ─────────────────────────────
const PatientRow = ({ code, onSelect, onRemove }: {
  code: string;
  onSelect: (d: PatientData) => void;
  onRemove: (code: string) => void;
}) => {
  const { data: passport, isLoading, isError } = useQuery({
    queryKey: ['passport-code', code],
    queryFn: () => getPassportByCode(code),
  });

  const { data: profile } = useQuery({
    queryKey: ['profile-for-passport', passport?.user_id],
    queryFn: () => getUserProfileByInternalId(passport!.user_id),
    enabled: !!passport?.user_id,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', passport?.id],
    queryFn: () => getReports(passport!.id),
    enabled: !!passport?.id,
  });

  if (isLoading) return (
    <div className="card-base flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-border shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-border rounded w-32" />
        <div className="h-3 bg-border rounded w-48" />
      </div>
    </div>
  );

  if (isError || !passport) return (
    <div className="card-base text-sm text-muted-foreground">
      Could not load patient: <span className="font-mono">{code}</span>
    </div>
  );

  const name = profile?.full_name ?? 'Unknown Patient';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const age = profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;
  const topCondition = passport.conditions[0] ?? passport.allergies[0] ?? 'No conditions recorded';

  return (
    <div className="card-base card-hover flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-dark text-sm">{name}{age != null ? `, ${age}` : ''}</p>
        <p className="text-xs text-muted-foreground truncate">{topCondition} · {reports.length} report{reports.length !== 1 ? 's' : ''}</p>
      </div>
      <button
        className="btn-primary text-xs whitespace-nowrap"
        onClick={() => onSelect({ code, passport, profile: profile ?? null, reports })}
      >
        AI Summary
      </button>
      <button
        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
        onClick={() => onRemove(code)}
        title="Remove patient"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ── Summary modal ─────────────────────────────────────────────────────────
const SummaryModal = ({ patient, onClose }: { patient: PatientData; onClose: () => void }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStructuredSummary(patient)
      .then(setSummary)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const name = patient.profile?.full_name ?? 'Unknown Patient';

  // Render markdown-style bold (**text**) as <strong>
  const renderText = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-muted-foreground">AI Clinical Summary</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating clinical summary…</span>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {summary && (
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {summary.split('\n').map((line, i) => (
                <p key={i} className={line.startsWith('#') ? 'font-bold mt-4 mb-1 text-primary' : 'mb-1'}>
                  {renderText(line.replace(/^#+\s*/, ''))}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────
const DoctorPatients = () => {
  const { user } = useUser();
  const doctorId = user?.id ?? '';
  const queryClient = useQueryClient();

  // Fetch patient codes from Supabase
  const { data: patientCodes = [], isLoading: codesLoading } = useQuery({
    queryKey: ['doctor-patients', doctorId],
    queryFn: () => getDoctorPatients(doctorId),
    enabled: !!doctorId,
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (code: string) => removeDoctorPatient(doctorId, code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctor-patients', doctorId] }),
  });

  const [selected, setSelected] = useState<PatientData | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    text: "Hello Doctor! Ask me anything about your patients.",
  }]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || chatLoading) return;
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a medical assistant for doctors. Answer clinical questions concisely.' },
            ...[...messages.slice(1), userMsg].map(m => ({ role: m.role, content: m.text })),
          ],
          temperature: 0.4,
          max_tokens: 512,
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? 'No response.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply.trim() }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${e.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        initialFloating={true}
        links={[
          { label: 'Scan QR', to: '/doctor' },
          { label: 'My Patients', to: '/doctor/patients' },
        ]}
        rightContent={<ProfileDropdown initials="DR" color="#9FB4BB" />}
      />

      <div className="max-w-[900px] mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* Patient List */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <h2>My Patients</h2>
              {patientCodes.length > 0 && (
                <button
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => {
                    patientCodes.forEach(c => removeMutation.mutate(c));
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            {codesLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="card-base flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-border shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-border rounded w-32" />
                      <div className="h-3 bg-border rounded w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : patientCodes.length === 0 ? (
              <div className="card-base text-center py-12 text-muted-foreground">
                <p className="text-sm">No patients yet.</p>
                <p className="text-xs mt-1">Scan a patient QR code to add them here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientCodes.map(code => (
                  <PatientRow
                    key={code}
                    code={code}
                    onSelect={setSelected}
                    onRemove={(c) => removeMutation.mutate(c)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* AI Chat */}
          <div className="lg:col-span-5">
            <div className="card-info overflow-hidden p-0 flex flex-col" style={{ height: '480px' }}>
              <div className="p-4 flex items-center gap-2 shrink-0" style={{ background: 'linear-gradient(135deg, #8FA7B0 0%, #9FB4BB 100%)' }}>
                <Sparkles className="w-5 h-5 text-white" />
                <h3 className="text-white font-semibold text-sm">Health Passport AI</h3>
                <span className="bg-white/20 text-white text-[10px] font-bold rounded-full px-2 py-0.5 ml-auto">Beta</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-card border border-primary/30 text-foreground' : 'text-white'}`}
                      style={msg.role === 'assistant' ? { backgroundColor: '#8FA7B0' } : undefined}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-2.5 text-sm text-white flex items-center gap-2" style={{ backgroundColor: '#8FA7B0' }}>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-xs opacity-80">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-border flex gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask about a patient..."
                  disabled={chatLoading}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || chatLoading}
                  className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {selected && <SummaryModal patient={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default DoctorPatients;
