import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (value: string) => void;
  onCameraError?: (denied: boolean) => void;
}

const SCANNER_ID = 'qr-scanner-viewport';

const QRScanner = ({ onScan, onCameraError }: QRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const firedRef = useRef(false);

  const [active, setActive] = useState(false);       // camera is running
  const [detected, setDetected] = useState(false);   // QR found
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // ── Safe stop ────────────────────────────────────────────────────────────
  const stopScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      const state = scannerRef.current.getState();
      // State 2 = SCANNING, State 3 = PAUSED
      if (state === 2 || state === 3) {
        await scannerRef.current.stop();
      }
      scannerRef.current.clear();
    } catch {
      // already stopped — ignore
    }
    scannerRef.current = null;
    setActive(false);
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  // ── Start on button click ────────────────────────────────────────────────
  const startScanner = async () => {
    setError(null);
    setDetected(false);
    firedRef.current = false;
    setStarting(true);

    // Ensure the viewport div is in the DOM before initialising
    await new Promise(r => setTimeout(r, 50));

    try {
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (firedRef.current) return;
          firedRef.current = true;
          setDetected(true);
          stopScanner();
          onScan(decodedText);
        },
        () => { /* per-frame misses — ignore */ }
      );

      setActive(true);
    } catch (err) {
      const msg = String(err).toLowerCase();
      const isDenied = msg.includes('permission') || msg.includes('notallowed');
      const friendly = isDenied
        ? 'Camera access denied. Use upload or enter code below.'
        : 'Scanner unavailable. Use upload or enter code below.';
      setError(friendly);
      onCameraError?.(isDenied);
      scannerRef.current = null;
    } finally {
      setStarting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>

      {/* Viewport — always in DOM so html5-qrcode can find it */}
      <div style={{ position: 'relative', width: '280px', height: active || detected ? '280px' : '0px', overflow: 'hidden', transition: 'height 0.2s ease' }}>
        <div
          id={SCANNER_ID}
          style={{ width: '280px', height: '280px', borderRadius: '16px', overflow: 'hidden', background: '#111827' }}
        />

        {/* Corner brackets */}
        {active && !detected && (
          <>
            <div style={{ position: 'absolute', top: 16, left: 16, width: 36, height: 36, borderTop: '2.5px solid #E8C9A8', borderLeft: '2.5px solid #E8C9A8', borderRadius: '4px 0 0 0', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderTop: '2.5px solid #E8C9A8', borderRight: '2.5px solid #E8C9A8', borderRadius: '0 4px 0 0', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 16, left: 16, width: 36, height: 36, borderBottom: '2.5px solid #E8C9A8', borderLeft: '2.5px solid #E8C9A8', borderRadius: '0 0 0 4px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 16, right: 16, width: 36, height: 36, borderBottom: '2.5px solid #E8C9A8', borderRight: '2.5px solid #E8C9A8', borderRadius: '0 0 4px 0', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: 16, right: 16, height: '2px', top: '50%', background: 'linear-gradient(90deg, transparent, #E8C9A8, transparent)', animation: 'scanline 2s ease-in-out infinite', pointerEvents: 'none' }} />
          </>
        )}

        {detected && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#4ade80', fontWeight: 600, fontSize: '14px' }}>✓ QR Detected</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {!active && !detected && (
        <button
          className="btn-secondary text-sm"
          disabled={starting}
          onClick={startScanner}
        >
          {starting ? 'Starting camera…' : '📷 Start Scanner'}
        </button>
      )}

      {active && (
        <button className="btn-ghost text-xs" onClick={stopScanner}>
          Stop Scanner
        </button>
      )}

      {error && (
        <p style={{ fontSize: '12px', color: '#EF4444', textAlign: 'center', maxWidth: '260px', lineHeight: 1.5 }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default QRScanner;
