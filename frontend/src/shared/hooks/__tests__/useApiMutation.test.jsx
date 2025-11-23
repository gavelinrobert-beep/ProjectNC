import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useApiMutation } from '../useApiMutation'

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

describe('useApiMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('executes mutation successfully', async () => {
    const mockData = { id: 1, name: 'Created' }
    const mutationFn = vi.fn().mockResolvedValue(mockData)
    const onSuccess = vi.fn()

    const { result } = renderHook(
      () => useApiMutation({
        mutationFn,
        onSuccess,
      }),
      { wrapper: createWrapper() }
    )

    act(() => {
      result.current.mutate({ name: 'Test' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mutationFn).toHaveBeenCalledWith({ name: 'Test' })
    expect(onSuccess).toHaveBeenCalledWith(mockData, { name: 'Test' }, undefined)
  })

  it('handles mutation errors', async () => {
    const mockError = new Error('Mutation failed')
    const mutationFn = vi.fn().mockRejectedValue(mockError)
    const onError = vi.fn()

    const { result } = renderHook(
      () => useApiMutation({
        mutationFn,
        onError,
      }),
      { wrapper: createWrapper() }
    )

    act(() => {
      result.current.mutate({ name: 'Test' })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(onError).toHaveBeenCalledWith(mockError, { name: 'Test' }, undefined)
  })

  it('invalidates queries on success', async () => {
    const mockData = { id: 1, name: 'Created' }
    const mutationFn = vi.fn().mockResolvedValue(mockData)
    const queryClient = new QueryClient()
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(
      () => useApiMutation({
        mutationFn,
        invalidateQueries: [['test-query']],
      }),
      { wrapper }
    )

    act(() => {
      result.current.mutate({ name: 'Test' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['test-query'] })
  })

  it('tracks loading state', async () => {
    const mutationFn = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: 'test' }), 100))
    )

    const { result } = renderHook(
      () => useApiMutation({
        mutationFn,
      }),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(false)

    act(() => {
      result.current.mutate({ name: 'Test' })
    })

    // Should be loading immediately after mutation
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    // Should finish loading after completion
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('can reset mutation state', async () => {
    const mockData = { id: 1, name: 'Created' }
    const mutationFn = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(
      () => useApiMutation({
        mutationFn,
      }),
      { wrapper: createWrapper() }
    )

    act(() => {
      result.current.mutate({ name: 'Test' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    await act(async () => {
      result.current.reset()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(false)
    })
    expect(result.current.isError).toBe(false)
  })

  it('supports mutateAsync', async () => {
    const mockData = { id: 1, name: 'Created' }
    const mutationFn = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(
      () => useApiMutation({
        mutationFn,
      }),
      { wrapper: createWrapper() }
    )

    let resultData
    await act(async () => {
      resultData = await result.current.mutateAsync({ name: 'Test' })
    })

    expect(resultData).toEqual(mockData)
    expect(mutationFn).toHaveBeenCalledWith({ name: 'Test' })
  })
})
