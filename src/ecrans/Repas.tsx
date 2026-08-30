/* L'onglet Repas : ce qui a été mangé, jour par jour, avec l'objectif de
   calories réparti entre les quatre repas — c'est cette répartition qui
   évite de tout dépenser au petit-déjeuner. */

import { useState } from 'react'
import BandeauSemaine from '../composants/BandeauSemaine'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import JaugeDemi from '../composants/JaugeDemi'
import { IconeFleche } from '../composants/Icones'
import { clefJour, deClefJour, jourCourt } from '../lib/dates'
import { totauxDuJour, useApp } from '../lib/etat'
import type { NomSymbole } from '../composants/Symbole'
import type { Vue } from '../lib/navigation'
import { supprimerPhoto, usePhoto } from '../lib/photos'
import { objectifCalories, objectifMacros } from '../lib/profil'
import type { LigneRepas, MomentRepas } from '../lib/stockage'

const MOMENTS: Array<{
  id: MomentRepas
  nom: string
  icone: NomSymbole
  fond: string
  couleur: string
  part: keyof Repartition
}> = [
  { id: 'petit-dejeuner', nom: 'Petit-déjeuner', icone: 'petit-dejeuner', fond: 'var(--miel-pale)', couleur: 'var(--miel)', part: 'petitDejeuner' },
  { id: 'dejeuner', nom: 'Déjeuner', icone: 'dejeuner', fond: 'var(--olive-pale)', couleur: 'var(--olive)', part: 'dejeuner' },
  { id: 'diner', nom: 'Dîner', icone: 'diner', fond: 'var(--canard-pale)', couleur: 'var(--canard)', part: 'diner' },
  { id: 'encas', nom: 'En-cas', icone: 'encas', fond: 'var(--argile-pale)', couleur: 'var(--argile)', part: 'encas' },
]

type Repartition = { petitDejeuner: number; dejeuner: number; diner: number; encas: number }

export default function Repas({ ouvrir }: { ouvrir: (vue: Vue) => void }) {
  const { etat, supprimerRepas } = useApp()
  const [jour, setJour] = useState(clefJour())
  // La photo qu'on regarde en grand quand on touche une vignette.
  const [photoOuverte, setPhotoOuverte] = useState<string | null>(null)
  const totaux = totauxDuJour(etat, jour)
  const but = objectifCalories(etat)
  const macros = but ? objectifMacros(but) : null
  const lignes = etat.repas.filter((r) => r.jour === jour)
  const bonus = etat.profil.ajouterKcalBrulees ? totaux.kcalBrulees : 0
  const restantes = but ? but - totaux.kcalMangees + bonus : null

  return (
    <div className="page">
      <Entete kicker="Manger" titre="Mes repas" ouvrirReglages={() => ouvrir({ nom: 'reglages' })} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <span className="pilule" style={{ background: 'var(--actif-fond)', color: 'var(--actif-texte)' }}>
          Repas
        </span>
        <button type="button" className="pilule" onClick={() => ouvrir({ nom: 'recettes' })}>
          Recettes
        </button>
      </div>

      <BandeauSemaine
        jour={jour}
        choisir={setJour}
        rempli={(clef) => etat.repas.some((r) => r.jour === clef)}
      />

      <div className="carte">
        {but === null ? (
          <p className="doux" style={{ margin: 0 }}>
            Notez votre poids et votre taille dans les réglages : l'objectif de calories se
            calculera tout seul.
          </p>
        ) : (
          <>
            <JaugeDemi
              part={totaux.kcalMangees / but}
              centre={String(Math.max(0, restantes ?? 0))}
              legendeCentre="kcal restantes"
              gauche={String(totaux.kcalMangees)}
              legendeGauche="Consommé"
              droite={String(totaux.kcalBrulees)}
              legendeDroite="Brûlé"
            />
            {macros && (
              <div className="grille3" style={{ marginTop: 12 }}>
                <Macro nom="Glucides" valeur={totaux.glucides} but={macros.glucides} couleur="var(--miel)" />
                <Macro nom="Protéines" valeur={totaux.proteines} but={macros.proteines} couleur="var(--olive)" />
                <Macro nom="Lipides" valeur={totaux.lipides} but={macros.lipides} couleur="var(--argile)" />
              </div>
            )}
          </>
        )}
      </div>

      <div className="rangee" style={{ margin: '18px 4px 10px' }}>
        <span style={{ fontWeight: 700 }}>Repas</span>
        <span className="doux mini">{jourCourt(deClefJour(jour))}</span>
      </div>

      {MOMENTS.map((moment) => {
        const duMoment = lignes.filter((l) => l.moment === moment.id)
        const total = duMoment.reduce((t, l) => t + l.kcal, 0)
        const cible = but ? Math.round(but * etat.profil.repartition[moment.part]) : null
        return (
          <div className="carte" key={moment.id}>
            <div className="rangee">
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  background: moment.fond,
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                  color: moment.couleur,
                }}
              >
                <Symbole nom={moment.icone} taille={22} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{moment.nom}</div>
                <div className="doux mini chiffre">
                  {total}
                  {cible !== null ? ` / ${cible}` : ''} kcal
                </div>
              </div>
              <button
                type="button"
                className="bouton"
                style={{ width: 'auto', padding: '10px 16px', flex: '0 0 auto' }}
                aria-label={`Ajouter au ${moment.nom.toLowerCase()}`}
                onClick={() => ouvrir({ nom: 'ajout', moment: moment.id })}
              >
                +
              </button>
            </div>

            {duMoment.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {duMoment.map((ligne) => (
                  <div key={ligne.id} className="ligne-liste">
                    <Vignette ligne={ligne} regarder={setPhotoOuverte} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{ligne.nom}</div>
                      <div className="doux mini">
                        {ligne.estime ? 'Estimé · ' : ''}
                        {ligne.unite !== 'portion' &&
                          `${ligne.quantite.toLocaleString('fr-FR')} ${ligne.unite} · `}
                        {ligne.glucides.toLocaleString('fr-FR')} g de glucides ·{' '}
                        {ligne.proteines.toLocaleString('fr-FR')} g de protéines
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="chiffre mini">{ligne.kcal}</span>
                      <button
                        type="button"
                        className="bouton-fin"
                        style={{ padding: '4px 10px' }}
                        aria-label="Retirer"
                        onClick={() => {
                          // La photo part avec la ligne : sinon la réserve
                          // d'images se remplit d'assiettes oubliées.
                          if (ligne.photoId) void supprimerPhoto(ligne.photoId)
                          supprimerRepas(ligne.id)
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <button
        type="button"
        className="carte"
        style={{ width: '100%', border: 0, textAlign: 'left' }}
        onClick={() => ouvrir({ nom: 'recettes' })}
      >
        <div className="rangee">
          <div>
            <div className="kicker">Idées</div>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Symbole nom="recette" taille={18} couleur="var(--olive)" /> Voir les recettes
            </div>
            <div className="doux mini">Rapides, légères, riches en protéines</div>
          </div>
          <IconeFleche />
        </div>
      </button>

      {photoOuverte && (
        <PhotoEnGrand id={photoOuverte} fermer={() => setPhotoOuverte(null)} />
      )}
    </div>
  )
}

/* La petite photo devant la ligne du repas — rien du tout s'il n'y en a pas. */
function Vignette({
  ligne,
  regarder,
}: {
  ligne: LigneRepas
  regarder: (id: string) => void
}) {
  const adresse = usePhoto(ligne.photoId)
  if (!ligne.photoId) return null
  return (
    <button
      type="button"
      aria-label={`Voir la photo de ${ligne.nom}`}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        border: 0,
        padding: 0,
        flex: '0 0 auto',
        overflow: 'hidden',
        background: 'var(--piste)',
      }}
      onClick={() => ligne.photoId && regarder(ligne.photoId)}
    >
      {adresse && (
        <img
          src={adresse}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
    </button>
  )
}

/* La photo en grand, par-dessus tout le reste. */
function PhotoEnGrand({ id, fermer }: { id: string; fermer: () => void }) {
  const adresse = usePhoto(id)
  return (
    <div
      className="voile"
      onClick={fermer}
      role="presentation"
      style={{ display: 'grid', placeItems: 'center', padding: 20, zIndex: 60 }}
    >
      {adresse && (
        <img
          src={adresse}
          alt="Le repas photographié"
          style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 18, display: 'block' }}
        />
      )}
    </div>
  )
}

function Macro({
  nom,
  valeur,
  but,
  couleur,
}: {
  nom: string
  valeur: number
  but: number
  couleur: string
}) {
  return (
    <div>
      <div className="doux mini" style={{ fontWeight: 700 }}>
        {nom}
      </div>
      <div className="chiffre" style={{ fontSize: 16 }}>
        {valeur}
        <span className="doux" style={{ fontSize: 11, fontWeight: 600 }}> / {but} g</span>
      </div>
      <div className="barre" style={{ height: 5, marginTop: 4 }}>
        <i style={{ width: `${Math.min(100, (valeur / but) * 100)}%`, background: couleur }} />
      </div>
    </div>
  )
}
