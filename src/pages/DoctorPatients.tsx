import { Link } from 'react-router-dom';
import { Sparkles, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProfileDropdown from '../components/auth/ProfileDropdown';

const patients = [
  { initials: 'RK', name: 'Ramesh Kumar', age: 58, condition: 'Type 2 Diabetes', time: '2 hours ago' },
  { initials: 'PM', name: 'Priya Menon', age: 45, condition: 'Hypertension', time: 'Yesterday' },
  { initials: 'AS', name: 'Arjun Shah', age: 67, condition: 'Asthma', time: '2 days ago' },
  { initials: 'SR', name: 'Sunita Rao', age: 52, condition: 'Hypothyroidism', time: '3 days ago' },
];

const chatMessages = [
  { role: 'assistant', text: "Hello Dr. Priya! I can help you understand your patient's medical history. Ask me anything about a patient's passport." },
  { role: 'user', text: 'What medications is Ramesh currently on?' },
  { role: 'assistant', text: 'Ramesh is currently on Metformin 500mg (twice daily), Lisinopril 10mg (once daily), and Atorvastatin 20mg (once daily). He was last seen by Dr. Sharma at Apollo Clinic.' },
];

const DoctorPatients = () => (
  <div className="min-h-screen bg-background">
    <Navbar
      initialFloating={true}
      links={[
        { label: 'Scan QR', to: '/doctor' },
        { label: 'My Patients', to: '/doctor/patients' },
      ]}
      rightContent={
        <ProfileDropdown initials="DR" color="#9FB4BB" />
      }
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
          <div className="card-info overflow-hidden p-0">
            <div className="p-4 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #8FA7B0 0%, #9FB4BB 100%)' }}>
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="text-white font-semibold text-sm">Health Passport AI</h3>
              <span className="bg-white/20 text-white text-[10px] font-bold rounded-full px-2 py-0.5 ml-auto">Beta</span>
            </div>

            <div className="p-4 space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm max-w-[85%] ${
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
            </div>

            <div className="p-3 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="Ask about a patient..."
                className="flex-1 px-3 py-2 text-sm border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
                onChange={() => {}}
              />
              <button className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DoctorPatients;
