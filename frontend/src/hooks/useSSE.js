
import { useEffect } from 'react'
export function useSSE({ url, onEvent, enabled=true }) {
  useEffect(() => {
    if (!enabled) return
    let es
    try {
      es = new EventSource(url, { withCredentials: false })
      es.onmessage = (ev) => { try { onEvent?.(JSON.parse(ev.data)) } catch {} }
      es.onerror = () => {}
    } catch {}
    return () => { try { es && es.close() } catch {} }
  }, [url, enabled, onEvent])
}
