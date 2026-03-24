import { supabase } from '../supabase';

export type Medicine = {
  name: string;
  dosage: string;
  frequency: string;
};

export type MedicalData = {
  conditions: string[];
  allergies: string[];
  medicines: Medicine[];
};

const FALLBACK: MedicalData = { conditions: [], allergies: [], medicines: [] };

export async function parseMedicalFile(fileUrl: string): Promise<MedicalData> {
  if (!fileUrl) {
    console.warn('[ai] No fileUrl provided');
    return FALLBACK;
  }

  console.log('[ai] Invoking parse-medical edge function with fileUrl:', fileUrl);

  const { data, error } = await supabase.functions.invoke('parse-medical', {
    body: { fileUrl },
  });

  if (error) {
    console.error('[ai] Edge function error:', error.message, error);
    throw new Error(`parse-medical failed: ${error.message}`);
  }

  console.log('[ai] Raw response from edge function:', data);

  if (data?.error) {
    console.error('[ai] Edge function returned error payload:', data.error);
    throw new Error(data.error);
  }

  const result: MedicalData = {
    conditions: data?.conditions ?? [],
    allergies: data?.allergies ?? [],
    medicines: data?.medicines ?? [],
  };

  console.log('[ai] Parsed medical data:', result);
  return result;
}
