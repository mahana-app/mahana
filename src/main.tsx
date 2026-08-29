import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { FournisseurEtat } from './lib/etat'
import './theme.css'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <FournisseurEtat>
      <App />
    </FournisseurEtat>
  </StrictMode>,
)

// Le service worker garde l'app utilisable sans réseau, une fois installée.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Pas de mode hors ligne : ce n'est pas une raison d'empêcher l'app de tourner.
    })
  })
}
