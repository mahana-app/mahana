/* Le mode hors ligne : une fois l'app ouverte une première fois, elle
   fonctionne sans réseau — utile en voiture, en avion, ou avec trois barres. */

const CACHE = 'mahana-v1'
const SOCLE = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SOCLE)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((noms) => Promise.all(noms.filter((nom) => nom !== CACHE).map((nom) => caches.delete(nom))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const requete = event.request
  if (requete.method !== 'GET') return

  // L'ouverture de l'app : le réseau d'abord, pour attraper les mises à jour,
  // et la page gardée en réserve si ça ne répond pas.
  if (requete.mode === 'navigate') {
    event.respondWith(
      fetch(requete)
        .then((reponse) => {
          const copie = reponse.clone()
          caches.open(CACHE).then((cache) => cache.put('/index.html', copie))
          return reponse
        })
        .catch(() => caches.match('/index.html').then((page) => page || Response.error())),
    )
    return
  }

  if (new URL(requete.url).origin !== self.location.origin) return

  // Le reste (scripts, images) porte un nom unique par version : on peut le
  // servir depuis la réserve sans risquer de servir du vieux.
  event.respondWith(
    caches.match(requete).then(
      (garde) =>
        garde ||
        fetch(requete).then((reponse) => {
          const copie = reponse.clone()
          if (reponse.ok) caches.open(CACHE).then((cache) => cache.put(requete, copie))
          return reponse
        }),
    ),
  )
})
