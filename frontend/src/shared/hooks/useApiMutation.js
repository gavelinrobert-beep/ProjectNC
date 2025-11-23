import { useMutation, useQueryClient } from '@tanstack/react-query'

/**
 * Unified hook for API mutations (POST/PUT/DELETE requests)
 * Provides consistent error handling and cache invalidation
 */
export function useApiMutation({
  mutationFn,
  onSuccess,
  onError,
  invalidateQueries = [],
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data) => {
      try {
        const result = await mutationFn(data)
        return result
      } catch (error) {
        console.error('API Mutation Error:', error)
        throw error
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries to refetch data
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey })
      })

      // Call custom onSuccess if provided
      if (onSuccess) {
        onSuccess(data, variables, context)
      }
    },
    onError: (error, variables, context) => {
      // Call custom onError if provided
      if (onError) {
        onError(error, variables, context)
      }
    },
  })

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  }
}
