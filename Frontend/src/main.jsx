import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const initialPalette = localStorage.getItem('nexus-palette') || 'sunburst';
const initialTheme = localStorage.getItem('nexus-theme') || 'dark';
document.documentElement.setAttribute('data-palette', initialPalette);
document.documentElement.setAttribute('data-theme', initialTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
