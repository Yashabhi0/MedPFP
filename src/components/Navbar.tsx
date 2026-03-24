import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartPulse, Menu, X } from 'lucide-react';

interface NavbarProps {
  links?: { label: string; to: string }[];
  rightContent?: React.ReactNode;
}

const Navbar = ({ links = [], rightContent }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 h-16 bg-card border-b border-border flex items-center px-4 md:px-8">
      <Link to="/" className="flex items-center gap-2 font-bold text-primary text-lg shrink-0">
        <HeartPulse className="w-6 h-6" />
        <span>Health Passport</span>
      </Link>

      {links.length > 0 && (
        <div className="hidden md:flex items-center gap-6 mx-auto">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-semibold transition-colors pb-1 ${
                location.pathname === link.to
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:flex items-center gap-3">{rightContent}</div>
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border p-4 flex flex-col gap-4 md:hidden animate-fade-in-up z-50">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-semibold ${
                location.pathname === link.to ? 'text-primary' : 'text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3">{rightContent}</div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
