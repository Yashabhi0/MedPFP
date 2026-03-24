import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProfileDropdown from '../components/auth/ProfileDropdown';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const patients = [
  { initials: 'RK', name: 'Ramesh Kumar',  age: 58, condition: 'Type 2 Diabetes',  time: '2 hours ago' },
  { initials: 'PM', name: 'Priya Menon',   age: 45, condition: 'Hypertension',      time: 'Yesterday'   },
  { initials: 'AS', name: 'Arjun Shah',    age: 67, condition: 'Asthma',            time: '2 days ago'  },
  { initials: 'SR', name: 'Sunita Rao',    age: 52, condition: 'Hypothyroidism',    time: '3 days ago'  },
];

const SYSTEM_PROMPT = `You are Health Passport AI, a medical assistant for doctors.
You have access to the following recently accessed patients:
${patients.map(p => `- ${p.name}, age ${p.age}, condition: ${p.condition}, last accessed: ${p.time}`).join('\n')}

Answer the doctor's questions about these patients helpfully and concisely.
If asked about something outside your knowledge, say so clearly.
Keep responses short and clinical. Do not make up specific medication details unless asked to suggest.`;

type Message = { role: 'user' | 'assistant'; text: string };

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  text: "Hello Doctor! I can help you understand your patients' medical history. Ask me anything about a patient's passport.",
};

const DoctorPatients = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!GROQ_API_KEY) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error: VITE_GROQ_API_KEY is not set in your .env file.' }]);
      return;
    }

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build messages: system prompt + history (skip UI greeting at index 0) + new user msg
      const chatMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...[...messages.slice(1), userMsg].map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.text,
        })),
      ];

      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: chatMessages,
          temperature: 0.4,
          max_tokens: 512,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error('[chat] Groq error:', res.status, errBody);
        let detail = `HTTP ${res.status}`;
        try {
          const parsed = JSON.parse(errBody);
          detail = parsed?.error?.message ?? detail;
        } catch { /* not JSON */ }
        setMessages(prev => [...prev, { role: 'assistant', text: `API error: ${detail}` }]);
        return;
      }

      const data = await res.json();
      const reply: string = data.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply.trim() }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[chat] Failed:', err);
      setMessages(prev => [...prev, { role: 'assistant', text: `Request failed: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
            <h2 className="mb-4">Recently Accessed Patients</h2>
            <div className="space-y-3">
              {patients.map((p) => (
                <div key={p.name} className="card-base card-hover flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {p.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark text-sm">{p.name}, {p.age}</p>
                    <p className="text-xs text-muted-foreground">{p.condition} · {p.time}</p>
                  </div>
                  <Link to="/passport/demo" className="btn-ghost text-xs whitespace-nowrap">View Passport</Link>
                </div>
              ))}
            </div>
          </div>

          {/* AI Chat */}
          <div className="lg:col-span-5">
            <div className="card-info overflow-hidden p-0 flex flex-col" style={{ height: '480px' }}>

              {/* Header */}
              <div className="p-4 flex items-center gap-2 shrink-0" style={{ background: 'linear-gradient(135deg, #8FA7B0 0%, #9FB4BB 100%)' }}>
                <Sparkles className="w-5 h-5 text-white" />
                <h3 className="text-white font-semibold text-sm">Health Passport AI</h3>
                <span className="bg-white/20 text-white text-[10px] font-bold rounded-full px-2 py-0.5 ml-auto">Beta</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-card border border-primary/30 text-foreground'
                          : 'text-white'
                      }`}
                      style={msg.role === 'assistant' ? { backgroundColor: '#8FA7B0' } : undefined}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-2.5 text-sm text-white flex items-center gap-2" style={{ backgroundColor: '#8FA7B0' }}>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-xs opacity-80">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border flex gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about a patient..."
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorPatients;
