import toast from 'react-hot-toast'

export function handleApiError(error) {
  if (!error.response) {
    toast.error('Network error. Please check your connection.')
    return
  }
  
  const status = error.response.status
  const message = error.response.data?.message
  
  switch (status) {
    case 400: toast.error(message || 'Invalid request'); break
    case 401: toast.error('Unauthorized. Please login again.'); break
    case 403: toast.error('Permission denied'); break
    case 404: toast.error('Resource not found'); break
    case 500: toast.error('Server error'); break
    default: toast.error(message || 'Something went wrong')
  }
}
