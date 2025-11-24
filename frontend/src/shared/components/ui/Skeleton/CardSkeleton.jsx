import React from 'react'

export default function CardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
          </div>

          {/* Content lines */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
