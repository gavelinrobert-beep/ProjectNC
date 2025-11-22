import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilter } from '../useFilter'

describe('useFilter', () => {
  const mockData = [
    {
      id: 1,
      customer_name: 'John Doe',
      delivery_address: '123 Main St',
      status: 'pending',
      scheduled_date: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      deliveryAddress: '456 Oak Ave',
      status: 'in_transit',
      scheduled_date: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      customer_name: 'Bob Johnson',
      delivery_address: '789 Pine Rd',
      status: 'delivered',
      scheduled_date: '2024-01-03T00:00:00Z'
    }
  ]

  it('returns all data when no filters are applied', () => {
    const { result } = renderHook(() => 
      useFilter(mockData, { searchFields: ['customer_name'] })
    )

    expect(result.current.filteredData).toHaveLength(3)
    expect(result.current.filteredData).toEqual(mockData)
  })

  it('filters by search query with snake_case field', () => {
    const { result } = renderHook(() => 
      useFilter(mockData, { searchFields: ['customer_name'] })
    )

    act(() => {
      result.current.setSearchQuery('John')
    })

    expect(result.current.filteredData).toHaveLength(2)
    expect(result.current.filteredData[0].id).toBe(1)
    expect(result.current.filteredData[1].id).toBe(3)
  })

  it('filters by search query with camelCase field', () => {
    const { result } = renderHook(() => 
      useFilter(mockData, { searchFields: ['customerName'] })
    )

    act(() => {
      result.current.setSearchQuery('Jane')
    })

    expect(result.current.filteredData).toHaveLength(1)
    expect(result.current.filteredData[0].id).toBe(2)
  })

  it('supports cross-case field matching (snake_case config, camelCase data)', () => {
    const { result } = renderHook(() => 
      useFilter(mockData, { searchFields: ['customer_name'] })
    )

    act(() => {
      result.current.setSearchQuery('Jane')
    })

    expect(result.current.filteredData).toHaveLength(1)
    expect(result.current.filteredData[0].id).toBe(2)
  })

  it('filters by status', () => {
    const { result } = renderHook(() => 
      useFilter(mockData, { searchFields: ['customer_name'] })
    )

    act(() => {
      result.current.setStatusFilter('in_transit')
    })

    expect(result.current.filteredData).toHaveLength(1)
    expect(result.current.filteredData[0].status).toBe('in_transit')
  })

  it('filters by date range', () => {
    const { result } = renderHook(() => 
      useFilter(mockData, { 
        searchFields: ['customer_name'],
        dateField: 'scheduled_date'
      })
    )

    act(() => {
      result.current.setDateRange({
        start: '2024-01-02T00:00:00Z',
        end: '2024-01-03T00:00:00Z'
      })
    })

    expect(result.current.filteredData).toHaveLength(2)
    expect(result.current.filteredData[0].id).toBe(2)
    expect(result.current.filteredData[1].id).toBe(3)
  })

  it('combines multiple filters', () => {
    const { result } = renderHook(() => 
      useFilter(mockData, { 
        searchFields: ['customer_name'],
        dateField: 'scheduled_date'
      })
    )

    act(() => {
      result.current.setSearchQuery('John')
      result.current.setStatusFilter('pending')
    })

    expect(result.current.filteredData).toHaveLength(1)
    expect(result.current.filteredData[0].id).toBe(1)
  })

  it('clears all filters', () => {
    const { result } = renderHook(() => 
      useFilter(mockData, { searchFields: ['customer_name'] })
    )

    act(() => {
      result.current.setSearchQuery('John')
      result.current.setStatusFilter('pending')
      result.current.setTypeFilter('express')
    })

    act(() => {
      result.current.clearFilters()
    })

    expect(result.current.searchQuery).toBe('')
    expect(result.current.statusFilter).toBe('')
    expect(result.current.typeFilter).toBe('')
    expect(result.current.filteredData).toHaveLength(3)
  })

  it('handles empty or null data gracefully', () => {
    const { result: emptyResult } = renderHook(() => 
      useFilter([], { searchFields: ['customer_name'] })
    )

    expect(emptyResult.current.filteredData).toEqual([])

    const { result: nullResult } = renderHook(() => 
      useFilter(null, { searchFields: ['customer_name'] })
    )

    expect(nullResult.current.filteredData).toEqual([])
  })

  it('handles search on multiple fields', () => {
    const { result } = renderHook(() => 
      useFilter(mockData, { 
        searchFields: ['customer_name', 'delivery_address'] 
      })
    )

    act(() => {
      result.current.setSearchQuery('Main')
    })

    expect(result.current.filteredData).toHaveLength(1)
    expect(result.current.filteredData[0].id).toBe(1)
  })

  it('does not cause infinite re-renders with config object', () => {
    let renderCount = 0
    const config = { searchFields: ['customer_name'] }

    const { rerender } = renderHook(() => {
      renderCount++
      return useFilter(mockData, config)
    })

    const initialRenderCount = renderCount

    // Rerender with same config object reference
    rerender()
    rerender()

    // Should not cause additional renders beyond the initial and forced rerenders
    expect(renderCount).toBe(initialRenderCount + 2)
  })
})
