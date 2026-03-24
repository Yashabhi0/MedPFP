import { useState } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Bell, ShieldAlert, X, Plus, Check, Pencil } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProfileDropdown from '../components/auth/ProfileDropdown';
import PassportQR from '../components/PassportQR';
import { useUser, useUpdateUser } from '../hooks/useUser';
import { usePassport, useUpsertPassport } from '../hooks/usePassport';
import { useSeedDemoData } from '../hooks/useSeedDemoData';
import { Medicine } from '../types';

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-border rounded ${className}`} />
);

// ── Reusable tag list with inline add/remove ──────────────────────────────
const TagList = ({
  items, badge, placeholder, onAdd, onRemove, disabled,
}: {
  items: string[];
  badge: string;
  placeholder: string;
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  disabled?: boolean;
}) => {
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);

  const commit = () => {
    const v = input.trim();
    if (v && !items.includes(v)) onAdd(v);
    setInput('');
    setAdding(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item) => (
          <span key={item} className={`${badge} flex items-center gap-1`}>
            {item}
            <button onClick={() => onRemove(item)} disabled={disabled} className="hover:opacity-70 ml-1">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">None recorded.</p>
        )}
      </div>

      {adding ? (
        <div className="flex gap-2 items-center">
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setAdding(false); }}
            placeholder={placeholder}
            className="flex-1 max-w-xs px-3 py-1.5 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button onClick={commit} className="btn-primary text-xs px-4 py-1.5">Add</button>
          <button onClick={() => setAdding(false)} className="btn-ghost text-xs">Cancel</button>
        </div>
      ) : (
        <button className="btn-ghost text-sm flex items-center gap-1" onClick={() => setAdding(true)}>
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      )}
    </div>
  );
};

// ── Medicine add form ─────────────────────────────────────────────────────
const MedicineForm = ({ onAdd, onCancel }: { onAdd: (m: Omit<Medicine, 'id'>) => void; onCancel: () => void }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), dosage: dosage.trim(), frequency: frequency.trim() });
  };

  const field = "px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 w-full";

  return (
    <div className="card-base mt-3 max-w-sm">
      <p className="text-sm font-semibold mb-3">New Medicine</p>
      <div className="space-y-2 mb-3">
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Medicine name *" className={field} />
        <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosage (e.g. 500 mg)" className={field} />
        <input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="Frequency (e.g. Twice daily)" className={field} />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} className="btn-primary text-xs px-4 py-1.5">Add</button>
        <button onClick={onCancel} className="btn-ghost text-xs">Cancel</button>
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user: clerkUser } = useClerkUser();
  const clerkId    = clerkUser?.id;
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  const clerkName  = clerkUser?.fullName ?? clerkUser?.firstName ?? '';

  const { data: profile, isLoading: profileLoading, isError: profileError } = useUser(clerkId, clerkName, clerkEmail);
  const { data: passport, isLoading: passportLoading, isError: passportError } = usePassport(
    profileLoading ? undefined : profile?.id
  );

  const updateUser     = useUpdateUser(clerkId ?? '');
  const upsertPassport = useUpsertPassport(profile?.id);

  // Seed demo data for the demo account (no-op for all other users)
  useSeedDemoData(clerkEmail, clerkId, profile, passport);

  const isLoading = profileLoading || (!!profile?.id && passportLoading);
  const isError   = profileError || passportError;

  const initials  = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  // ── Personal info edit state ────────────────────────────────────────────
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ full_name: '', date_of_birth: '', gender: '', blood_group: '' });

  const openInfoEdit = () => {
    setInfoForm({
      full_name:    profile?.full_name ?? '',
      date_of_birth: profile?.date_of_birth ?? '',
      gender:       profile?.gender ?? '',
      blood_group:  passport?.blood_group ?? '',
    });
    setEditingInfo(true);
  };

  const saveInfo = async () => {
    try {
      await updateUser.mutateAsync({
        full_name:     infoForm.full_name || undefined,
        date_of_birth: infoForm.date_of_birth || undefined,
        gender:        (infoForm.gender as 'male' | 'female' | 'other') || undefined,
      });
      await upsertPassport.mutateAsync({ blood_group: infoForm.blood_group || undefined });
      toast.success('Profile updated');
      setEditingInfo(false);
    } catch {
      toast.error('Failed to save — please try again');
    }
  };

  // ── Tag list save helpers ───────────────────────────────────────────────
  const savePassportField = async (field: 'allergies' | 'conditions', value: string[]) => {
    try {
      await upsertPassport.mutateAsync({ [field]: value });
      toast.success('Saved');
    } catch {
      toast.error('Failed to save');
    }
  };

  const saveMedicines = async (medicines: Medicine[]) => {
    try {
      await upsertPassport.mutateAsync({ medicines });
      toast.success('Saved');
    } catch {
      toast.error('Failed to save');
    }
  };

  // ── Medicine add state ──────────────────────────────────────────────────
  const [addingMedicine, setAddingMedicine] = useState(false);

  const inputCls = "px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 w-full";

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        initialFloating={true}
        links={[
          { label: 'My Passport', to: '/dashboard' },
          { label: 'Upload Documents', to: '/dashboard/upload' },
          { label: 'Nearby Doctors', to: '/doctors' },
        ]}
        rightContent={
          <div className="flex items-center gap-3">
            <button className="relative"><Bell className="w-5 h-5 text-muted-foreground" /></button>
            <ProfileDropdown initials={initials} />
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isError && (
          <div className="card-alert mb-6">
            <p className="text-destructive text-sm">Failed to load your data. Please refresh.</p>
          </div>
        )}

        {/* Greeting */}
        <div className="mb-8">
          {isLoading
            ? <Skeleton className="h-9 w-64 mb-2" />
            : <h1 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-dark mb-2">Good morning, {firstName}!</h1>
          }
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {isLoading ? <Skeleton className="h-4 w-48" /> : (
              <>
                <span className="text-sm text-muted-foreground">
                  Your passport is {passport?.completion_percent ?? 0}% complete
                </span>
                <div className="flex-1 min-w-[80px] max-w-xs h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${passport?.completion_percent ?? 0}%` }} />
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary text-sm w-full sm:w-auto" onClick={() => setAddingMedicine(true)}>+ Add Medicine</button>
            <Link to="/dashboard/upload" className="btn-secondary text-sm w-full sm:w-auto text-center">+ Upload Report</Link>
            <button className="btn-secondary text-sm w-full sm:w-auto" onClick={() => document.getElementById('qr-card')?.scrollIntoView({ behavior: 'smooth' })}>View QR</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 space-y-6">

            {/* ── Personal Information ── */}
            <div className="card-base relative">
              <div className="flex items-center justify-between mb-4">
                <h3>Personal Information</h3>
                {!editingInfo && !isLoading && profile && (
                  <button onClick={openInfoEdit} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : !profile ? (
                <p className="text-sm text-muted-foreground">No profile found.</p>
              ) : editingInfo ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                      <input value={infoForm.full_name} onChange={e => setInfoForm(f => ({ ...f, full_name: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Date of Birth</label>
                      <input type="date" value={infoForm.date_of_birth} onChange={e => setInfoForm(f => ({ ...f, date_of_birth: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                      <select value={infoForm.gender} onChange={e => setInfoForm(f => ({ ...f, gender: e.target.value }))} className={inputCls}>
                        <option value="">—</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Blood Group</label>
                      <select value={infoForm.blood_group} onChange={e => setInfoForm(f => ({ ...f, blood_group: e.target.value }))} className={inputCls}>
                        <option value="">—</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveInfo} disabled={updateUser.isPending || upsertPassport.isPending} className="btn-primary text-sm flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      {updateUser.isPending ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => setEditingInfo(false)} className="btn-secondary text-sm">Cancel</button>
                  </div>
                </div>
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

            {/* ── Allergies ── */}
            <div className="card-alert">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                <h3 className="text-destructive">Allergies</h3>
              </div>
              {isLoading ? (
                <div className="flex gap-2"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-24" /></div>
              ) : (
                <TagList
                  items={passport?.allergies ?? []}
                  badge="badge-allergy"
                  placeholder="e.g. Penicillin"
                  disabled={upsertPassport.isPending}
                  onAdd={v => savePassportField('allergies', [...(passport?.allergies ?? []), v])}
                  onRemove={v => savePassportField('allergies', (passport?.allergies ?? []).filter(a => a !== v))}
                />
              )}
            </div>

            {/* ── Conditions ── */}
            <div className="card-base">
              <h3 className="mb-4">Chronic Conditions</h3>
              {isLoading ? (
                <div className="flex gap-2"><Skeleton className="h-6 w-32" /><Skeleton className="h-6 w-28" /></div>
              ) : (
                <TagList
                  items={passport?.conditions ?? []}
                  badge="badge-condition"
                  placeholder="e.g. Type 2 Diabetes"
                  disabled={upsertPassport.isPending}
                  onAdd={v => savePassportField('conditions', [...(passport?.conditions ?? []), v])}
                  onRemove={v => savePassportField('conditions', (passport?.conditions ?? []).filter(c => c !== v))}
                />
              )}
            </div>

            {/* ── Medicines ── */}
            <div className="card-base">
              <div className="flex items-center justify-between mb-4">
                <h3>Current Medicines</h3>
                <button onClick={() => setAddingMedicine(true)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
              ) : !passport?.medicines?.length && !addingMedicine ? (
                <p className="text-sm text-muted-foreground">No medicines recorded.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(passport?.medicines ?? []).map((m: Medicine) => (
                    <div key={m.id} className="card-base card-hover relative">
                      <button
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => saveMedicines((passport?.medicines ?? []).filter(x => x.id !== m.id))}
                        disabled={upsertPassport.isPending}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="badge-medicine mb-2 inline-block">{m.name}</span>
                      <p className="font-semibold text-dark">{m.name}</p>
                      <p className="text-sm text-muted-foreground">{m.dosage}{m.frequency ? ` · ${m.frequency}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}

              {addingMedicine && (
                <MedicineForm
                  onCancel={() => setAddingMedicine(false)}
                  onAdd={(m) => {
                    const newMed: Medicine = { ...m, id: crypto.randomUUID() };
                    saveMedicines([...(passport?.medicines ?? []), newMed]);
                    setAddingMedicine(false);
                  }}
                />
              )}
            </div>

          </div>

          {/* ── Sidebar QR ── */}
          <div className="lg:col-span-4 order-first lg:order-none">
            <div id="qr-card" className="card-base text-center lg:sticky lg:top-24">
              <h3 className="mb-4">Your Health Passport QR</h3>
              {!clerkId ? (
                <Skeleton className="w-48 h-48 mx-auto mb-4" />
              ) : !passport ? (
                <p className="text-sm text-muted-foreground">Generate your passport to get a QR code.</p>
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
