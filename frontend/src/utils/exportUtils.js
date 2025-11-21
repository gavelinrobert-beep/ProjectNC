/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Filename without extension
 */
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle null/undefined
        if (value == null) return ''
        // Escape commas and quotes
        const stringValue = String(value)
        return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
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
