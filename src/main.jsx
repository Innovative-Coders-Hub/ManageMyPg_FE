import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppScopeProvider } from './context/AppScopeContext'
import './index.css'
// import './mock.js' // Disabled to use actual backend integration

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppScopeProvider>
        <App />
      </AppScopeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
