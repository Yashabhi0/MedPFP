import { supabase } from '@/lib/supabase';
import { UploadedReport } from '@/types';

export async function createReport(patientId: string, fileUrl: string): Promise<UploadedReport> {
  const { data, error } = await supabase
    .from('reports')
    .insert([{ patient_id: patientId, file_url: fileUrl }])
    .select()
    .single();
  if (error) {
    console.error('Failed to save report:', error);
    throw error;
  }
  return data;
}

export async function uploadReport(passportId: string, file: File): Promise<UploadedReport> {
  const fileName = `${passportId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('reports')
    .upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('reports')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('uploaded_reports')
    .insert({ passport_id: passportId, file_url: publicUrl, file_name: file.name })
    .select()
    .single();
  if (error) throw error;
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
