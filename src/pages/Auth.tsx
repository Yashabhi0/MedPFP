import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useUser, useSignIn } from '@clerk/clerk-react';
import { Mail, Lock, Eye, EyeOff, Stethoscope, User } from 'lucide-react';
import { UserRole } from '@/types';

const Auth = () => {
  const [role, setRole] = useState<UserRole>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signIn } = useSignIn();
  const navigate = useNavigate();

  // Task 6 + 8 — auto-redirect if already signed in, no flash
  useEffect(() => {
    if (!authLoaded || !isSignedIn || !user) return;
    const existingRole = (user.unsafeMetadata?.role ?? 'patient') as UserRole;
    navigate(existingRole === 'doctor' ? '/doctor' : '/dashboard', { replace: true });
  }, [authLoaded, isSignedIn, user, navigate]);

  // Task 8 — show nothing until Clerk has resolved auth state
  if (!authLoaded) return null;

  // Task 4 — already signed in: redirect is handled by useEffect above,
  // return null here to prevent the auth form from flashing
  if (isSignedIn) return null;

  const handleGoogleSignIn = async () => {
    if (!signIn) return;
    try {
      setGoogleLoading(true);
      localStorage.setItem('selectedRole', role);
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        // redirectUrl      → where Clerk sends the browser after Google returns
        //                    must match an Allowed Redirect URL in Clerk Dashboard
        redirectUrl: '/sso-callback',
        // redirectUrlComplete → where to go after the Clerk session is established
        //                       ?ready=1 tells SSOCallback to skip the handshake
        //                       and go straight to role-based routing
        redirectUrlComplete: '/sso-callback?ready=1',
      });
    } catch (err) {
      console.error('Google OAuth error:', err);
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* ── LEFT — Hero ── */}
      <div style={{
        flex: '0 0 58%',
        position: 'relative',
        overflow: 'hidden',
        background: '#8FA7B0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 52px',
      }}
        className="hidden md:flex"
      >
        {/* Background blobs — white only, low opacity */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-120px',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '25%',
          width: '500px', height: '260px',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 65%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px',
            }}>🩺</div>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '15px', letterSpacing: '-0.01em' }}>
              Health Passport
            </span>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            color: 'white',
            fontSize: 'clamp(30px, 3.2vw, 44px)',
            fontWeight: '800',
            lineHeight: '1.15',
            letterSpacing: '-0.02em',
            marginBottom: '20px',
          }}>
            Your health history,<br />always in your hands.
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: '16px',
            lineHeight: '1.6',
            fontWeight: '400',
          }}>
            One scan. Any doctor. Instant context.
          </p>
        </div>

        {/* Trust line */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', fontWeight: '500' }}>
            Trusted by 2,500+ patients across India
          </p>
        </div>
      </div>

      {/* ── RIGHT — Auth Form ── */}
      <div style={{
        flex: 1,
        background: '#F8F9FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* Title */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B' }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Role toggle */}
          <div style={{
            display: 'flex',
            background: '#E2E8F0',
            borderRadius: '10px',
            padding: '3px',
            marginBottom: '24px',
          }}>
            {(['patient', 'doctor'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  background: role === r ? '#FFFFFF' : 'transparent',
                  color: role === r ? '#0F172A' : '#64748B',
                  boxShadow: role === r ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {r === 'patient'
                  ? <User style={{ width: '13px', height: '13px' }} />
                  : <Stethoscope style={{ width: '13px', height: '13px' }} />
                }
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
                width: '15px', height: '15px', color: '#94A3B8', pointerEvents: 'none',
              }} />
              <input
                type="email"
                placeholder="Email address"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  fontSize: '13.5px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '9px',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#0D9488';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.12)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569' }}>Password</label>
                <a href="#" style={{ fontSize: '12px', color: '#0D9488', textDecoration: 'none', fontWeight: '500' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
                  width: '15px', height: '15px', color: '#94A3B8', pointerEvents: 'none',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 38px',
                    fontSize: '13.5px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '9px',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#0D9488';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.12)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    color: '#94A3B8', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword
                    ? <EyeOff style={{ width: '15px', height: '15px' }} />
                    : <Eye style={{ width: '15px', height: '15px' }} />
                  }
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '9px',
                border: 'none',
                background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '2px',
                transition: 'opacity 0.15s, transform 0.15s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Sign in →
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            <span style={{ fontSize: '12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '9px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: '13.5px',
              fontWeight: '500',
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: googleLoading ? 0.7 : 1,
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { if (!googleLoading) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
          >
            {googleLoading ? (
              <span style={{ fontSize: '13px', color: '#64748B' }}>Redirecting...</span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Signup link */}
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', marginTop: '24px' }}>
            Don't have an account?{' '}
            <Link to="/" style={{ color: '#0D9488', fontWeight: '600', textDecoration: 'none' }}>
              Create one free →
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Auth;
