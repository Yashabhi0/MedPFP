import { useParams } from 'react-router-dom';
import { usePassportByCode } from '@/hooks/usePassport';
import { Passport as PassportType } from '@/types';

const DEMO: PassportType = {
  id: 'demo',
  user_id: 'demo',
  passport_code: 'demo',
  blood_group: 'O+',
  allergies: ['Penicillin', 'Peanuts'],
  conditions: ['Type 2 Diabetes', 'Hypertension'],
  medicines: [
    { id: '1', name: 'Metformin', dosage: '500 mg', frequency: 'Twice daily' },
    { id: '2', name: 'Lisinopril', dosage: '10 mg', frequency: 'Once daily' },
  ],
  lab_values: [
    { id: '1', name: 'HbA1c', value: '7.2', unit: '%', date: '2025-11-01' },
  ],
  emergency_contact: { name: 'Jane Doe', relationship: 'Spouse', phone: '+1 555-0100' },
  ai_summary: 'Patient has well-controlled Type 2 Diabetes and mild Hypertension.',
  completion_percent: 90,
  updated_at: new Date().toISOString(),
};

const Passport = () => {
  const { passportCode } = useParams<{ passportCode: string }>();
  const isDemo = passportCode === 'demo';
  const { data, isLoading, isError } = usePassportByCode(isDemo ? undefined : passportCode);
  const passport: PassportType | null | undefined = isDemo ? DEMO : data;

  if (!isDemo && isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading passport…</div>;
  if (!isDemo && isError) return <div style={{ padding: 40, textAlign: 'center' }}>Error loading passport.</div>;
  if (!passport) return <div style={{ padding: 40, textAlign: 'center' }}>Patient not found: {passportCode}</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '32px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Patient Record</h1>
          {passport.blood_group && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '8px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: '#EF4444', fontWeight: 600, textTransform: 'uppercase' }}>Blood</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#DC2626' }}>{passport.blood_group}</p>
            </div>
          )}
        </div>

        {passport.ai_summary && (
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '16px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>AI Summary</p>
            <p style={{ fontSize: 13, color: '#1E40AF', lineHeight: 1.6 }}>{passport.ai_summary}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>Conditions</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {passport.conditions.length > 0
                ? passport.conditions.map((c, i) => <span key={i} style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, padding: '3px 10px', borderRadius: 999 }}>{c}</span>)
                : <span style={{ fontSize: 12, color: '#9CA3AF' }}>None recorded</span>}
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>Allergies</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {passport.allergies.length > 0
                ? passport.allergies.map((a, i) => <span key={i} style={{ background: '#FFF7ED', color: '#C2410C', fontSize: 12, padding: '3px 10px', borderRadius: 999 }}>{a}</span>)
                : <span style={{ fontSize: 12, color: '#9CA3AF' }}>None recorded</span>}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>Medicines</p>
          {passport.medicines.length > 0
            ? passport.medicines.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#F9FAFB', borderRadius: 8, marginBottom: 6 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</p>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>{m.dosage}</p>
                  </div>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{m.frequency}</span>
                </div>
              ))
            : <p style={{ fontSize: 12, color: '#9CA3AF' }}>No medicines recorded</p>}
        </div>

        {passport.emergency_contact && (
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 14, padding: '16px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>Emergency Contact</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{passport.emergency_contact.name}</p>
                <p style={{ fontSize: 12, color: '#6B7280' }}>{passport.emergency_contact.relationship}</p>
              </div>
              <a href={`tel:${passport.emergency_contact.phone}`} style={{ fontSize: 13, fontWeight: 600, color: '#EA580C' }}>
                {passport.emergency_contact.phone}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Passport;
