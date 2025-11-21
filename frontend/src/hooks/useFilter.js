import { useMemo, useState } from 'react'

/**
 * Custom hook for filtering data
 * @param {Array} data - Array of data to filter
 * @param {Object} config - Configuration object with searchFields and dateField
 * @returns {Object} Filtered data and filter controls
 */
export function useFilter(data, config = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockLevelFilter, setStockLevelFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const filteredData = useMemo(() => {
    if (!data) return []

    let result = [...data]

    // Search filter
    if (searchQuery && config.searchFields) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => {
        return config.searchFields.some(field => 
          String(item[field] || '').toLowerCase().includes(query)
        )
      })
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(item => item.status === statusFilter)
    }

    // Type filter
    if (typeFilter) {
      result = result.filter(item => item.type === typeFilter)
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter(item => item.category === categoryFilter)
    }

    // Stock level filter
    if (stockLevelFilter && config.getStockStatus) {
      result = result.filter(item => config.getStockStatus(item) === stockLevelFilter)
    }

    // Date range filter
    if (dateRange.start && config.dateField) {
      result = result.filter(item => 
        new Date(item[config.dateField]) >= new Date(dateRange.start)
      )
    }
    if (dateRange.end && config.dateField) {
      result = result.filter(item => 
        new Date(item[config.dateField]) <= new Date(dateRange.end)
      )
    }

    return result
  }, [data, searchQuery, statusFilter, typeFilter, categoryFilter, stockLevelFilter, dateRange, config])

  return {
    filteredData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    stockLevelFilter,
    setStockLevelFilter,
    dateRange,
    setDateRange,
    clearFilters: () => {
      setSearchQuery('')
      setStatusFilter('')
      setTypeFilter('')
      setCategoryFilter('')
      setStockLevelFilter('')
      setDateRange({ start: '', end: '' })
    }
  }
}
