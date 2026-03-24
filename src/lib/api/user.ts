import { supabase } from '@/lib/supabase';
import { UserProfile, UserRole } from '@/types';

export async function getUserProfileByInternalId(id: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export async function getOrCreateUserProfile(
  clerkUserId: string,
  fullName: string,
  email: string,
  _getToken?: GetToken
): Promise<UserProfile> {
  // 1. Try to fetch existing profile
  const { data: existing, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();

  if (fetchError) {
    console.error('[getOrCreateUserProfile] fetch error:', fetchError);
    throw fetchError;
  }

  if (existing) return existing;

  // 2. No row found — insert a new profile
  const { data: created, error: insertError } = await supabase
    .from('user_profiles')
    .insert({
      clerk_user_id: clerkUserId,
      full_name: fullName || email,
      role: 'patient' as UserRole,
    })
    .select()
    .single();

  if (insertError) {
    console.error('[getOrCreateUserProfile] insert error:', insertError);
    throw insertError;
  }

  return created;
}

export async function updateUserProfile(
  clerkUserId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'clerk_user_id' | 'created_at'>>,
  _getToken?: GetToken
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
