import { useUser as useClerkUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Bell, ShieldAlert, Edit } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProfileDropdown from '../components/auth/ProfileDropdown';
import PassportQR from '../components/PassportQR';
import { useUser } from '../hooks/useUser';
import { usePassport } from '../hooks/usePassport';
import { Medicine } from '../types';

const COMING_SOON = 'Coming soon — full editing available after backend integration.';

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-border rounded ${className}`} />
);

const Dashboard = () => {
  const { user: clerkUser } = useClerkUser();
  const clerkId = clerkUser?.id;

  const { data: profile, isLoading: profileLoading, isError: profileError } = useUser(clerkId);

  // Dependent query — only fires once profile has resolved
  const { data: passport, isLoading: passportLoading, isError: passportError } = usePassport(
    profileLoading ? undefined : profile?.id
  );

  const isLoading = profileLoading || (!!profile?.id && passportLoading);
  const isError = profileError || passportError;

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

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
            <button className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
            <ProfileDropdown initials={initials} />
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isError && (
          <div className="card-alert mb-6">
            <p className="text-destructive text-sm">Failed to load your data. Please refresh.</p>
          </div>
        )}

        {/* Greeting */}
        <div className="mb-8">
          {isLoading
            ? <Skeleton className="h-9 w-64 mb-2" />
            : <h1 className="text-[32px] font-bold text-dark mb-2">Good morning, {firstName}!</h1>
          }

          <div className="flex items-center gap-3 mb-4">
            {isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <>
                <span className="text-sm text-muted-foreground">
                  Your passport is {passport?.completion_percent ?? 0}% complete
                </span>
                <div className="flex-1 max-w-xs h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${passport?.completion_percent ?? 0}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary text-sm" onClick={() => toast.info(COMING_SOON)}>+ Add Medicine</button>
            <Link to="/dashboard/upload" className="btn-secondary text-sm">+ Upload Report</Link>
            <button className="btn-secondary text-sm" onClick={() => document.getElementById('qr-card')?.scrollIntoView({ behavior: 'smooth' })}>View QR</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main */}
          <div className="lg:col-span-8 space-y-6">

            {/* Personal Info */}
            <div className="card-base">
              <h3 className="mb-4">Personal Information</h3>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : !profile ? (
                <p className="text-sm text-muted-foreground">No profile found.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-semibold">{profile.full_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p className="font-semibold">{profile.date_of_birth ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gender</p>
                    <p className="font-semibold capitalize">{profile.gender ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Blood Group</p>
                    {passport?.blood_group
                      ? <span className="badge-blood">{passport.blood_group}</span>
                      : <p className="font-semibold">—</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Allergies */}
            <div className="card-alert">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                <h3 className="text-destructive">Allergies</h3>
              </div>
              {isLoading ? (
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ) : !passport?.allergies?.length ? (
                <p className="text-sm text-muted-foreground mb-3">No allergies recorded.</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-3">
                  {passport.allergies.map((a: string) => <span key={a} className="badge-allergy">{a}</span>)}
                </div>
              )}
              <button className="btn-ghost text-sm" onClick={() => toast.info(COMING_SOON)}>+ Add Allergy</button>
            </div>

            {/* Conditions */}
            <div className="card-base">
              <h3 className="mb-4">Chronic Conditions</h3>
              {isLoading ? (
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-28" />
                </div>
              ) : !passport?.conditions?.length ? (
                <p className="text-sm text-muted-foreground mb-3">No conditions recorded.</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-3">
                  {passport.conditions.map((c: string) => <span key={c} className="badge-condition">{c}</span>)}
                </div>
              )}
              <button className="btn-ghost text-sm" onClick={() => toast.info(COMING_SOON)}>+ Add Condition</button>
            </div>

            {/* Medicines */}
            <div>
              <h3 className="mb-4">Current Medicines</h3>
              {isLoading ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
              ) : !passport?.medicines?.length ? (
                <p className="text-sm text-muted-foreground">No medicines recorded.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {passport.medicines.map((m: Medicine) => (
                    <div key={m.id} className="card-base card-hover relative">
                      <button
                        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                        onClick={() => toast.info(COMING_SOON)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <span className="badge-medicine mb-2 inline-block">{m.name}</span>
                      <p className="font-semibold text-dark">{m.name}</p>
                      <p className="text-sm text-muted-foreground">{m.dosage} · {m.frequency}</p>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn-secondary text-sm mt-4" onClick={() => toast.info(COMING_SOON)}>+ Add Medicine</button>
            </div>
          </div>

          {/* Sidebar QR */}
          <div className="lg:col-span-4">
            <div id="qr-card" className="card-base text-center sticky top-24">
              <h3 className="mb-4">Your Health Passport QR</h3>
              {isLoading ? (
                <Skeleton className="w-48 h-48 mx-auto mb-4" />
              ) : !passport ? (
                <p className="text-sm text-muted-foreground">No passport created yet.</p>
              ) : (
                <PassportQR passportCode={passport.passport_code} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
