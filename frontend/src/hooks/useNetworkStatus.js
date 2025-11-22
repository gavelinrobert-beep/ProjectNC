import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    let toastId = null
    
    const handleOnline = () => {
      setIsOnline(true)
      if (toastId) {
        toast.dismiss(toastId)
        toastId = null
      }
      toast.success('Connection restored', { duration: 3000 })
    }
    const handleOffline = () => {
      setIsOnline(false)
      toastId = toast.error('No internet connection', { duration: 5000 })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (toastId) {
        toast.dismiss(toastId)
      }
    }
  }, [])

  return isOnline
}
