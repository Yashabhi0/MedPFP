import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrCreateUserProfile, updateUserProfile } from '@/lib/api/user';
import { UserRole } from '@/types';

/**
 * Fetches the user profile, creating it in Supabase if this is their first login.
 * Requires all three Clerk fields to be present before firing.
 */
export function useUser(
  clerkUserId: string | undefined,
  fullName: string | undefined,
  email: string | undefined
) {
  return useQuery({
    queryKey: ['user', clerkUserId],
    queryFn: () => getOrCreateUserProfile(clerkUserId!, fullName || '', email || ''),
    enabled: !!clerkUserId && !!email,
    staleTime: 1000 * 60 * 5, // don't re-run on every render — 5 min cache
    retry: 1,
  });
}

export function useUpdateUser(clerkUserId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Parameters<typeof updateUserProfile>[1]) =>
      updateUserProfile(clerkUserId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', clerkUserId], data);
    },
  });
}


