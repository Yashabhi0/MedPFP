import { useRef, useState, useEffect } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';

interface ProfileDropdownProps {
  /** Two-letter initials shown in the avatar */
  initials: string;
  /** Avatar background colour — defaults to the app primary */
  color?: string;
}

const ProfileDropdown = ({ initials, color = '#E8C9A8' }: ProfileDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    setOpen(false);
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          borderRadius: '999px',
          outline: 'none',
        }}
        aria-label="Profile menu"
        aria-expanded={open}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: color,
          color: '#2E2E2E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.02em',
          boxShadow: open ? '0 0 0 2px #D8A17A' : '0 0 0 2px transparent',
          transition: 'box-shadow 0.15s',
        }}>
          {initials}
        </div>
        <ChevronDown style={{
          width: '12px',
          height: '12px',
          color: '#6b7280',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.18s ease',
        }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          minWidth: '200px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
          zIndex: 100,
          overflow: 'hidden',
          animation: 'dropdownIn 0.15s ease',
        }}>
          {/* User info header */}
          {user?.primaryEmailAddress && (
            <div style={{
              padding: '12px 14px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A', marginBottom: '2px' }}>
                {user.firstName ?? initials}
              </p>
              <p style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.primaryEmailAddress.emailAddress}
              </p>
            </div>
          )}

          {/* Logout */}
          <div style={{ padding: '6px' }}>
            <button
              onClick={handleLogout}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                background: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                color: loading ? '#94A3B8' : '#EF4444',
                textAlign: 'left',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#FEF2F2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <LogOut style={{ width: '14px', height: '14px', flexShrink: 0 }} />
              {loading ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
};

export default ProfileDropdown;
