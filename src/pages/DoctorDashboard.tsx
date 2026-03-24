import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DoctorDashboard = () => (
  <div className="min-h-screen bg-background">
    <Navbar
      links={[
        { label: 'Scan QR', to: '/doctor' },
        { label: 'My Patients', to: '/doctor/patients' },
      ]}
      rightContent={
        <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold">DR</div>
      }
    />

    <div className="max-w-[600px] mx-auto px-4 py-16">
      <div className="card-base text-center">
        <h2 className="mb-2">Scan Patient QR Code</h2>
        <p className="text-sm text-muted-foreground mb-8">Point your camera at the patient's Health Passport QR code</p>

        {/* Scanner viewport */}
        <div className="w-[280px] h-[280px] mx-auto mb-6 relative bg-dark/90 rounded-2xl flex items-center justify-center">
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-primary rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-primary rounded-br-lg" />
          <p className="text-white/60 text-sm animate-pulse">Scanning...</p>
        </div>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or enter code manually</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex gap-3 max-w-sm mx-auto">
          <input
            type="text"
            placeholder="Enter HP-XXXX code"
            className="flex-1 px-4 py-2.5 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Link to="/passport/demo" className="btn-primary whitespace-nowrap">Open Passport</Link>
        </div>

        <p className="text-xs text-muted-foreground mt-4">No login required for patients</p>
      </div>
    </div>
  </div>
);

export default DoctorDashboard;
