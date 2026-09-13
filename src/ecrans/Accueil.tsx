/* L'accueil : la maison d'un coup d'œil.

   Trois questions, dans l'ordre où on se les pose en ouvrant l'app — qui doit
   quoi entre les foyers, combien il reste dans la caisse, et combien on doit
   à la roulotte. Le reste est à un doigt. */

import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { QuiDoitQuoi } from './Charges'
import { chargeSoldee, duALaRoulotte, etatCaisse, fcfp, moisDe, moisEnMots } from '../lib/argent'
import { useMaison } from '../lib/maison'
import type { Onglet } from '../composants/BarreOnglets'
import type { Vue } from '../lib/navigation'

export default function Accueil({
  ouvrir,
  allerA,
}: {
  ouvrir: (vue: Vue) => void
  allerA: (onglet: Onglet) => void
}) {
  const { maison } = useMaison()
  const periode = moisDe()
  const caisse = etatCaisse(maison)
  const du = duALaRoulotte(maison)
  const totalRoulotte = Object.values(du).reduce((somme, v) => somme + v, 0)
  const enAttente = maison.charges.filter((c) => !chargeSoldee(maison, c))
  const aPayer = enAttente.filter((c) => !c.avanceePar)

  return (
    <div className="page">
      <Entete
        kicker={moisEnMots(periode)}
        titre="À la maison"
        ouvrirReglages={() => ouvrir({ nom: 'maisonnee' })}
      />

      <QuiDoitQuoi />

      <div className="grille2">
        <button
          type="button"
          className="carte"
          style={{ border: 0, textAlign: 'left', marginBottom: 0 }}
          onClick={() => allerA('caisse')}
        >
          <div style={{ color: 'var(--lagon)' }}>
            <Symbole nom="panier" taille={20} />
          </div>
          <div className="kicker" style={{ marginTop: 8 }}>
            La caisse
          </div>
          <div className="chiffre" style={{ fontSize: 21 }}>
            {fcfp(caisse.solde)}
          </div>
          <div className="doux mini">pour les courses en gros</div>
        </button>

        <button
          type="button"
          className="carte"
          style={{ border: 0, textAlign: 'left', marginBottom: 0 }}
          onClick={() => allerA('ardoise')}
        >
          <div style={{ color: totalRoulotte > 0 ? 'var(--corail)' : 'var(--feuille)' }}>
            <Symbole nom="roulotte" taille={20} />
          </div>
          <div className="kicker" style={{ marginTop: 8 }}>
            La roulotte
          </div>
          <div className="chiffre" style={{ fontSize: 21 }}>
            {fcfp(totalRoulotte)}
          </div>
          <div className="doux mini">
            {totalRoulotte > 0 ? 'à lui rembourser' : 'tout est remboursé'}
          </div>
        </button>
      </div>

      <div style={{ height: 13 }} />

      <button
        type="button"
        className="carte"
        style={{ width: '100%', border: 0, textAlign: 'left' }}
        onClick={() => allerA('charges')}
      >
        <div className="rangee">
          <span
            className="pastille"
            style={{ width: 46, height: 46, background: 'var(--ocre-pale)', color: 'var(--ocre)' }}
          >
            <Symbole nom="eclair" taille={21} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="kicker">Les charges</div>
            <div style={{ fontWeight: 700 }}>
              {enAttente.length === 0
                ? 'Tout est réglé'
                : `${enAttente.length} facture${enAttente.length > 1 ? 's' : ''} en attente`}
            </div>
            <div className="doux mini">
              {aPayer.length > 0
                ? `dont ${aPayer.length} pas encore payée${aPayer.length > 1 ? 's' : ''} au fournisseur`
                : 'électricité, eau, internet, impôts, déchets'}
            </div>
          </div>
          <Symbole nom="fleche" taille={18} couleur="var(--estompe)" />
        </div>
      </button>

      {maison.membres.length === 0 && (
        <button
          type="button"
          className="carte"
          style={{ width: '100%', border: 0, textAlign: 'left', background: 'var(--lagon-pale)' }}
          onClick={() => ouvrir({ nom: 'maisonnee' })}
        >
          <div className="rangee">
            <span
              className="pastille"
              style={{ width: 46, height: 46, background: 'var(--creme)', color: 'var(--lagon)' }}
            >
              <Symbole nom="famille" taille={21} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="kicker">Pour commencer</div>
              <div style={{ fontWeight: 700 }}>Dire qui vit ici</div>
              <div className="doux mini">
                Les deux foyers, leur part des charges et ce que chacun verse dans la caisse.
              </div>
            </div>
            <Symbole nom="fleche" taille={18} couleur="var(--estompe)" />
          </div>
        </button>
      )}
    </div>
  )
}
