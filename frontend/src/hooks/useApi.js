import { useState, useEffect, useCallback } from 'react'

export function useApi(apiCall, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred')
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useApiMutation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (apiCall) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()
      return { success: true, data: response.data }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'An error occurred'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  return { mutate, loading, error }
}