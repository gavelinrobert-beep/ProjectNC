import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { maintenanceService } from '../services/maintenanceService'

export function useMaintenance() {
  return useQuery({
    queryKey: ['maintenance'],
    queryFn: maintenanceService.getAll,
    staleTime: 30000,
    retry: 2
  })
}

export function useMaintenanceEvent(id) {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => maintenanceService.getById(id),
    enabled: !!id,
    staleTime: 30000,
    retry: 2
  })
}

export function useCreateMaintenanceEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: maintenanceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Maintenance event created successfully')
    }
  })
}

export function useUpdateMaintenanceEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => maintenanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Maintenance event updated successfully')
    }
  })
}

export function useDeleteMaintenanceEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: maintenanceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Maintenance event deleted successfully')
    }
  })
}
