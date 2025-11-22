import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleApiError } from '../errorHandler'
import toast from 'react-hot-toast'

vi.mock('react-hot-toast')

describe('handleApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows network error when there is no response', () => {
    const error = { message: 'Network Error' }
    handleApiError(error)
    expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection.')
  })

  it('shows invalid request message for 400 status', () => {
    const error = {
      response: {
        status: 400,
        data: { message: 'Bad request' }
      }
    }
    handleApiError(error)
    expect(toast.error).toHaveBeenCalledWith('Bad request')
  })

  it('shows permission denied for 403 status', () => {
    const error = {
      response: {
        status: 403,
        data: {}
      }
    }
    handleApiError(error)
    expect(toast.error).toHaveBeenCalledWith('Permission denied')
  })

  it('shows resource not found for 404 status', () => {
    const error = {
      response: {
        status: 404,
        data: {}
      }
    }
    handleApiError(error)
    expect(toast.error).toHaveBeenCalledWith('Resource not found')
  })

  it('shows server error for 500 status', () => {
    const error = {
      response: {
        status: 500,
        data: {}
      }
    }
    handleApiError(error)
    expect(toast.error).toHaveBeenCalledWith('Server error')
  })

  it('shows custom message when provided', () => {
    const error = {
      response: {
        status: 422,
        data: { message: 'Custom error message' }
      }
    }
    handleApiError(error)
    expect(toast.error).toHaveBeenCalledWith('Custom error message')
  })

  it('shows default message for unknown status codes', () => {
    const error = {
      response: {
        status: 418,
        data: {}
      }
    }
    handleApiError(error)
    expect(toast.error).toHaveBeenCalledWith('Something went wrong')
  })
})
