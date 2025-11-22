import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Router from './Router'
import GlobalSearch from '../components/GlobalSearch'
import '../modern-override.css'

export default function App() {
  useEffect(() => {
    // Set up demo authentication
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBzeWxvbi5sb2NhbCIsInJvbGUiOiJhZG1pbiJ9.fake')
    localStorage.setItem('userRole', 'admin')
  }, [])

  return (
    <BrowserRouter>
      <GlobalSearch />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#e0e0e0',
            border: '1px solid #333',
          },
        }}
      />
      <Router />
    </BrowserRouter>
  )
}
