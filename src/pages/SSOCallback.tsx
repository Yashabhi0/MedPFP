import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthenticateWithRedirectCallback, useUser } from '@clerk/clerk-react';
import { UserRole } from '@/types';

// Stage 2 — session is live, save role and redirect
const RoleRedirector = () => {
  const { isLoaded, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const run = async () => {
      const stored = localStorage.getItem('selectedRole') as UserRole | null;
      const existingRole = user.unsafeMetadata?.role as UserRole | undefined;

      if (!existingRole && stored) {
        try {
          await user.update({ unsafeMetadata: { role: stored } });
        } catch (err) {
          console.error('Failed to save role:', err);
        }
      }

      localStorage.removeItem('selectedRole');

      const finalRole = existingRole ?? stored ?? 'patient';
      navigate(finalRole === 'doctor' ? '/doctor' : '/dashboard', { replace: true });
    };

    run();
  }, [isLoaded, user, navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <span style={{ fontSize: '14px', color: '#6b7280' }}>Signing you in...</span>
    </div>
  );
};

// Stage 1 — Clerk completes the OAuth handshake, then redirects to /sso-callback?ready=1
// Stage 2 — ?ready=1 is present, skip Clerk callback and run role logic
const SSOCallback = () => {
  const [searchParams] = useSearchParams();
  const isReady = searchParams.get('ready') === '1';

  if (isReady) {
    return <RoleRedirector />;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/sso-callback?ready=1"
        signUpForceRedirectUrl="/sso-callback?ready=1"
      />
    </div>
  );
};

export default SSOCallback;
