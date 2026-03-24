import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

const RoleGuard = ({ children, requiredRole }: RoleGuardProps) => {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return null;
  }

  const role = user?.publicMetadata?.role as UserRole | undefined;

  if (role && role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default RoleGuard;
