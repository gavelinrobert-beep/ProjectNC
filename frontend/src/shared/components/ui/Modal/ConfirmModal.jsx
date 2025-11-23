import React from 'react'
import Modal from './Modal'
import { BUTTON_VARIANTS, BUTTON_SIZES } from '../../../constants/design'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // danger, primary, warning
  isLoading = false,
}) {
  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        {/* Message */}
        <p className="text-gray-700">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`${BUTTON_VARIANTS.secondary} ${BUTTON_SIZES.md} rounded-lg font-medium transition disabled:opacity-50`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES.md} rounded-lg font-medium transition disabled:opacity-50`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
