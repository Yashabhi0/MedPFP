import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Bell, ShieldAlert, Pill, Edit } from 'lucide-react';
import Navbar from '../components/Navbar';

const COMING_SOON = "Coming soon — full editing available after backend integration.";

const medicines = [
  { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
  { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
  { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' },
];

const Dashboard = () => {
  const qrPattern = useMemo(
    () => Array.from({ length: 49 }, () => Math.random() > 0.4),
    []
  );

  return (
  <div className="min-h-screen bg-background">
    <Navbar
      initialFloating={true}
      links={[
        { label: 'My Passport', to: '/dashboard' },
        { label: 'Upload Documents', to: '/dashboard/upload' },
      ]}
      rightContent={
        <div className="flex items-center gap-3">
          <button className="relative"><Bell className="w-5 h-5 text-muted-foreground" /></button>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">RS</div>
        </div>
      }
    />

    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-dark mb-2">Good morning, Ramesh!</h1>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-muted-foreground">Your passport is 72% complete</span>
          <div className="flex-1 max-w-xs h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '72%' }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary text-sm" onClick={() => toast.info(COMING_SOON)}>+ Add Medicine</button>
          <Link to="/dashboard/upload" className="btn-secondary text-sm">+ Upload Report</Link>
          <button className="btn-secondary text-sm" onClick={() => document.getElementById('qr-card')?.scrollIntoView({ behavior: 'smooth' })}>View QR</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main */}
        <div className="lg:col-span-8 space-y-6">
          {/* Personal Info */}
          <div className="card-base">
            <h3 className="mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-muted-foreground">Full Name</p><p className="font-semibold">Ramesh Kumar</p></div>
              <div><p className="text-muted-foreground">Date of Birth</p><p className="font-semibold">12 Jan 1966</p></div>
              <div><p className="text-muted-foreground">Gender</p><p className="font-semibold">Male</p></div>
              <div><p className="text-muted-foreground">Blood Group</p><span className="badge-blood">B+</span></div>
            </div>
          </div>

          {/* Allergies */}
          <div className="card-alert">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              <h3 className="text-destructive">Allergies</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Penicillin', 'Sulfa Drugs', 'Dust'].map((a) => (
                <span key={a} className="badge-allergy">{a}</span>
              ))}
            </div>
            <button className="btn-ghost text-sm" onClick={() => toast.info(COMING_SOON)}>+ Add Allergy</button>
          </div>

          {/* Conditions */}
          <div className="card-base">
            <h3 className="mb-4">Chronic Conditions</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge-condition">Type 2 Diabetes (2019)</span>
              <span className="badge-condition">Hypertension (2021)</span>
            </div>
            <button className="btn-ghost text-sm" onClick={() => toast.info(COMING_SOON)}>+ Add Condition</button>
          </div>

          {/* Medicines */}
          <div>
            <h3 className="mb-4">Current Medicines</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {medicines.map((m) => (
                <div key={m.name} className="card-base card-hover relative">
                  <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                    <Edit className="w-4 h-4" />
                  </button>
                  <span className="badge-medicine mb-2 inline-block">{m.name}</span>
                  <p className="font-semibold text-dark">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.dosage} · {m.frequency}</p>
                </div>
              ))}
            </div>
            <button className="btn-secondary text-sm mt-4" onClick={() => toast.info(COMING_SOON)}>+ Add Medicine</button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div id="qr-card" className="card-base text-center sticky top-24">
            <h3 className="mb-4">Your Health Passport QR</h3>
            {/* Mock QR */}
            <div className="w-48 h-48 mx-auto mb-4 bg-dark rounded-xl flex items-center justify-center">
              <div className="grid grid-cols-7 gap-0.5">
                {qrPattern.map((filled, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${filled ? 'bg-white' : 'bg-transparent'}`}
                  />
                ))}
              </div>
            </div>
            <p className="font-mono text-lg font-bold text-dark mb-3">HP-2947</p>
            <button className="btn-secondary text-sm w-full mb-2">Download QR</button>
            <p className="text-xs text-muted-foreground">Show this to any doctor for instant access</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Dashboard;
