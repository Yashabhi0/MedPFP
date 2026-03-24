import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import Navbar from '../components/Navbar';
import ProfileDropdown from '../components/auth/ProfileDropdown';
import QRScanner from '../components/QRScanner';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState('');
  const [scanActive, setScanActive] = useState(true);
  const navigatedRef = useRef(false);

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadScanning, setUploadScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraDenied, setCameraDenied] = useState(false);

  // Single entry point for all 3 methods
  const handlePatientAccess = (raw: string) => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    let code = raw.trim();
    try {
      const url = new URL(raw);
      code = url.pathname.split('/').filter(Boolean).pop() ?? raw;
    } catch { /* plain ID, use as-is */ }

    // Persist to doctor's patient list in localStorage
    const existing: string[] = JSON.parse(localStorage.getItem('doctor_patients') ?? '[]');
    if (!existing.includes(code)) {
      localStorage.setItem('doctor_patients', JSON.stringify([code, ...existing]));
    }

    navigate(`/passport/${code}`);
  };

  const handleScan = (raw: string) => {
    setScanActive(false);
    handlePatientAccess(raw);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    handlePatientAccess(code);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setUploadError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadScanning(true);

    try {
      const scanner = new Html5Qrcode('qr-upload-worker');
      const raw = await scanner.scanFile(file, false);
      handlePatientAccess(raw);
    } catch {
      setUploadError('No valid QR code found in this image. Please try another file.');
    } finally {
      setUploadScanning(false);
      // reset so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
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

      <div className="max-w-[600px] mx-auto px-4 py-16">
        <div className="card-base text-center">
          <h2 className="mb-2">Scan Patient QR Code</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Point your camera at the patient's Health Passport QR code
          </p>

          {/* Live camera scanner */}
          <div className="flex justify-center mb-6">
            {scanActive
              ? <QRScanner onScan={handleScan} onCameraError={(denied) => setCameraDenied(denied)} />
              : (
                <div style={{
                  width: '280px', height: '280px',
                  background: '#1f2937', borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <p style={{ color: '#4ade80', fontWeight: '600', fontSize: '14px' }}>✓ QR Detected — redirecting…</p>
                </div>
              )
            }
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Click "Start Scanner" to use your camera, or use the options below.
          </p>

          {/* Camera denied banner — promotes upload as the path forward */}
          {cameraDenied && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '10px', padding: '10px 16px',
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '18px' }}>📷</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626', marginBottom: '2px' }}>Camera access denied</p>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>Use the upload option below to scan a QR image instead.</p>
              </div>
              <button
                className="btn-primary text-xs whitespace-nowrap ml-auto"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload QR
              </button>
            </div>
          )}

          {/* Upload QR image */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or upload QR image</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Hidden worker div required by Html5Qrcode.scanFile */}
          <div id="qr-upload-worker" style={{ display: 'none' }} />

          <div className="flex flex-col items-center gap-3 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              className="btn-secondary text-sm"
              disabled={uploadScanning}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadScanning ? 'Reading QR…' : '📁 Upload QR Image'}
            </button>

            {previewUrl && !uploadScanning && (
              <img
                src={previewUrl}
                alt="Uploaded QR"
                style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
            )}

            {uploadError && (
              <p className="text-xs text-destructive">{uploadError}</p>
            )}
          </div>

          {/* Manual fallback */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or enter code manually</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-3 max-w-sm mx-auto">
            <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="Enter HP-XXXX code"
              className="flex-1 px-4 py-2.5 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              Open Passport
            </button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">No login required for patients</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
