import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Geist is not a system font — self-host it so the app doesn't silently fall
// back to system-ui, whose metrics differ from the real Rox UI.
import '@fontsource-variable/geist'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
