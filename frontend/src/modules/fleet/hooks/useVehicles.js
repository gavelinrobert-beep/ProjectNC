import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehicleService } from '../services/vehicleService'

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleService.getAll,
    staleTime: 30000,
    retry: 2
  })
}

export function useVehicle(id) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehicleService.getById(id),
    enabled: !!id,
    staleTime: 30000,
    retry: 2
  })
}

export function useVehicleTracking() {
  return useQuery({
    queryKey: ['vehicles', 'tracking'],
    queryFn: vehicleService.getTracking,
    refetchInterval: 5000,
    staleTime: 0,
    retry: 2
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: vehicleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    }
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => vehicleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    }
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: vehicleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    }
  })
}
