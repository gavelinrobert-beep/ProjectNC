import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routeService } from '../services/routeService'

export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: routeService.getAll,
    staleTime: 30000,
    retry: 2
  })
}

export function useRoute(id) {
  return useQuery({
    queryKey: ['routes', id],
    queryFn: () => routeService.getById(id),
    enabled: !!id,
    staleTime: 30000,
    retry: 2
  })
}

export function useCreateRoute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: routeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
    }
  })
}

export function useUpdateRoute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => routeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
    }
  })
}

export function useDeleteRoute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: routeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
    }
  })
}
