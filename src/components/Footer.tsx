import { HeartPulse } from 'lucide-react';

const Footer = () => (
  <footer className="bg-dark text-dark-foreground py-12 px-4">
    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
      <div>
        <div className="flex items-center gap-2 font-bold text-lg mb-2">
          <HeartPulse className="w-5 h-5" />
          Health Passport
        </div>
        <p className="text-sm opacity-70">One QR code. Ten seconds. A doctor knows everything.</p>
      </div>
      <div className="flex flex-col gap-2 text-sm opacity-80">
        <a href="#" className="hover:opacity-100">About</a>
        <a href="#" className="hover:opacity-100">How It Works</a>
        <a href="#" className="hover:opacity-100">Privacy</a>
        <a href="#" className="hover:opacity-100">Contact</a>
      </div>
      <div className="text-sm opacity-80 md:text-right">
        <p>Made for India 🇮🇳</p>
      </div>
    </div>
    <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-white/20 text-center text-xs opacity-50">
      © 2025 Health Passport. Built at Hackathon.
    </div>
  </footer>
);

export default Footer;
