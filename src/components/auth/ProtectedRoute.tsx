import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = '/' }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
