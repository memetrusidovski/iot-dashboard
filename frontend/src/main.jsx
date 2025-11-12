import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // ← Make sure this line exists!
import App from './App.jsx'
import { initTheme } from './utils/theme'

initTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)