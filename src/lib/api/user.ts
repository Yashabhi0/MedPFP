import { supabase } from '@/lib/supabase';
import { UserProfile, UserRole } from '@/types';

/**
 * Fetches an existing profile or creates one on first login.
 * Safe to call on every mount — idempotent.
 */
export async function getOrCreateUserProfile(
  clerkUserId: string,
  fullName: string,
  email: string
): Promise<UserProfile> {
  // 1. Try to fetch existing profile
  const { data: existing, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('[getOrCreateUserProfile] fetch error:', fetchError);
    throw fetchError;
  }

  if (existing) return existing;

  // 2. No row found — insert a new profile
  const { data: created, error: insertError } = await supabase
    .from('user_profiles')
    .insert({
      clerk_user_id: clerkUserId,
      full_name: fullName || email, // fallback if name not set yet
      role: 'patient' as UserRole,  // default role; user can change later
    })
    .select()
    .single();

  if (insertError) {
    console.error('[getOrCreateUserProfile] insert error:', insertError);
    throw insertError;
  }

  return created;
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
