import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { uploadReport } from '../lib/api/upload';
import { createReport } from '../lib/api/reports';
import { extractTextFromFile } from '../lib/parser';
import { parseMedicalText } from '../lib/api/ai';
import { updatePassportData } from '../lib/api/passport';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

interface UploadBoxProps {
  onFileSelect?: (file: File) => void;
  onComplete?: () => void;
}

const UploadBox = ({ onFileSelect, onComplete }: UploadBoxProps) => {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = uploading || saving || extracting || parsing || updating;

  const handleFile = (incoming: File) => {
    if (!ACCEPTED_TYPES.includes(incoming.type)) {
      setError('Invalid file type. Please upload a PDF, PNG, or JPG.');
      setFile(null);
      return;
    }
    setError(null);
    setFile(incoming);
    onFileSelect?.(incoming);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    // Step 1: Upload file
    let fileUrl: string;
    try {
      setUploading(true);
      fileUrl = await uploadReport(file);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploading(false);
      return;
    } finally {
      setUploading(false);
    }

    // Step 2: Save report record
    try {
      setSaving(true);
      await createReport(user.id, fileUrl);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }

    // Step 3: Extract text
    let text: string;
    try {
      setExtracting(true);
      text = await extractTextFromFile(fileUrl);
    } catch (err) {
      console.error('Extraction failed:', err);
      setExtracting(false);
      return;
    } finally {
      setExtracting(false);
    }

    // Step 4: Parse with AI
    let medicalData;
    try {
      setParsing(true);
      medicalData = await parseMedicalText(text);
    } catch (err) {
      console.error('Parsing failed:', err);
      setParsing(false);
      return;
    } finally {
      setParsing(false);
    }

    // Step 5: Update passport in DB
    try {
      setUpdating(true);
      await updatePassportData(user.id, medicalData);
      onComplete?.();
    } catch (err) {
      console.error('DB update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  const buttonLabel = uploading
    ? 'Uploading...'
    : saving
    ? 'Saving...'
    : extracting
    ? 'Extracting...'
    : parsing
    ? 'Parsing...'
    : updating
    ? 'Updating...'
    : 'Upload Report';

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center py-10 px-4 text-center cursor-pointer hover:border-primary/60 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <UploadCloud className="w-10 h-10 text-primary mb-3" />
        {file ? (
          <p className="text-sm font-medium text-foreground">{file.name}</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground mb-1">
              Drop your file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">Supports PDF, PNG, JPG</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {/* Error */}
      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Upload button */}
      <button
        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={!file || isBusy}
        onClick={handleUpload}
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default UploadBox;
