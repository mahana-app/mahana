/* Ce fichier ne sert plus qu'à effacer l'ancien.

   Mahana installait un service worker qui gardait l'app en mémoire pour
   fonctionner sans réseau. Sur les téléphones où elle était installée, ce
   service worker continuerait à servir l'ancienne application indéfiniment :
   il faut lui dire de s'effacer, et il ne peut le faire que lui-même.

   Le navigateur va chercher ce fichier tout seul à chaque ouverture et voit
   qu'il a changé. Il l'installe, et celui-ci se supprime au passage.

   Fare ne garde rien en réserve pour l'instant, et c'est voulu : les comptes
   des deux foyers viennent du serveur, et un chiffre périmé affiché comme
   s'il était à jour serait pire qu'une attente de deux secondes. */

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (evenement) => {
  evenement.waitUntil(
    (async () => {
      const noms = await caches.keys()
      await Promise.all(noms.map((nom) => caches.delete(nom)))
      await self.registration.unregister()
      // On recharge les onglets ouverts : sans ça, celui qui a l'app sous les
      // yeux continue de voir Mahana jusqu'à ce qu'il la ferme.
      const fenetres = await self.clients.matchAll({ type: 'window' })
      for (const fenetre of fenetres) fenetre.navigate(fenetre.url)
    })(),
  )
})
