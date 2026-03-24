import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, createUserProfile, updateUserProfile } from '@/lib/api/user';
import { UserRole } from '@/types';

export function useUser(clerkUserId: string | undefined) {
  return useQuery({
    queryKey: ['user', clerkUserId],
    queryFn: () => getUserProfile(clerkUserId!),
    enabled: !!clerkUserId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clerkUserId, fullName, role }: { clerkUserId: string; fullName: string; role: UserRole }) =>
      createUserProfile(clerkUserId, fullName, role),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', data.clerk_user_id], data);
    },
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
