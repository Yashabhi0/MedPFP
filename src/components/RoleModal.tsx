import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Stethoscope } from 'lucide-react';

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
}

const RoleModal = ({ open, onClose }: RoleModalProps) => {
  const [selected, setSelected] = useState<'patient' | 'doctor' | null>(null);
  const navigate = useNavigate();

  if (!open) return null;

  const handleContinue = () => {
    if (selected === 'patient') navigate('/dashboard');
    else if (selected === 'doctor') navigate('/doctor');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md p-8 animate-fade-in-up md:max-w-md max-md:max-h-screen max-md:h-full max-md:rounded-none max-md:flex max-md:flex-col max-md:justify-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-dark mb-1">Who are you?</h2>
        <p className="text-muted-foreground text-sm mb-6">Choose your role to continue.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setSelected('patient')}
            className={`card-base text-center p-6 cursor-pointer transition-all ${
              selected === 'patient' ? 'border-primary bg-accent' : 'hover:border-primary/30'
            }`}
          >
            <User className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-semibold text-dark text-sm">Patient</p>
            <p className="text-xs text-muted-foreground mt-1">Build and manage your health passport</p>
          </button>
          <button
            onClick={() => setSelected('doctor')}
            className={`card-base text-center p-6 cursor-pointer transition-all ${
              selected === 'doctor' ? 'border-primary bg-accent' : 'hover:border-primary/30'
            }`}
          >
            <Stethoscope className="w-10 h-10 text-secondary mx-auto mb-3" />
            <p className="font-semibold text-dark text-sm">Doctor</p>
            <p className="text-xs text-muted-foreground mt-1">Scan a QR code to view a patient's passport</p>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default RoleModal;
