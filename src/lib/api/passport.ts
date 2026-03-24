import { supabase } from '@/lib/supabase';
import { Passport } from '@/types';

export async function createPassport(userId: string): Promise<Passport> {
  const { data, error } = await supabase
    .from('passports')
    .insert({ user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPassportByUserId(userId: string): Promise<Passport | null> {
  const { data, error } = await supabase
    .from('passports')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

export async function getPassportByCode(passportCode: string): Promise<Passport | null> {
  const { data, error } = await supabase
    .from('passports')
    .select('*')
    .eq('passport_code', passportCode)
    .single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

export async function updatePassport(
  passportId: string,
  updates: Partial<Omit<Passport, 'id' | 'user_id' | 'passport_code'>>
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
