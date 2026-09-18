import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import './premium.css'
import './polish.css'
import './glass.css'
import './interaction-polish.css'
import './navigation.css'
