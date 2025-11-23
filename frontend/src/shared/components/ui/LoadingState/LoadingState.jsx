import React from 'react'

export default function LoadingState({
  message = 'Loading...',
}) {
  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="text-center">
        <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}
