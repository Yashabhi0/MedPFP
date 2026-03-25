import { supabase } from '@/lib/supabase';

/** Add a patient (passport code) to a doctor's list. Ignores duplicates. */
export async function addDoctorPatient(doctorId: string, passportCode: string): Promise<void> {
  const { error } = await supabase
    .from('doctor_patients')
    .upsert({ doctor_id: doctorId, passport_code: passportCode }, { onConflict: 'doctor_id,passport_code' });
  if (error) throw error;
}

/** Get all passport codes for a doctor, newest first. */
export async function getDoctorPatients(doctorId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('doctor_patients')
    .select('passport_code')
    .eq('doctor_id', doctorId)
    .order('added_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => r.passport_code);
}

/** Remove a patient from a doctor's list. */
export async function removeDoctorPatient(doctorId: string, passportCode: string): Promise<void> {
  const { error } = await supabase
    .from('doctor_patients')
    .delete()
    .eq('doctor_id', doctorId)
    .eq('passport_code', passportCode);
  if (error) throw error;
}
