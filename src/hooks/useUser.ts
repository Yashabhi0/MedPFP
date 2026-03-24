import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { getOrCreateUserProfile, updateUserProfile } from '@/lib/api/user';

export function useUser(
  clerkUserId: string | undefined,
  fullName: string | undefined,
  email: string | undefined
) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['user', clerkUserId],
    queryFn: () => getOrCreateUserProfile(clerkUserId!, fullName || '', email || '', getToken),
    enabled: !!clerkUserId && !!email,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useUpdateUser(clerkUserId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Parameters<typeof updateUserProfile>[1]) =>
      updateUserProfile(clerkUserId, updates, getToken),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', clerkUserId], data);
    },
  });
}
