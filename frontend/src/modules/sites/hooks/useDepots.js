import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { depotService } from '../services/depotService'

export function useDepots() {
  return useQuery({
    queryKey: ['depots'],
    queryFn: depotService.getAll,
    staleTime: 30000,
    retry: 2
  })
}

export function useDepot(id) {
  return useQuery({
    queryKey: ['depots', id],
    queryFn: () => depotService.getById(id),
    enabled: !!id,
    staleTime: 30000,
    retry: 2
  })
}

export function useCreateDepot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: depotService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots'] })
      toast.success('Depot created successfully')
    }
  })
}

export function useUpdateDepot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => depotService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots'] })
      toast.success('Depot updated successfully')
    }
  })
}

export function useDeleteDepot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: depotService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots'] })
      toast.success('Depot deleted successfully')
    }
  })
}
