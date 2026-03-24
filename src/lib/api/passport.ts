import { supabase } from '@/lib/supabase';
import { Passport } from '@/types';
import { MedicalData } from '@/lib/api/ai';

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

export async function updatePassportData(userId: string, data: MedicalData): Promise<void> {
  try {
    // Step 1: get or create passport
    let passport = await getPassportByUserId(userId);
    if (!passport) {
      passport = await createPassport(userId);
    }

    // Step 2: update conditions + allergies
    const { error: updateError } = await supabase
      .from('passports')
      .update({
        conditions: data.conditions,
        allergies: data.allergies,
        updated_at: new Date().toISOString(),
      })
      .eq('id', passport.id);

    if (updateError) {
      console.error('Failed to update passport:', updateError);
      throw updateError;
    }

    // Step 3: replace medicines
    const { error: deleteError } = await supabase
      .from('medicines')
      .delete()
      .eq('passport_id', passport.id);

    if (deleteError) {
      console.error('Failed to delete old medicines:', deleteError);
      throw deleteError;
    }

    if (data.medicines.length > 0) {
      const rows = data.medicines.map((m) => ({
        passport_id: passport!.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
      }));

      const { error: insertError } = await supabase.from('medicines').insert(rows);
      if (insertError) {
        console.error('Failed to insert medicines:', insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error('updatePassportData failed:', error);
  }
}
