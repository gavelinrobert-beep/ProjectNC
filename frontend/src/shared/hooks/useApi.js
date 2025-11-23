import { useQuery } from '@tanstack/react-query'

/**
 * Unified hook for API queries (GET requests)
 * Provides consistent loading, error handling, and caching
 */
export function useApi({
  queryKey,
  queryFn,
  enabled = true,
  refetchInterval,
  staleTime = 5 * 60 * 1000, // 5 minutes default
}) {
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const result = await queryFn()
        return result
      } catch (error) {
        console.error(`API Error [${queryKey.join('/')}]:`, error)
        throw error
      }
    },
    enabled,
    refetchInterval,
    staleTime,
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}
