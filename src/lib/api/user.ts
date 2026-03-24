import { supabase } from '@/lib/supabase';
import { UserProfile, UserRole } from '@/types';

export async function createUserProfile(
  clerkUserId: string,
  fullName: string,
  role: UserRole
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ clerk_user_id: clerkUserId, full_name: fullName, role })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserProfile(clerkUserId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

export async function updateUserProfile(
  clerkUserId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'clerk_user_id' | 'created_at'>>
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('clerk_user_id', clerkUserId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
