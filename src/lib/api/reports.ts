import { supabase } from '@/lib/supabase';
import { UploadedReport } from '@/types';

export async function createReport(
  passportId: string,
  fileUrl: string,
  fileName: string
): Promise<UploadedReport> {
  const { data, error } = await supabase
    .from('uploaded_reports')
    .insert({ passport_id: passportId, file_url: fileUrl, file_name: fileName })
    .select()
    .single();
  if (error) {
    console.error('[createReport] failed:', error);
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
