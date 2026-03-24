import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { Bell, CheckCircle, FileText, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProfileDropdown from '../components/auth/ProfileDropdown';
import UploadBox from '../components/UploadBox';
import { useUser } from '../hooks/useUser';
import { usePassport } from '../hooks/usePassport';
import { getReports } from '../lib/api/reports';

const Upload = () => {
  const { user: clerkUser } = useClerkUser();
  const clerkId    = clerkUser?.id;
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  const clerkName  = clerkUser?.fullName ?? '';

  const initials = clerkUser?.fullName
    ? clerkUser.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const { data: profile } = useUser(clerkId, clerkName, clerkEmail);
  const { data: passport } = usePassport(profile?.id);

  const { data: reports, refetch: refetchReports } = useQuery({
    queryKey: ['reports', passport?.id],
    queryFn: () => getReports(passport!.id),
    enabled: !!passport?.id,
  });

  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['passport'] });
    refetchReports();
    setDone(true);
  };

  const ready = !!profile?.id && !!passport?.id;

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

        {!ready ? (
          <div className="card-base text-center py-10 text-muted-foreground text-sm">Loading your passport…</div>
        ) : done ? (
          <div className="card-base text-center py-12">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-primary mb-2">Passport Updated!</h2>
            <p className="text-muted-foreground mb-6">Your report has been processed and saved.</p>
            <div className="flex gap-3 justify-center">
              <button className="btn-primary" onClick={() => navigate('/dashboard')}>View My Passport</button>
              <button className="btn-secondary" onClick={() => setDone(false)}>Upload Another</button>
            </div>
          </div>
        ) : (
          <UploadBox
            profileId={profile.id}
            passportId={passport.id}
            onComplete={handleComplete}
          />
        )}

        {/* Uploaded files list */}
        {reports && reports.length > 0 && (
          <div className="card-base space-y-3">
            <h3 className="text-sm font-semibold">Uploaded Reports</h3>
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{r.file_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.uploaded_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
