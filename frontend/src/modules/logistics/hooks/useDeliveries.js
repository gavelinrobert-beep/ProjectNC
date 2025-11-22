import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deliveryService } from '../services/deliveryService'

export function useDeliveries() {
  return useQuery({
    queryKey: ['deliveries'],
    queryFn: deliveryService.getAll,
    staleTime: 30000,
    retry: 2
  })
}

export function useDelivery(id) {
  return useQuery({
    queryKey: ['deliveries', id],
    queryFn: () => deliveryService.getById(id),
    enabled: !!id,
    staleTime: 30000,
    retry: 2
  })
}

export function useCreateDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deliveryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
    }
  })
}

export function useUpdateDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => deliveryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
    }
  })
}

export function useDeleteDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deliveryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
    }
  })
}
