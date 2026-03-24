import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPassportByUserId, getPassportByCode, createPassport, updatePassport } from '@/lib/api/passport';

export function usePassport(userId: string | undefined) {
  return useQuery({
    queryKey: ['passport', userId],
    queryFn: () => getPassportByUserId(userId!),
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => createPassport(userId),
    onSuccess: (data) => {
      queryClient.setQueryData(['passport', data.user_id], data);
    },
  });
}

export function useUpdatePassport(passportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Parameters<typeof updatePassport>[1]) =>
      updatePassport(passportId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passport'] });
    },
  });
}
