import { useMemo, useState } from 'react'

/**
 * Helper to get field value supporting both camelCase and snake_case
 * @param {Object} obj - Object to get field from
 * @param {string} field - Field name (can be camelCase or snake_case)
 * @returns {*} Field value or undefined
 */
function getFieldValue(obj, field) {
  // Try direct access first
  if (obj[field] !== undefined) return obj[field]
  
  // Try camelCase version
  const camelCase = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  if (obj[camelCase] !== undefined) return obj[camelCase]
  
  // Try snake_case version
  const snakeCase = field.replace(/([A-Z])/g, '_$1').toLowerCase()
  if (obj[snakeCase] !== undefined) return obj[snakeCase]
  
  return undefined
}

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

  // Stringify config to prevent infinite re-renders
  const configStr = JSON.stringify(config)

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return []

    let result = [...data]
    
    // Parse config back from string
    const parsedConfig = JSON.parse(configStr)

    // Search filter
    if (searchQuery && searchQuery.trim() !== '' && parsedConfig.searchFields) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(item => {
        return parsedConfig.searchFields.some(field => {
          const value = getFieldValue(item, field)
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(query)
        })
      })
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(item => {
        const status = getFieldValue(item, 'status')
        return status === statusFilter
      })
    }

    // Type filter
    if (typeFilter) {
      result = result.filter(item => {
        const type = getFieldValue(item, 'type')
        return type === typeFilter
      })
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter(item => {
        const category = getFieldValue(item, 'category')
        return category === categoryFilter
      })
    }

    // Stock level filter
    if (stockLevelFilter && parsedConfig.getStockStatus) {
      result = result.filter(item => parsedConfig.getStockStatus(item) === stockLevelFilter)
    }

    // Date range filter
    if ((dateRange.start || dateRange.end) && parsedConfig.dateField) {
      result = result.filter(item => {
        const itemDate = new Date(getFieldValue(item, parsedConfig.dateField))
        if (isNaN(itemDate.getTime())) return true
        
        if (dateRange.start) {
          const startDate = new Date(dateRange.start)
          if (itemDate < startDate) return false
        }
        
        if (dateRange.end) {
          const endDate = new Date(dateRange.end)
          if (itemDate > endDate) return false
        }
        
        return true
      })
    }

    return result
  }, [data, searchQuery, statusFilter, typeFilter, categoryFilter, stockLevelFilter, dateRange.start, dateRange.end, configStr])

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
