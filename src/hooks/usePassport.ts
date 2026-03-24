import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import {
  getPassportByUserId,
  getPassportByCode,
  createPassport,
  updatePassport,
  getOrCreatePassport,
} from '@/lib/api/passport';

export function usePassport(userId: string | undefined) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['passport', userId],
    queryFn: () => getPassportByUserId(userId!, getToken),
    enabled: !!userId,
  });
}

export function usePassportByCode(passportCode: string | undefined) {
  return useQuery({
    queryKey: ['passport-code', passportCode],
    queryFn: () => getPassportByCode(passportCode!),
    enabled: !!passportCode,
  });
}

export function useCreatePassport() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => createPassport(userId, getToken),
    onSuccess: (data) => {
      queryClient.setQueryData(['passport', data.user_id], data);
    },
  });
}

export function useUpdatePassport(passportId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Parameters<typeof updatePassport>[1]) =>
      updatePassport(passportId, updates, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passport'] });
    },
  });
}

/** Ensures a passport row exists, then updates it — safe even on first save */
export function useUpsertPassport(profileId: string | undefined) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Parameters<typeof updatePassport>[1]) => {
      if (!profileId) throw new Error('No profile ID');
      const passport = await getOrCreatePassport(profileId, getToken);
      return updatePassport(passport.id, updates, getToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passport'] });
    },
  });
}
