import { supabase } from '../supabase';

export async function uploadReport(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('reports')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Upload failed:', error);
    throw error;
  }

  const { data } = supabase.storage.from('reports').getPublicUrl(fileName);
  return data.publicUrl;
}
