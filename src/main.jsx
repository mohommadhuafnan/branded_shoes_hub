import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ShopProvider>
        <App />
      </ShopProvider>
    </HashRouter>
  </StrictMode>,
)
