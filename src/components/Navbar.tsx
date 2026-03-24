import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartPulse, Menu, X } from 'lucide-react';

interface NavbarProps {
  links?: { label: string; to: string }[];
  rightContent?: React.ReactNode;
  transparent?: boolean;
  initialFloating?: boolean;
}

const Navbar = ({ links = [], rightContent, transparent = false, initialFloating = false }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(initialFloating);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (initialFloating) return; // already in floated state, no listener needed
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialFloating]);

  // Transparent mode: used on landing page hero
  // Scrolled state: floating pill navbar
  const isTransparent = transparent && !scrolled;

  return (
    <>
      {/* Spacer — only when NOT transparent so content isn't hidden under navbar */}
      {!transparent && <div className="h-16" />}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'top-3 left-4 right-4 md:left-8 md:right-8'
            : 'top-0 left-0 right-0'
        }`}
      >
        <div
          className={`flex items-center px-4 md:px-6 transition-all duration-300 ${
            scrolled
              ? 'h-14 rounded-2xl shadow-xl border'
              : 'h-16'
          } ${
            isTransparent
              ? 'bg-transparent border-transparent'
              : scrolled
              ? 'border-white/20'
              : 'bg-card border-b border-border'
          }`}
          style={
            scrolled
              ? {
                  backgroundColor: 'rgba(242, 237, 230, 0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }
              : isTransparent
              ? {}
              : {}
          }
        >
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-2 font-bold text-lg shrink-0 transition-colors duration-300 ${
              isTransparent ? 'text-white' : 'text-foreground'
            }`}
          >
            <HeartPulse className="w-5 h-5" style={{ color: isTransparent ? 'white' : '#A8643E' }} />
            <span>MedPFP</span>
          </Link>

          {/* Center links */}
          {links.length > 0 && (
            <div className="hidden md:flex items-center gap-6 mx-auto">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-semibold transition-all pb-1 ${
                    location.pathname === link.to
                      ? isTransparent
                        ? 'text-white border-b-2 border-white'
                        : 'border-b-2 text-foreground'
                      : isTransparent
                      ? 'text-white/70 hover:text-white'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                  style={
                    location.pathname === link.to && !isTransparent
                      ? { borderColor: '#A8643E', color: '#A8643E' }
                      : {}
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right content — always visible; hamburger only shown when there are links */}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-3">{rightContent}</div>
            {links.length > 0 && (
              <button
                className={`md:hidden p-1 transition-colors ${
                  isTransparent ? 'text-white' : 'text-foreground'
                }`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            className="md:hidden mt-2 rounded-2xl border border-white/20 p-4 flex flex-col gap-4 animate-fade-in-up"
            style={{
              backgroundColor: 'rgba(242, 237, 230, 0.95)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-foreground/80 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div
              className="flex flex-col gap-3 pt-3"
              style={{ borderTop: '1px solid #D9D1C7' }}
              onClick={() => setMobileOpen(false)}
            >
              {rightContent}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
