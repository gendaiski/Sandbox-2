import '@nanisoft/prism-ui/styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Explorer } from './Explorer'

// Start in the viewer's theme: an explicit data-theme wins, else the OS setting.
const theme = document.documentElement.dataset.theme
const initialDark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Explorer initialDark={initialDark} />
  </StrictMode>,
)
