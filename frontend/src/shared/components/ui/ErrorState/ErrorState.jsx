import React from 'react'
import { BUTTON_VARIANTS, BUTTON_SIZES } from '../../../constants/design'

export default function ErrorState({
  title = 'Unable to load data',
  message = 'There was a problem loading the data. Please try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`${BUTTON_VARIANTS.primary} ${BUTTON_SIZES.md} rounded-lg font-semibold transition`}
        >
          Try Again
        </button>
      )}
    </div>
  )
}
