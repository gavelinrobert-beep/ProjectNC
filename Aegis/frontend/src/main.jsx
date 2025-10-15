
import React from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import App from './ui/App.jsx'

createRoot(document.getElementById('root')).render(<App />)

