import { useRef, useState } from 'react';
import { UploadCloud, Loader2, Check } from 'lucide-react';
import { uploadReport } from '../lib/api/upload';
import { createReport } from '../lib/api/reports';
import { parseMedicalFile } from '../lib/api/ai';
import { updatePassportData } from '../lib/api/passport';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

type Step = 'uploading' | 'parsing' | 'saving' | null;

const STEPS: { key: Step; label: string }[] = [
  { key: 'uploading', label: 'Uploading' },
  { key: 'parsing',   label: 'Analyzing' },
  { key: 'saving',    label: 'Saving'    },
];

interface UploadBoxProps {
  /** Internal user_profiles.id — needed to upsert passport data */
  profileId: string;
  /** passports.id — needed to attach the report row */
  passportId: string;
  onFileSelect?: (file: File) => void;
  onComplete?: () => void;
}

const UploadBox = ({ profileId, passportId, onFileSelect, onComplete }: UploadBoxProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(null);
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = step !== null;

  const complete = (done: Step) =>
    setCompletedSteps(prev => (done ? [...prev, done] : prev));

  const handleFile = (incoming: File) => {
    if (!ACCEPTED_TYPES.includes(incoming.type)) {
      setError('Invalid file type. Please upload a PDF, PNG, or JPG.');
      return;
    }
    if (incoming.size > MAX_SIZE_BYTES) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }
    setError(null);
    setFile(incoming);
    onFileSelect?.(incoming);
  };

  const handleUpload = async () => {
    if (!file || !profileId || !passportId) return;
    setError(null);
    setCompletedSteps([]);

    try {
      // 1. Upload file to Supabase Storage
      setStep('uploading');
      let fileUrl: string;
      try {
        fileUrl = await uploadReport(file);
      } catch {
        setError('Upload failed. Please try again.');
        return;
      }
      complete('uploading');

      // 2. Parse with AI (Gemini edge function)
      setStep('parsing');
      let medicalData;
      try {
        medicalData = await parseMedicalFile(fileUrl);
      } catch {
        // Non-fatal — still save the file even if parsing fails
        medicalData = { conditions: [], allergies: [], medicines: [] };
      }
      complete('parsing');

      // 3. Save report row + merge passport data
      setStep('saving');
      try {
        await createReport(passportId, fileUrl, file.name);
        if (
          medicalData.conditions.length ||
          medicalData.allergies.length ||
          medicalData.medicines.length
        ) {
          await updatePassportData(profileId, medicalData);
        }
        setCompletedSteps(['uploading', 'parsing', 'saving']);
        onComplete?.();
      } catch {
        setError('Failed to save. Please try again.');
      }
    } finally {
      setStep(null);
    }
  };

  const stepLabel =
    step === 'uploading' ? 'Uploading...' :
    step === 'parsing'   ? 'Analyzing document...' :
    step === 'saving'    ? 'Saving data...' :
    'Upload Report';

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center py-12 px-4 text-center cursor-pointer hover:border-primary/60 transition-colors"
        onClick={() => !isBusy && inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (!isBusy) { const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); } }}
      >
        <UploadCloud className="w-10 h-10 text-primary mb-3" />
        {file ? (
          <p className="text-sm font-medium text-foreground">{file.name}</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground mb-1">Drop your file here or click to browse</p>
            <p className="text-xs text-muted-foreground">Supports PDF, PNG, JPG · Max 5MB</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="application/pdf,image/png,image/jpeg" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>

      {/* Step progress */}
      {isBusy && (
        <div className="flex items-center justify-between px-1">
          {STEPS.map(({ key, label }, i) => {
            const done = completedSteps.includes(key);
            const active = step === key;
            return (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  done ? 'bg-primary text-white' : active ? 'bg-primary/20 text-primary border border-primary' : 'bg-border text-muted-foreground'
                }`}>
                  {done ? <Check className="w-3 h-3" /> : active ? <Loader2 className="w-3 h-3 animate-spin" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:inline ${active ? 'text-foreground font-medium' : done ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`w-4 sm:w-8 h-px mx-1 ${done ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={!file || isBusy}
        onClick={handleUpload}
      >
        {stepLabel}
      </button>
    </div>
  );
};

export default UploadBox;
