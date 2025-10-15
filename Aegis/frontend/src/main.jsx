import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './ui/App.jsx'

console.log("Loaded main.jsx");

createRoot(document.getElementById('root')).render(<App />)
