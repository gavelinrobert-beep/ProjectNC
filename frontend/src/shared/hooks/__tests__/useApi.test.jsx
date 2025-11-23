import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useApi } from '../useApi'

// Wrapper component for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    const queryFn = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(
      () => useApi({
        queryKey: ['test'],
        queryFn,
      }),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.isError).toBe(false)
    expect(queryFn).toHaveBeenCalledTimes(1)
  })

  it('handles errors correctly', async () => {
    const mockError = new Error('API Error')
    const queryFn = vi.fn().mockRejectedValue(mockError)

    const { result } = renderHook(
      () => useApi({
        queryKey: ['test'],
        queryFn,
      }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    }, { timeout: 5000 })

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeUndefined()
  })

  it('respects enabled flag', async () => {
    const queryFn = vi.fn().mockResolvedValue({ data: 'test' })

    const { result } = renderHook(
      () => useApi({
        queryKey: ['test'],
        queryFn,
        enabled: false,
      }),
      { wrapper: createWrapper() }
    )

    // Wait a bit to ensure it doesn't call
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(result.current.isLoading).toBe(false)
    expect(queryFn).not.toHaveBeenCalled()
  })

  it('can refetch data', async () => {
    const mockData = { id: 1, name: 'Test' }
    const queryFn = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(
      () => useApi({
        queryKey: ['test'],
        queryFn,
      }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(queryFn).toHaveBeenCalledTimes(1)

    // Trigger refetch
    result.current.refetch()

    await waitFor(() => {
      expect(queryFn).toHaveBeenCalledTimes(2)
    })
  })

  it('uses custom staleTime', async () => {
    const queryFn = vi.fn().mockResolvedValue({ data: 'test' })

    const { result } = renderHook(
      () => useApi({
        queryKey: ['test'],
        queryFn,
        staleTime: 10000,
      }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(queryFn).toHaveBeenCalledTimes(1)
  })
})
