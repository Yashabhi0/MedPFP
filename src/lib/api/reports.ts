import { supabase } from '@/lib/supabase';
import { UploadedReport } from '@/types';
import { MedicalData } from '@/lib/api/ai';

export async function createReport(
  patientId: string,
  fileUrl: string,
  medicalData?: MedicalData
): Promise<UploadedReport> {
  const { data, error } = await supabase
    .from('reports')
    .insert([{
      patient_id: patientId,
      file_url: fileUrl,
      conditions: medicalData?.conditions ?? [],
      allergies: medicalData?.allergies ?? [],
      medicines: medicalData?.medicines ?? [],
    }])
    .select()
    .single();
  if (error) {
    console.error('Failed to save report:', error);
    throw error;
  }
  return data;
}

export async function getReports(passportId: string): Promise<UploadedReport[]> {
  const { data, error } = await supabase
    .from('uploaded_reports')
    .select('*')
    .eq('passport_id', passportId)
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
