import { useState, useMemo } from 'react'

/**
 * Reusable Table component with sorting, mobile card layout, and custom rendering
 * 
 * @param {Array} columns - Column configuration: [{ key, label, sortable, render }]
 * @param {Array} data - Data array to display
 * @param {Function} onRowClick - Optional callback when row is clicked
 * @param {Function} actions - Optional function returning action buttons for each row
 * @param {String} emptyMessage - Message to display when no data
 * @param {String} keyField - Field to use as row key (default: 'id')
 */
export default function Table({
  columns,
  data,
  onRowClick,
  actions,
  emptyMessage = 'No data available',
  keyField = 'id',
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortConfig.key === column.key && (
                      <span className="text-primary-600">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick?.(row)}
                className={`${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                } transition`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row) : (
                      <span className="text-sm text-gray-900">
                        {row[column.key] || '-'}
                      </span>
                    )}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {sortedData.map((row) => (
          <div
            key={row[keyField]}
            onClick={() => onRowClick?.(row)}
            className={`bg-white rounded-lg shadow p-4 ${
              onRowClick ? 'cursor-pointer active:bg-gray-50' : ''
            }`}
          >
            {columns.map((column) => (
              <div key={column.key} className="mb-3 last:mb-0">
                <div className="text-xs text-gray-500 font-medium mb-1">
                  {column.label}
                </div>
                <div>
                  {column.render ? column.render(row) : (
                    <span className="text-sm text-gray-900">
                      {row[column.key] || '-'}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {actions && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                {actions(row)}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
