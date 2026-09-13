import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { FournisseurMaison } from './lib/maison'
import './theme.css'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <FournisseurMaison>
      <App />
    </FournisseurMaison>
  </StrictMode>,
)

/* Le service worker de Mahana gardait l'ancienne app en réserve sur les
   téléphones où elle était installée. On le désinscrit au passage : le
   fichier `public/sw.js` s'en charge aussi de son côté, mais celui-ci
   rattrape les navigateurs qui auraient déjà la nouvelle page. */
if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((inscriptions) => {
    for (const inscription of inscriptions) void inscription.unregister()
  })
}
