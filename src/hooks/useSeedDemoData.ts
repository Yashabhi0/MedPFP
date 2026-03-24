import { useEffect, useRef } from 'react';
import { useUpsertPassport } from './usePassport';
import { useUpdateUser } from './useUser';
import type { Passport, UserProfile } from '@/types';

const DEMO_EMAIL = 'notagoodperson78@gmail.com';

const DEMO_PASSPORT_PATCH = {
  blood_group: 'B+',
  allergies: ['Dust', 'Peanuts'],
  conditions: ['BP'],
  medicines: [
    { id: 'demo-med-1', name: 'LISINOPRIL', dosage: '10 mg', frequency: 'Daily' },
  ],
};

/**
 * Seeds demo data for the specific demo account — runs once per session.
 * Only fires when:
 *   1. The logged-in email matches DEMO_EMAIL
 *   2. Profile and passport have loaded
 *   3. The passport has no allergies yet (idempotency guard)
 */
export function useSeedDemoData(
  email: string | undefined,
  clerkId: string | undefined,
  profile: UserProfile | null | undefined,
  passport: Passport | null | undefined,
) {
  const seededRef = useRef(false);
  const upsertPassport = useUpsertPassport(profile?.id);
  const updateUser = useUpdateUser(clerkId ?? '');

  useEffect(() => {
    if (seededRef.current) return;
    if (email !== DEMO_EMAIL) return;
    if (!profile || passport === undefined) return; // still loading

    // Already seeded — allergies present means we've been here before
    if (passport && passport.allergies.length > 0) {
      seededRef.current = true;
      return;
    }

    seededRef.current = true;

    const seed = async () => {
      try {
        // Ensure display name is set
        if (profile.full_name !== 'alpha') {
          await updateUser.mutateAsync({ full_name: 'alpha' });
        }
        // Write all demo health data into the passport row
        await upsertPassport.mutateAsync(DEMO_PASSPORT_PATCH);
      } catch (err) {
        console.error('[useSeedDemoData] failed:', err);
      }
    };

    seed();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, profile?.id, passport?.id, passport?.allergies.length]);
}
