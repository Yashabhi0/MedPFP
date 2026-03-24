import QRCode from 'qrcode.react';

interface PassportQRProps {
  passportCode: string;
  size?: number;
}

const PassportQR = ({ passportCode, size = 192 }: PassportQRProps) => {
  const url = `${window.location.origin}/passport/${passportCode}`;

  const handleDownload = () => {
    const canvas = document.getElementById('passport-qr') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `health-passport-${passportCode}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <QRCode
        id="passport-qr"
        value={url}
        size={size}
        level="H"
        includeMargin
        renderAs="canvas"
      />
      <p className="font-mono text-lg font-bold">{passportCode}</p>
      <button
        onClick={handleDownload}
        className="btn-secondary text-sm w-full"
      >
        Download QR
      </button>
      <p className="text-xs text-muted-foreground text-center">
        Show this to any doctor for instant access
      </p>
    </div>
  );
};

export default PassportQR;
