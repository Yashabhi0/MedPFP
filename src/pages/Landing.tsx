import { useState } from 'react';
import {
  HeartPulse, UploadCloud, Sparkles, QrCode, ShieldAlert, FileScan,
  Pill, Activity, PhoneCall
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RoleModal from '../components/RoleModal';

const Landing = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ marginTop: 0 }}>
      <Navbar
        transparent={true}
        rightContent={
          <button className="btn-primary text-sm" onClick={() => setModalOpen(true)}>Get Started</button>
        }
      />

      {/* Hero */}
      <section
        className="min-h-[90vh] relative overflow-hidden flex items-center"
        style={{
          background: 'linear-gradient(135deg, #264653 0%, #2A9D8F 40%, #5E8B7E 70%, #F9F6F2 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 w-full relative z-10">
          <div className="md:max-w-[60%]">
            <h1 className="text-4xl md:text-[56px] font-extrabold text-white leading-tight mb-6 animate-fade-in-up">
              Your Medical History. Always Ready.
            </h1>
            <p className="text-white/70 text-lg mb-8 animate-fade-in-up animate-delay-100">
              One QR code. Any doctor. Instant context. Built for India.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-lg animate-fade-in-up animate-delay-200"
            >
              Get Started →
            </button>
            <p className="text-white/50 text-sm mt-4 animate-fade-in-up animate-delay-300">
              2,500+ patients · Trusted by doctors · Free to use
            </p>

            <div className="flex flex-wrap gap-3 mt-8 animate-fade-in-up animate-delay-400">
              {['AI Parsing', 'QR Sharing', 'Emergency Access'].map((chip) => (
                <span
                  key={chip}
                  className="bg-white/15 text-white border border-white/30 rounded-full px-4 py-1.5 text-sm backdrop-blur-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Floating preview card */}
          <div className="hidden md:block absolute bottom-16 right-8 bg-white rounded-2xl shadow-xl p-6 w-72 animate-fade-in-up animate-delay-300">
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wide">Passport Preview</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="badge-blood text-sm">B+</span>
              <span className="text-sm font-semibold text-dark">Ramesh Kumar</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="badge-allergy text-xs">Penicillin</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge-medicine text-xs">Metformin 500mg</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary shrink-0" />
              <p className="text-xs italic text-primary">AI Summary available</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-background py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="mb-2">How It Works</h1>
          <p className="text-muted-foreground mb-12">Three steps. Zero friction.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: UploadCloud, title: 'Upload or Fill', desc: 'Upload a prescription photo or fill your profile manually in under 3 minutes.' },
              { icon: Sparkles, title: 'AI Extracts Everything', desc: 'Our AI reads your documents and auto-fills medicines, conditions, and lab values.' },
              { icon: QrCode, title: 'Share in One Scan', desc: 'Show your QR code. Any doctor sees your full medical history in 10 seconds.' },
            ].map((item) => (
              <div key={item.title} className="card-base card-hover text-center">
                <item.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="mb-2">Everything a Doctor Needs. Nothing They Don't.</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              { icon: ShieldAlert, title: 'Critical Alerts First', desc: 'Blood group and allergies shown at the top, every time.' },
              { icon: FileScan, title: 'Smart Document Parsing', desc: 'Upload any prescription. AI extracts medicines and diagnoses automatically.' },
              { icon: QrCode, title: 'Instant QR Access', desc: 'Doctors scan once and see everything. No app, no login.' },
              { icon: Pill, title: 'Current Medicines', desc: 'Name, dosage, frequency — exactly what the doctor needs.' },
              { icon: Activity, title: 'Lab Values with Dates', desc: 'HbA1c, BP, glucose — timestamped and ready.' },
              { icon: PhoneCall, title: 'Emergency Contact', desc: 'One tap to call. Always visible.' },
            ].map((item) => (
              <div key={item.title} className="card-info card-hover text-left">
                <item.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-primary py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center text-white">
          {[
            { value: '10 sec', label: 'Average doctor access time' },
            { value: '3 min', label: 'To build your first passport' },
            { value: '0', label: 'Apps for doctors to install' },
          ].map((stat) => (
            <div key={stat.value}>
              <p className="text-4xl font-extrabold mb-1">{stat.value}</p>
              <p className="text-sm opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <RoleModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Landing;
