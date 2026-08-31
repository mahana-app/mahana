/* Monter sa propre séance, dans n'importe quelle famille de sport.

   Les séances du catalogue conviennent au début ; ensuite chacune a ses
   habitudes — le circuit de la salle, l'enchaînement du coach, les cinq
   exercices qu'on fait toujours le mardi. Une fois écrite, la séance se joue
   exactement comme les autres, avec ses minuteurs de série et de repos.

   La durée n'est pas demandée : elle se calcule à partir des exercices. Une
   durée saisie à la main et des exercices qui ne collent pas, c'est la porte
   ouverte aux calories fantaisistes. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { useApp } from '../lib/etat'
import { poidsActuel } from '../lib/profil'
import { FAMILLES, INTENSITES, caloriesSeance, versSeance } from '../lib/sport'
import type { CategorieSport, ExercicePerso, IntensiteSeance, SeancePerso } from '../lib/stockage'

type Brouillon = ExercicePerso & { cle: string }

const NOUVEAU: Omit<Brouillon, 'cle'> = {
  nom: '',
  series: 3,
  reps: 12,
  secondes: null,
  repos: 45,
  consigne: '',
}

let compteur = 0
const nouvelleCle = () => `e${++compteur}`

export default function MaSeance({
  id,
  categorie: depart,
  fermer,
}: {
  id?: string
  categorie?: CategorieSport
  fermer: () => void
}) {
  const { etat, ajouterSeancePerso, modifierSeancePerso, supprimerSeancePerso } = useApp()
  const existante = id ? etat.mesSeances.find((s) => s.id === id) : undefined
  const poids = poidsActuel(etat) ?? 70

  const [nom, setNom] = useState(existante?.nom ?? '')
  const [sousTitre, setSousTitre] = useState(existante?.sousTitre ?? '')
  const [categorie, setCategorie] = useState<CategorieSport>(existante?.categorie ?? depart ?? 'muscu')
  const [intensite, setIntensite] = useState<IntensiteSeance>(existante?.intensite ?? 'moderee')
  const [exercices, setExercices] = useState<Brouillon[]>(
    (existante?.exercices ?? [{ ...NOUVEAU }]).map((e) => ({ ...e, cle: nouvelleCle() })),
  )

  if (id && !existante) {
    return (
      <div className="page">
        <Entete kicker="Ma séance" titre="Introuvable" retour={fermer} />
      </div>
    )
  }

  const propres: ExercicePerso[] = exercices
    .filter((e) => e.nom.trim().length > 0)
    .map(({ cle: _cle, ...reste }) => reste)

  // L'aperçu passe par la même conversion que le lecteur : ce qui est annoncé
  // ici est exactement ce qui sera compté à la fin de la séance.
  const apercu = versSeance({
    id: 'apercu',
    categorie,
    nom: nom || 'Ma séance',
    sousTitre,
    intensite,
    exercices: propres,
    creee: '',
  } as SeancePerso)
  const kcal = caloriesSeance(apercu.met, apercu.minutes, poids)

  const modifier = (cle: string, changements: Partial<Brouillon>) =>
    setExercices((liste) => liste.map((e) => (e.cle === cle ? { ...e, ...changements } : e)))

  function enregistrer() {
    const commun = {
      categorie,
      nom: nom.trim() || 'Ma séance',
      sousTitre: sousTitre.trim(),
      intensite,
      exercices: propres,
    }
    if (existante) modifierSeancePerso(existante.id, commun)
    else ajouterSeancePerso(commun)
    fermer()
  }

  return (
    <div className="page">
      <Entete
        kicker="Mes séances"
        titre={existante ? 'Modifier ma séance' : 'Créer ma séance'}
        retour={fermer}
      />

      <div className="carte">
        <label className="etiquette" htmlFor="nom-seance-perso">
          Le nom de la séance
        </label>
        <input
          id="nom-seance-perso"
          className="champ"
          autoFocus={!existante}
          placeholder="ex. Mon circuit du mardi"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="sous-titre-seance">
          En deux mots (facultatif)
        </label>
        <input
          id="sous-titre-seance"
          className="champ"
          placeholder="ex. Fessiers et gainage"
          value={sousTitre}
          onChange={(e) => setSousTitre(e.target.value)}
        />
      </div>

      <div className="carte">
        <div className="kicker">Dans quel sport</div>
        <div className="grille2" style={{ marginTop: 10 }}>
          {FAMILLES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`choix${categorie === f.id ? ' actif' : ''}`}
              style={{ padding: '10px 12px', textAlign: 'center' }}
              onClick={() => setCategorie(f.id)}
            >
              <span style={{ display: 'block', color: f.couleur }}>
                <Symbole nom={f.icone} taille={20} />
              </span>
              <b style={{ fontSize: 14 }}>{f.nom}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="carte">
        <div className="kicker">L'effort</div>
        <p className="doux mini" style={{ margin: '6px 0 0' }}>
          C'est lui qui décide des calories brûlées, avec la durée et votre poids.
        </p>
        <div className="grille3" style={{ marginTop: 10 }}>
          {INTENSITES.map((i) => (
            <button
              key={i.id}
              type="button"
              className={`choix${intensite === i.id ? ' actif' : ''}`}
              style={{ padding: '10px 8px' }}
              onClick={() => setIntensite(i.id)}
            >
              <b style={{ fontSize: 14 }}>{i.nom}</b>
              <span className="doux mini" style={{ display: 'block' }}>
                {i.detail}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- les exercices ---------- */}
      <div className="titre-section">Les exercices</div>

      {exercices.map((exercice, index) => (
        <div key={exercice.cle} className="carte">
          <div className="rangee" style={{ marginBottom: 8 }}>
            <span className="kicker">Exercice {index + 1}</span>
            {exercices.length > 1 && (
              <button
                type="button"
                className="bouton-fin"
                style={{ padding: '4px 10px' }}
                aria-label={`Retirer l'exercice ${index + 1}`}
                onClick={() => setExercices((l) => l.filter((e) => e.cle !== exercice.cle))}
              >
                ✕
              </button>
            )}
          </div>

          <input
            className="champ"
            placeholder="Le mouvement — ex. Squats"
            value={exercice.nom}
            onChange={(e) => modifier(exercice.cle, { nom: e.target.value })}
          />

          <div className="grille2" style={{ marginTop: 10 }}>
            <button
              type="button"
              className={`choix${exercice.secondes === null ? ' actif' : ''}`}
              style={{ padding: '9px 10px', textAlign: 'center', fontSize: 13, fontWeight: 700 }}
              onClick={() => modifier(exercice.cle, { reps: exercice.reps ?? 12, secondes: null })}
            >
              Des répétitions
            </button>
            <button
              type="button"
              className={`choix${exercice.secondes !== null ? ' actif' : ''}`}
              style={{ padding: '9px 10px', textAlign: 'center', fontSize: 13, fontWeight: 700 }}
              onClick={() =>
                modifier(exercice.cle, { secondes: exercice.secondes ?? 40, reps: null })
              }
            >
              Une durée
            </button>
          </div>

          <div className="grille3" style={{ marginTop: 10 }}>
            <div>
              <label className="etiquette">Séries</label>
              <input
                className="champ"
                inputMode="numeric"
                value={exercice.series}
                onChange={(e) =>
                  modifier(exercice.cle, { series: Math.max(1, Number(e.target.value) || 1) })
                }
              />
            </div>
            <div>
              <label className="etiquette">
                {exercice.secondes === null ? 'Répétitions' : 'Secondes'}
              </label>
              <input
                className="champ"
                inputMode="numeric"
                value={exercice.secondes === null ? (exercice.reps ?? '') : exercice.secondes}
                onChange={(e) => {
                  const valeur = Math.max(0, Number(e.target.value) || 0)
                  modifier(
                    exercice.cle,
                    exercice.secondes === null ? { reps: valeur } : { secondes: valeur },
                  )
                }}
              />
            </div>
            <div>
              <label className="etiquette">Repos (s)</label>
              <input
                className="champ"
                inputMode="numeric"
                value={exercice.repos}
                onChange={(e) =>
                  modifier(exercice.cle, { repos: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </div>
          </div>

          <label className="etiquette" style={{ marginTop: 10 }}>
            La consigne (facultative)
          </label>
          <input
            className="champ"
            placeholder="ex. Talons au sol, dos droit"
            value={exercice.consigne}
            onChange={(e) => modifier(exercice.cle, { consigne: e.target.value })}
          />
        </div>
      ))}

      <button
        type="button"
        className="bouton-fin"
        style={{ width: '100%', marginBottom: 14 }}
        onClick={() => setExercices((l) => [...l, { ...NOUVEAU, cle: nouvelleCle() }])}
      >
        + Ajouter un exercice
      </button>

      {/* ---------- ce que ça donne ---------- */}
      <div className="carte" style={{ background: 'var(--argile-pale)' }}>
        <div className="rangee">
          <div>
            <div className="kicker">Cette séance dure</div>
            <div className="chiffre" style={{ fontSize: 30 }}>
              {propres.length === 0 ? '—' : apercu.minutes}
              <span className="doux" style={{ fontSize: 15, fontWeight: 500 }}> min</span>
            </div>
            <div className="doux mini">
              {propres.length} exercice{propres.length > 1 ? 's' : ''} ·{' '}
              {propres.length === 0 ? '—' : `≈ ${kcal} kcal brûlées`}
            </div>
          </div>
          <Symbole nom="flamme" taille={28} couleur="var(--argile)" />
        </div>
        <p className="doux mini" style={{ margin: '10px 0 0', lineHeight: 1.7 }}>
          Calculé sur les séries, les repos et votre poids ({poids} kg). Un exercice compté en
          répétitions vaut environ trois secondes par répétition.
        </p>
      </div>

      <button
        type="button"
        className="bouton"
        disabled={nom.trim().length === 0 || propres.length === 0}
        onClick={enregistrer}
      >
        {existante ? 'Enregistrer les changements' : 'Garder cette séance'}
      </button>

      {existante && (
        <>
          <div style={{ height: 10 }} />
          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%', color: 'var(--alerte)' }}
            onClick={() => {
              if (!confirm(`Supprimer « ${existante.nom} » de mes séances ?`)) return
              supprimerSeancePerso(existante.id)
              fermer()
            }}
          >
            Supprimer cette séance
          </button>
        </>
      )}
    </div>
  )
}
