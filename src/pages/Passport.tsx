import { ShieldAlert, Pill, Activity, BarChart3, PhoneCall, HeartPulse } from 'lucide-react';

const Passport = () => (
  <div className="min-h-screen bg-background">
    {/* Intentionally smaller — read-only view */}
    <nav className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-2 text-primary font-bold text-sm">
        <HeartPulse className="w-5 h-5" />
        Health Passport
      </div>
      <p className="text-xs text-muted-foreground hidden sm:block">Read-only view — powered by Health Passport</p>
    </nav>

    <div className="max-w-[480px] mx-auto px-4 py-6 space-y-4">
      {/* Critical Alerts */}
      <div className="card-alert">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-destructive" />
          <h3 className="text-destructive font-bold">Critical Alerts</h3>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="badge-blood">B+</span>
        </div>
        <p className="text-xs text-muted-foreground mb-2 font-semibold">Allergies</p>
        <div className="flex flex-wrap gap-2">
          {['Penicillin', 'Sulfa Drugs', 'Dust'].map((a) => (
            <span key={a} className="badge-allergy">{a}</span>
          ))}
        </div>
      </div>

      {/* Medicines */}
      <div className="card-base">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="w-5 h-5 text-primary" />
          <h3>Current Medicines</h3>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Metformin', dosage: '500mg', freq: 'Twice daily' },
            { name: 'Lisinopril', dosage: '10mg', freq: 'Once daily' },
            { name: 'Atorvastatin', dosage: '20mg', freq: 'Once daily' },
          ].map((m) => (
            <div key={m.name} className="flex items-center gap-3">
              <span className="badge-medicine text-xs">{m.name}</span>
              <span className="text-sm text-muted-foreground">{m.dosage} · {m.freq}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conditions */}
      <div className="card-base">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3>Chronic Conditions</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge-condition">Type 2 Diabetes</span>
          <span className="badge-condition">Hypertension</span>
        </div>
      </div>

      {/* Health Data */}
      <div className="card-base">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3>Recent Health Data</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'HbA1c', value: '7.8%', date: 'Jan 2025' },
            { label: 'Blood Pressure', value: '138/88 mmHg', date: 'Feb 2025' },
            { label: 'Fasting Glucose', value: '124 mg/dL', date: 'Mar 2025' },
          ].map((d) => (
            <div key={d.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{d.label}</span>
              <span className="font-semibold" style={{ color: '#A8643E' }}>{d.value}</span>
              <span className="text-xs text-muted-foreground">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="card-base">
        <div className="flex items-center gap-2 mb-4">
          <PhoneCall className="w-5 h-5 text-primary" />
          <h3>Emergency Contact</h3>
        </div>
        <p className="font-semibold text-dark text-sm">Suresh Kumar (Son)</p>
        <p className="text-sm text-muted-foreground mb-4">+91 98765 43210</p>
        <a href="tel:+919876543210" className="btn-primary inline-block text-sm">Call Now</a>
      </div>

      <p className="text-center text-xs text-muted-foreground">Last updated: March 2025</p>
      <p className="text-center text-xs text-muted-foreground py-4">Powered by Health Passport</p>
    </div>
  </div>
);

export default Passport;
