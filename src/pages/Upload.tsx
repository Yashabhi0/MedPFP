import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Bell } from 'lucide-react';

type UploadState = 'idle' | 'processing' | 'review' | 'success';

const Upload = () => {
  const [state, setState] = useState<UploadState>('idle');
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const startProcessing = () => {
    setState('processing');
    setTimeout(() => setState('review'), 2500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    startProcessing();
  };

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

      <div className="max-w-[680px] mx-auto px-4 py-8 space-y-8">
        <h1>Upload Documents</h1>

        {/* State 1 — Upload Zone */}
        {state === 'idle' && (
          <div
            className={`card-upload text-center py-12 transition-opacity ${dragOver ? 'opacity-100 border-primary' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadCloud className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="font-semibold text-dark mb-1">Drop your prescription or report here</p>
            <p className="text-xs text-muted-foreground mb-4">Supports JPG, PNG, PDF</p>
            <button className="btn-primary" onClick={startProcessing}>Browse Files</button>
          </div>
        )}

        {/* State 2 — Processing */}
        {state === 'processing' && (
          <div className="card-upload text-center py-12 animate-pulse-border">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="font-semibold text-dark">Analysing your document...</p>
          </div>
        )}

        {/* State 3 — Extraction */}
        {state === 'review' && (
          <div className="card-info">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3>AI Extracted the Following — Please Review</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Powered by Claude AI</p>

            <div className="space-y-4">
              {[
                { label: 'Medicines', value: 'Metformin 500mg — Twice daily' },
                { label: 'Conditions', value: 'Type 2 Diabetes' },
                { label: 'Doctor', value: 'Dr. Sharma' },
                { label: 'Clinic', value: 'Apollo Clinic, Delhi' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{field.label}</label>
                  <input
                    type="text"
                    defaultValue={field.value}
                    className="w-full mt-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button className="btn-primary" onClick={() => setState('success')}>Confirm & Save</button>
              <button className="btn-secondary">Edit</button>
              <button className="btn-ghost" onClick={() => setState('idle')}>Discard</button>
            </div>
          </div>
        )}

        {/* State 4 — Success */}
        {state === 'success' && (
          <div className="card-base text-center py-12">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-primary mb-2">Passport Updated!</h2>
            <p className="text-muted-foreground mb-6">3 fields added to your passport.</p>
            <button className="btn-primary inline-block" onClick={() => navigate('/dashboard')}>View My Passport</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
