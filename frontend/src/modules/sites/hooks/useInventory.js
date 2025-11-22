import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '../services/inventoryService'

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getAll,
    staleTime: 30000,
    retry: 2
  })
}

export function useInventoryByDepot(depotId) {
  return useQuery({
    queryKey: ['inventory', 'depot', depotId],
    queryFn: () => inventoryService.getByDepot(depotId),
    enabled: !!depotId,
    staleTime: 30000,
    retry: 2
  })
}

export function useUpdateInventory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => inventoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    }
  })
}
