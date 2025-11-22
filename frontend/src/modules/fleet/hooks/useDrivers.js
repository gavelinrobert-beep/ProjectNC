import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { driverService } from '../services/driverService'

export function useDrivers() {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: driverService.getAll,
    staleTime: 30000,
    retry: 2
  })
}

export function useDriver(id) {
  return useQuery({
    queryKey: ['drivers', id],
    queryFn: () => driverService.getById(id),
    enabled: !!id,
    staleTime: 30000,
    retry: 2
  })
}

export function useCreateDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: driverService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    }
  })
}

export function useUpdateDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => driverService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    }
  })
}

export function useDeleteDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: driverService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    }
  })
}
