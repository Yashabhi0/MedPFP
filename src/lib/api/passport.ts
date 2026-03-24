import { supabase } from '@/lib/supabase';
import { Passport } from '@/types';
import { MedicalData } from '@/lib/api/ai';

type GetToken = (options?: { template?: string }) => Promise<string | null>;

// ── Reads ─────────────────────────────────────────────────────────────────

export async function getPassportByCode(passportCode: string): Promise<Passport | null> {
  const { data, error } = await supabase
    .from('passports')
    .select('*')
    .eq('passport_code', passportCode)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPassportByUserId(
  userId: string,
  _getToken?: GetToken
): Promise<Passport | null> {
  const { data, error } = await supabase
    .from('passports')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ── Writes ────────────────────────────────────────────────────────────────

export async function createPassport(
  userId: string,
  _getToken?: GetToken
): Promise<Passport> {
  const { data, error } = await supabase
    .from('passports')
    .insert({ user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getOrCreatePassport(
  userId: string,
  getToken?: GetToken
): Promise<Passport> {
  const existing = await getPassportByUserId(userId, getToken);
  if (existing) return existing;
  return createPassport(userId, getToken);
}

export async function updatePassport(
  passportId: string,
  updates: Partial<Omit<Passport, 'id' | 'user_id' | 'passport_code'>>,
  _getToken?: GetToken
): Promise<Passport> {
  const completionPercent = calculateCompletion(updates as Passport);
  const { data, error } = await supabase
    .from('passports')
    .update({ ...updates, completion_percent: completionPercent, updated_at: new Date().toISOString() })
    .eq('id', passportId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

function calculateCompletion(passport: Partial<Passport>): number {
  const fields = [
    passport.blood_group,
    passport.allergies?.length,
    passport.conditions?.length,
    passport.medicines?.length,
    passport.lab_values?.length,
    passport.emergency_contact,
    passport.ai_summary,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export async function updatePassportData(
  userId: string,
  data: MedicalData,
  getToken?: GetToken
): Promise<void> {
  try {
    const passport = await getOrCreatePassport(userId, getToken);

    const medicines = data.medicines.map((m) => ({
      id: crypto.randomUUID(),
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
    }));

    const { error } = await supabase
      .from('passports')
      .update({
        conditions: data.conditions,
        allergies: data.allergies,
        medicines,
        updated_at: new Date().toISOString(),
      })
      .eq('id', passport.id);

    if (error) throw error;
  } catch (err) {
    console.error('updatePassportData failed:', err);
  }
}
