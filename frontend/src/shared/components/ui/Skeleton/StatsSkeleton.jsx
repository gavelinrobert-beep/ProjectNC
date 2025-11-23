import React from 'react'

export default function StatsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          {/* Icon placeholder */}
          <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4 animate-pulse" />
          
          {/* Value placeholder */}
          <div className="h-8 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
          
          {/* Label placeholder */}
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
