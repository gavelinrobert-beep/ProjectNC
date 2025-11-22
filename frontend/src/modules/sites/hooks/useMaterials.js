import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materialService } from '../services/materialService'

export function useMaterials() {
  return useQuery({
    queryKey: ['materials'],
    queryFn: materialService.getAll,
    staleTime: 30000,
    retry: 2
  })
}

export function useMaterial(id) {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: () => materialService.getById(id),
    enabled: !!id,
    staleTime: 30000,
    retry: 2
  })
}

export function useCreateMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: materialService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    }
  })
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => materialService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    }
  })
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: materialService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    }
  })
}
