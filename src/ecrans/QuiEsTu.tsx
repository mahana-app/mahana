/* « Qui es-tu ? » — posée une seule fois, à la première ouverture.

   Ce n'est pas une sécurité : le code de la maison a déjà fait ce travail.
   C'est ce qui permet à l'app de dire bonsoir par le prénom, et de cocher
   d'avance qui est allé faire les courses ou chercher à manger à la roulotte.
   Deux secondes maintenant, économisées cent fois ensuite. */

import Symbole from '../composants/Symbole'
import { useMaison } from '../lib/maison'
import { salutation } from '../lib/moi'
import { foyersFamille } from '../lib/types'

export default function QuiEsTu() {
  const { maison, direQuiJeSuis } = useMaison()
  // Ceux qui se servent de l'app, quel que soit leur âge : Mia et Manahiti
  // ont un téléphone, Eva a quatre ans.
  const gens = maison.membres.filter((m) => m.aUnTelephone && m.actif)

  return (
    <div className="page" style={{ paddingTop: 60 }}>
      <div style={{ textAlign: 'center', marginBottom: 26, color: 'var(--lagon)' }}>
        <span style={{ display: 'inline-block' }}>
          <Symbole nom="famille" taille={54} epaisseur={1.3} />
        </span>
        <h1 style={{ fontSize: 27, marginTop: 12 }}>{salutation()} ! Qui es-tu ?</h1>
        <p className="doux" style={{ margin: '6px 16px 0' }}>
          Juste pour savoir à qui est ce téléphone. On ne te le redemandera pas.
        </p>
      </div>

      {foyersFamille(maison).map((foyer) => {
        const siens = gens.filter((m) => m.foyerId === foyer.id)
        if (siens.length === 0) return null
        return (
          <div className="carte" key={foyer.id}>
            <div className="kicker" style={{ color: foyer.couleur }}>
              {foyer.nom}
            </div>
            <div className="grille2" style={{ marginTop: 10 }}>
              {siens.map((membre) => (
                <button
                  key={membre.id}
                  type="button"
                  className="choix"
                  style={{ padding: '14px 12px', textAlign: 'center' }}
                  onClick={() => direQuiJeSuis(membre.id)}
                >
                  <b style={{ fontSize: 16 }}>{membre.prenom}</b>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      <button type="button" className="bouton-fin" style={{ width: '100%' }} onClick={() => direQuiJeSuis('personne')}>
        Je suis quelqu'un d'autre — passer
      </button>
    </div>
  )
}
