import { useEffect, useRef, useState } from 'react'
import { API_BASE } from '../lib/api'

export function useSSE(path, onMessage) {
  const callbackRef = useRef(onMessage)
  const reconnectTimeoutRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)

  // Keep callback ref up to date without causing re-renders
  useEffect(() => {
    callbackRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    let es = null
    let isMounted = true

    const connect = () => {
      if (!isMounted) return

      try {
        console.log('[useSSE] Attempting to connect to:', `${API_BASE}${path}`)
        es = new EventSource(`${API_BASE}${path}`)

        es.onopen = () => {
          if (!isMounted) return
          console.log('[useSSE] Connected successfully to:', path)
          setIsConnected(true)
          // Clear any pending reconnect attempts
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        }

        es.onmessage = (e) => {
          if (!isMounted) return
          try {
            const data = JSON.parse(e.data)
            callbackRef.current?.(data)
          } catch (err) {
            console.error('[useSSE] Error parsing SSE data:', err)
          }
        }

        es.onerror = (err) => {
          console.error('[useSSE] EventSource error for', path, ':', err)
          setIsConnected(false)

          // Close the failed connection
          if (es) {
            es.close()
          }

          // Don't reconnect - SSE will auto-reconnect or we'll handle it on next mount
          // This prevents infinite reconnection loops that can cause issues
        }
      } catch (err) {
        console.error('[useSSE] Error creating EventSource:', err)
        setIsConnected(false)
      }
    }

    connect()

    return () => {
      console.log('[useSSE] Cleaning up connection to:', path)
      isMounted = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (es) {
        es.close()
      }
    }
  }, [path])

  return isConnected
}