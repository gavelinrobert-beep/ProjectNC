/**
 * Chart utility functions for data transformation and formatting
 */

/**
 * Generate trend data for the last N days
 * @param {number} days - Number of days to generate (default: 7)
 * @returns {Array} Array of trend data objects with date and value
 */
export function generateTrendData(days = 7) {
  // Generate mock trend data for last N days
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    result.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      value: Math.floor(Math.random() * 20) + 5
    })
  }
  return result
}

/**
 * Calculate percentage from part and total
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage rounded to nearest integer
 */
export function calculatePercentage(part, total) {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

/**
 * Format chart value based on type
 * @param {number} value - Value to format
 * @param {string} type - Type of formatting ('number', 'currency', 'percentage')
 * @returns {string} Formatted value
 */
export function formatChartValue(value, type = 'number') {
  if (type === 'currency') return `$${value.toLocaleString()}`
  if (type === 'percentage') return `${value}%`
  return value.toLocaleString()
}

/**
 * Aggregate data by date range
 * @param {Array} data - Original data array
 * @param {string} dateKey - Key for date field
 * @param {string} valueKey - Key for value field
 * @returns {Array} Aggregated data
 */
export function aggregateByDate(data, dateKey, valueKey) {
  const aggregated = {}
  
  data.forEach(item => {
    const date = item[dateKey]
    if (!aggregated[date]) {
      aggregated[date] = 0
    }
    aggregated[date] += item[valueKey]
  })
  
  return Object.keys(aggregated).map(date => ({
    [dateKey]: date,
    [valueKey]: aggregated[date]
  }))
}

/**
 * Calculate trend percentage between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Trend percentage (positive or negative)
 */
export function calculateTrend(current, previous) {
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
}
