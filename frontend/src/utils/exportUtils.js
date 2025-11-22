/**
 * Flatten nested objects for export
 * @param {Object} obj - Object to flatten
 * @param {string} prefix - Prefix for nested keys
 * @returns {Object} Flattened object
 */
function flattenObject(obj, prefix = '') {
  const flattened = {}
  
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    
    if (value === null || value === undefined) {
      flattened[newKey] = ''
    } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value, newKey))
    } else if (Array.isArray(value)) {
      flattened[newKey] = value.join(', ')
    } else {
      flattened[newKey] = value
    }
  })
  
  return flattened
}

/**
 * Proper CSV escaping
 * @param {*} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeCsv(value) {
  if (value === null || value === undefined) return ''
  
  const str = String(value)
  
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  
  return str
}

/**
 * Export data to CSV format with proper handling of nested objects
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Filename without extension
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Flatten all objects
  const flattenedData = data.map(item => flattenObject(item))
  
  // Get all unique headers
  const headers = [...new Set(flattenedData.flatMap(item => Object.keys(item)))]
  
  // Create CSV content
  const csvRows = []
  
  // Header row
  csvRows.push(headers.map(escapeCsv).join(','))
  
  // Data rows
  flattenedData.forEach(item => {
    const row = headers.map(header => escapeCsv(item[header] || ''))
    csvRows.push(row.join(','))
  })
  
  const csvContent = csvRows.join('\n')
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export data to Excel (using CSV with .xlsx extension for simplicity)
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Filename
 */
export function exportToExcel(data, filename = 'export.xlsx') {
  exportToCSV(data, filename.replace('.xlsx', '.csv'))
}

/**
 * Print functionality
 * @param {Array} data - Array of objects to print
 * @param {string} title - Title for the print page
 */
export function printData(data, title = 'Data Export') {
  if (!data || data.length === 0) {
    alert('No data to print')
    return
  }
  
  const flattenedData = data.map(item => flattenObject(item))
  const headers = [...new Set(flattenedData.flatMap(item => Object.keys(item)))]
  
  let html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4A90E2; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${flattenedData.map(item => `
              <tr>
                ${headers.map(h => `<td>${item[h] || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `
  
  const printWindow = window.open('', '_blank')
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.print()
}

/**
 * Export data to JSON format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Filename without extension
 */
export function exportToJSON(data, filename) {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, `${filename}.json`, 'application/json')
}

/**
 * Download a file with the given content
 * @param {string} content - File content
 * @param {string} filename - Filename with extension
 * @param {string} mimeType - MIME type of the file
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
