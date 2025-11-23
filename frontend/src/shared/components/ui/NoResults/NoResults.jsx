import React from 'react'

export default function NoResults({
  searchTerm,
  onClear,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        No results found
      </h3>
      {searchTerm && (
        <p className="text-gray-600 mb-4 text-center">
          No items match "{searchTerm}"
        </p>
      )}
      {onClear && (
        <button
          onClick={onClear}
          className="text-primary-600 hover:text-primary-700 font-medium transition"
        >
          Clear search
        </button>
      )}
    </div>
  )
}
