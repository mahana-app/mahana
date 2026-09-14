/* L'accueil : la maison d'un coup d'œil.

   Trois questions, dans l'ordre où on se les pose en ouvrant l'app — qui doit
   quoi entre les foyers, combien il reste dans la caisse, et combien on doit
   à la roulotte. Le reste est à un doigt. */

import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { QuiDoitQuoi } from './Charges'
import {
  chargeSoldee,
  duALaRoulotte,
  etatCaisse,
  fcfp,
  jourDe,
  moisDe,
  moisEnMots,
} from '../lib/argent'
import { useMaison } from '../lib/maison'
import { salutation } from '../lib/moi'
import {
  dansCombien,
  joursAvant,
  jourEnMots,
  passagesAVenir,
  sortirCeWeekEnd,
  tourneeDe,
} from '../lib/dechets'
import { membreDe } from '../lib/types'
import type { Onglet } from '../composants/BarreOnglets'
import type { Vue } from '../lib/navigation'

export default function Accueil({
  ouvrir,
  allerA,
}: {
  ouvrir: (vue: Vue) => void
  allerA: (onglet: Onglet) => void
}) {
  const { maison, moiId } = useMaison()
  const periode = moisDe()
  const caisse = etatCaisse(maison)
  const du = duALaRoulotte(maison)
  const totalRoulotte = Object.values(du).reduce((somme, v) => somme + v, 0)
  const moi = membreDe(maison, moiId)
  const enAttente = maison.charges.filter((c) => !chargeSoldee(maison, c))
  const aPayer = enAttente.filter((c) => !c.avanceePar)

  // Le ramassage des encombrants ne passe qu'une semaine par mois : manqué,
  // c'est un mois de plus avec le vieux canapé sous l'auvent.
  const dechets = maison.reglages.dechets
  const prochainRamassage = passagesAVenir(dechets, jourDe())[0]
  const dansCombienDeJours = prochainRamassage ? joursAvant(prochainRamassage, jourDe()) : null
  const aSortir = dansCombienDeJours !== null && sortirCeWeekEnd(dansCombienDeJours)

  return (
    <div className="page">
      <Entete
        kicker={moi ? `${salutation()} ${moi.prenom}` : moisEnMots(periode)}
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


      {/* Les déchets verts : la carte ne prend le devant que quand le passage
          approche. Le reste du mois, elle reste discrète. */}
      <button
        type="button"
        className="carte"
        style={{
          width: '100%',
          border: 0,
          textAlign: 'left',
          background: aSortir ? 'var(--corail-pale)' : undefined,
        }}
        onClick={() => ouvrir({ nom: 'dechets' })}
      >
        <div className="rangee">
          <span
            className="pastille"
            style={{
              width: 46,
              height: 46,
              background: aSortir ? 'var(--creme)' : 'var(--feuille-pale)',
              color: 'var(--feuille)',
            }}
          >
            <Symbole nom="poubelle" taille={21} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="kicker">Déchets verts et encombrants</div>
            <div style={{ fontWeight: 700 }}>
              {!dechets.tournee
                ? 'Choisir notre tournée'
                : !prochainRamassage
                  ? 'Pas de date connue'
                  : aSortir
                    ? 'À sortir maintenant'
                    : `Passage le ${jourEnMots(prochainRamassage)}`}
            </div>
            <div className="doux mini">
              {!dechets.tournee
                ? 'pour connaître le jour de passage'
                : !prochainRamassage
                  ? 'ajouter les semaines du prochain calendrier'
                  : `${tourneeDe(dechets.tournee)?.jour} · ${dansCombienDeJours === null ? '' : dansCombien(dansCombienDeJours)}`}
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
