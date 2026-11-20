import React from 'react'
import ReactDOM from 'react-dom/client'
import Docs from './Docs'
import '../styles/global.css'
import '../styles/docs.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Docs />
  </React.StrictMode>,
)
