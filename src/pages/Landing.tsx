import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, Sparkles, QrCode, ShieldAlert, FileScan,
  Pill, Activity, PhoneCall, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RoleModal from '../components/RoleModal';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ marginTop: 0 }}>
      <Navbar
        transparent={true}
        rightContent={
          <button
            className="font-bold rounded-full px-5 py-2 text-sm shadow-md transition-all hover:scale-105"
            style={{ backgroundColor: '#F2EDE6', color: '#2E2E2E' }}
            onClick={() => navigate('/auth')}
          >
            Get Started
          </button>
        }
      />

      {/* ── HERO ── */}
      <section
        className="min-h-[100vh] relative overflow-hidden flex items-center"
        style={{ backgroundColor: '#8FA7B0' }}
      >
        {/* Background blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #9FB4BB 0%, transparent 70%)' }} />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #F2EDE6 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] opacity-10"
            style={{ background: 'radial-gradient(ellipse, #ffffff 0%, transparent 65%)' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-28 pb-20 w-full relative z-10
                        flex flex-col md:flex-row md:items-center md:gap-8">

          {/* ── LEFT ── */}
          <div className="md:w-[48%] flex flex-col">
            {/* AI badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 self-start animate-fade-in-up"
              style={{
                backgroundColor: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
              }}>
              <Sparkles className="w-3 h-3 text-white" />
              <span className="text-white/80 text-xs font-medium tracking-wide">AI-Powered Health Records</span>
            </div>

            {/* Headline */}
            <h1
              className="font-extrabold text-white leading-[1.08] mb-5 animate-fade-in-up animate-delay-100"
              style={{
                fontSize: 'clamp(38px, 4.5vw, 54px)',
                textShadow: '0 2px 24px rgba(0,0,0,0.12)',
              }}
            >
              Your Medical<br />
              History.<br />
              <span style={{ color: '#F2EDE6' }}>Always Ready.</span>
            </h1>

            {/* Subtext */}
            <p className="text-base mb-8 max-w-sm animate-fade-in-up animate-delay-200 leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.68)' }}>
              One QR code. Any doctor. Instant context.<br />Built for India.
            </p>

            {/* CTA */}
            <div className="flex items-center gap-4 mb-10 animate-fade-in-up animate-delay-300">
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center gap-2 font-bold rounded-full px-7 py-3.5 text-sm shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl"
                style={{ backgroundColor: '#D8A17A', color: '#F2EDE6' }}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Free · No app needed
              </p>
            </div>
          </div>

          {/* ── RIGHT — Passport card + floating chips ── */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-center
                          mt-12 md:mt-0 animate-fade-in-up animate-delay-300 relative min-h-[520px]">

            {/* Floating chip — top left */}
            <div
              className="absolute left-0 top-10 rounded-2xl px-4 py-2.5 z-20 shadow-lg"
              style={{
                backgroundColor: 'rgba(242,237,230,0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.6)',
                transform: 'rotate(-2.5deg)',
              }}
            >
              <p className="text-[11px] font-bold" style={{ color: '#2E2E2E' }}>⚡ 10 sec</p>
              <p className="text-[10px]" style={{ color: '#6B6B6B' }}>doctor access</p>
            </div>

            {/* Floating chip — bottom right */}
            <div
              className="absolute right-2 bottom-10 rounded-2xl px-4 py-2.5 z-20 shadow-lg"
              style={{
                backgroundColor: 'rgba(188,255,214,0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.6)',
                transform: 'rotate(2deg)',
              }}
            >
              <p className="text-[11px] font-bold" style={{ color: '#2E2E2E' }}>✦ AI Parsed</p>
              <p className="text-[10px]" style={{ color: '#2E2E2E' }}>medicines extracted</p>
            </div>

            {/* Floating chip — top right */}
            <div
              className="absolute right-4 top-6 rounded-2xl px-4 py-2.5 z-20 shadow-lg"
              style={{
                backgroundColor: 'rgba(159,180,187,0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.5)',
                transform: 'rotate(2deg)',
              }}
            >
              <p className="text-[11px] font-bold text-white"></p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.8)' }}>For doctors</p>
            </div>

            {/* Main passport card */}
            <div
              className="relative w-[300px] rounded-3xl shadow-2xl overflow-hidden"
              style={{
                backgroundColor: 'rgba(242,237,230,0.97)',
                border: '1px solid rgba(255,255,255,0.7)',
                transform: 'rotate(1deg)',
              }}
            >
              {/* Scan line */}
              <div
                className="absolute left-0 right-0 h-[2px] z-20 opacity-50"
                style={{
                  background: 'linear-gradient(90deg, transparent, #8FA7B0, transparent)',
                  animation: 'scanline 2.5s ease-in-out infinite',
                }}
              />

              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: '#6B6B6B' }}>
                      Health Passport
                    </p>
                    <p className="font-bold text-base" style={{ color: '#2E2E2E' }}>Ramesh Kumar</p>
                    <p className="text-[11px]" style={{ color: '#6B6B6B' }}>58 years · Male</p>
                  </div>
                  <span className="badge-blood text-sm">B+</span>
                </div>

                <div className="h-px mb-3" style={{ backgroundColor: '#D9D1C7' }} />

                <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#6B6B6B' }}>
                  ⚠ Allergies
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="badge-allergy text-xs">Penicillin</span>
                  <span className="badge-allergy text-xs">Sulfa Drugs</span>
                </div>

                <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#6B6B6B' }}>
                  Current Medicines
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="badge-medicine text-xs">Metformin 500mg</span>
                  <span className="badge-medicine text-xs">Lisinopril 10mg</span>
                  <span className="badge-medicine text-xs">Atorvastatin 20mg</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {[
                    { label: 'HbA1c', value: '7.8%' },
                    { label: 'BP', value: '138/88' },
                    { label: 'Glucose', value: '124' },
                  ].map((d) => (
                    <div key={d.label} className="rounded-xl p-2 text-center" style={{ backgroundColor: '#EDE8E2' }}>
                      <p className="text-xs font-bold" style={{ color: '#2E2E2E' }}>{d.value}</p>
                      <p className="text-[9px]" style={{ color: '#6B6B6B' }}>{d.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl px-3 py-2.5 flex items-start gap-2" style={{ backgroundColor: '#BCFFD6' }}>
                  <Sparkles className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#2E2E2E' }} />
                  <p className="text-[11px] italic leading-relaxed" style={{ color: '#2E2E2E' }}>
                    "Check allergies before prescribing. On 3 medications."
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #D9D1C7' }}>
                  <p className="text-[9px] font-mono" style={{ color: '#6B6B6B' }}>HP-2947</p>
                  <div className="flex items-center gap-1">
                    <QrCode className="w-3 h-3" style={{ color: '#6B6B6B' }} />
                    <p className="text-[9px]" style={{ color: '#6B6B6B' }}>Scan to access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Timeline ── */}
      <section className="py-24 px-4 scroll-reveal opacity-0" style={{ backgroundColor: '#8FA7B0' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.5)' }}>Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">How It Works</h2>
          </div>

          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-7 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />

            <div className="space-y-10">
              {[
                { step: '01', icon: UploadCloud, title: 'Upload or Fill', desc: 'Upload a prescription photo or fill your profile manually in under 3 minutes.', align: 'left' },
                { step: '02', icon: Sparkles, title: 'AI Extracts Everything', desc: 'Our AI reads your documents and auto-fills medicines, conditions, and lab values instantly.', align: 'right' },
                { step: '03', icon: QrCode, title: 'Share in One Scan', desc: 'Show your QR code. Any doctor sees your full medical history in 10 seconds.', align: 'left' },
              ].map((item) => (
                <div key={item.step}
                  className={`relative flex items-center gap-6 md:gap-0 ${item.align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>

                  {/* Node */}
                  <div className="relative z-10 flex-shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: '#F2EDE6' }}>
                      <item.icon className="w-6 h-6" style={{ color: '#2E2E2E' }} />
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`md:w-[42%] ${item.align === 'right' ? 'md:mr-auto md:pr-20' : 'md:ml-auto md:pl-20'}`}>
                    <div className="rounded-2xl p-5 shadow-sm"
                      style={{ backgroundColor: 'rgba(242,237,230,0.92)', backdropFilter: 'blur(8px)' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#A8643E' }}>
                        {item.step}
                      </p>
                      <h3 className="font-bold text-base mb-1.5" style={{ color: '#2E2E2E' }}>{item.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 scroll-reveal opacity-0" style={{ backgroundColor: '#8FA7B0' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.5)' }}>Built for the Clinic</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Everything a Doctor Needs.<br />Nothing They Don't.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: ShieldAlert, title: 'Critical Alerts First', desc: 'Blood group and allergies shown at the top, every time. Never missed.', accent: '#E63946', bg: 'rgba(230,57,70,0.12)' },
              { icon: FileScan, title: 'Smart Document Parsing', desc: 'Upload any prescription. AI extracts medicines and diagnoses automatically.', accent: '#A8643E', bg: 'rgba(168,100,62,0.14)' },
              { icon: QrCode, title: 'Instant QR Access', desc: 'Doctors scan once and see everything. No app, no login, no friction.', accent: '#2E2E2E', bg: 'rgba(46,46,46,0.1)' },
              { icon: Pill, title: 'Current Medicines', desc: 'Name, dosage, frequency — exactly what the doctor needs.', accent: '#A8643E', bg: 'rgba(168,100,62,0.14)' },
              { icon: Activity, title: 'Lab Values with Dates', desc: 'HbA1c, BP, glucose — timestamped and ready.', accent: '#2E2E2E', bg: 'rgba(46,46,46,0.1)' },
              { icon: PhoneCall, title: 'Emergency Contact', desc: 'One tap to call. Always visible. Critical when the patient cannot speak.', accent: '#A8643E', bg: 'rgba(168,100,62,0.14)' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-5 card-hover group"
                style={{
                  backgroundColor: 'rgba(242,237,230,0.92)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: item.bg }}>
                  <item.icon className="w-5 h-5" style={{ color: item.accent }} />
                </div>
                <h3 className="font-bold text-sm mb-1.5" style={{ color: '#2E2E2E' }}>{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#6B6B6B' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
