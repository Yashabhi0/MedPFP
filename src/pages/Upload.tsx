import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import ProfileDropdown from '../components/auth/ProfileDropdown';
import UploadBox from '../components/UploadBox';
import { Bell } from 'lucide-react';

type UploadState = 'idle' | 'processing' | 'success';

const Upload = () => {
  const { user: clerkUser } = useClerkUser();
  const initials = clerkUser?.fullName
    ? clerkUser.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';
  const [state, setState] = useState<UploadState>('idle');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['passport'] });
    setState('success');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        initialFloating={true}
        links={[
          { label: 'My Passport', to: '/dashboard' },
          { label: 'Upload Documents', to: '/dashboard/upload' },
        ]}
        rightContent={
          <div className="flex items-center gap-3">
            <button className="relative"><Bell className="w-5 h-5 text-muted-foreground" /></button>
            <ProfileDropdown initials={initials} />
          </div>
        }
      />

      <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Upload Documents</h1>

        {/* Upload Zone */}
        {state === 'idle' && (
          <UploadBox
            onFileSelect={() => setState('processing')}
            onComplete={handleComplete}
          />
        )}

        {/* Processing */}
        {state === 'processing' && (
          <div className="card-upload text-center py-12">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="font-semibold text-dark">Processing your document...</p>
            <p className="text-xs text-muted-foreground mt-2">This may take a moment</p>
          </div>
        )}

        {/* Success */}
        {state === 'success' && (
          <div className="card-base text-center py-12">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-primary mb-2">Passport Updated!</h2>
            <p className="text-muted-foreground mb-6">Your report has been processed and saved.</p>
            <button className="btn-primary inline-block" onClick={() => navigate('/dashboard')}>View My Passport</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
