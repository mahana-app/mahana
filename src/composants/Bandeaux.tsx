/* Les deux messages qui doivent rester sous les yeux.

   Le premier prévient que l'app tourne sans serveur : ce qu'on y note ne
   part nulle part et personne d'autre ne le voit. Le laisser silencieux
   serait un piège — on croirait la maison au courant alors que non.

   Le second affiche le message de la base, mot pour mot, quand elle refuse.
   Un écran qui ne peut pas lire ne doit jamais afficher une liste vide :
   ça se lit comme « il n'y a rien », et on cherche au mauvais endroit. */

export function BandeauEssai() {
  return (
    <div className="bandeau essai">
      <b>Mode essai.</b> Le serveur n'est pas encore branché : tout ce que vous notez reste dans
      ce téléphone, et personne d'autre ne le voit. Parfait pour regarder à quoi ça ressemble.
    </div>
  )
}

export function BandeauErreur({ message }: { message: string }) {
  return (
    <div className="bandeau erreur">
      <b>La base a refusé.</b> {message}
    </div>
  )
}
