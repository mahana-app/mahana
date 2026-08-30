/* L'écran du jeûne.

   Le jeûne se programme à une heure — c'est ce qui fait qu'on le tient : on
   ne décide pas au moment où on a faim. L'anneau porte les étapes du corps
   tout autour, pour voir d'un coup d'œil où on en est. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { IconeCrayon } from '../composants/Icones'
import {
  chrono,
  clefJour,
  depuisChampHeure,
  duree,
  heureCourte,
  jourRelatif,
} from '../lib/dates'
import { useApp, useHorloge } from '../lib/etat'
import {
  PHASES,
  dureeMs,
  jeuneEnCours,
  jeunesTermines,
  objectifAtteint,
  phaseA,
  phaseSuivante,
  planParId,
  serie,
} from '../lib/jeune'
import type { Vue } from '../lib/navigation'
import { RECETTES } from '../lib/recettes'

const HEURE = 3_600_000

export default function EcranJeune({ ouvrir }: { ouvrir: (vue: Vue) => void }) {
  const { etat, commencer, terminer, abandonner, corrigerDebut, reglerLe, ajouterJeunePasse } =
    useApp()
  const enCours = jeuneEnCours(etat)
  const maintenant = useHorloge()
  const [corrige, setCorrige] = useState(false)
  const [ajout, setAjout] = useState(false)

  const objectifHeures = enCours?.objectifHeures ?? etat.profil.objectifJeuneHeures
  const objectifMs = objectifHeures * HEURE
  const ecoule = enCours ? dureeMs(enCours, maintenant) : 0
  const reste = objectifMs - ecoule
  const atteint = reste <= 0
  const heuresEcoulees = ecoule / HEURE
  const phase = phaseA(heuresEcoulees)
  const suivante = phaseSuivante(heuresEcoulees)
  const plan = planParId(etat.profil.planJeune)
  const jours = serie(etat)

  /* Le prochain jeûne : l'heure réglée, aujourd'hui si elle n'est pas passée,
     demain sinon. */
  const prevuDebut = (() => {
    const [h, m] = etat.profil.heureJeune.split(':').map(Number)
    const date = new Date(maintenant)
    date.setHours(h, m, 0, 0)
    if (date.getTime() < maintenant) date.setDate(date.getDate() + 1)
    return date
  })()
  const prevuFin = new Date(prevuDebut.getTime() + objectifMs)

  const debut = enCours ? new Date(enCours.debut) : null
  const finPrevue = debut ? new Date(debut.getTime() + objectifMs) : null

  return (
    <div className="page">
      <Entete
        kicker={etat.profil.prenom ? `${etat.profil.prenom}, votre jeûne` : 'Votre jeûne'}
        titre={enCours ? 'Jeûne en cours' : 'Prochain jeûne'}
        ouvrirReglages={() => ouvrir({ nom: 'reglages' })}
      />

      {/* le plan choisi */}
      <div className="carte serree">
        <div className="rangee">
          <span style={{ fontWeight: 700 }}>Mon plan de jeûne</span>
          <button
            type="button"
            className="pilule menthe"
            onClick={() => ouvrir({ nom: 'reglages' })}
          >
            {plan.nom} <IconeCrayon taille={13} />
          </button>
        </div>
      </div>

      {jours > 0 && (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span className="pilule corail">
            🔥 {jours} jour{jours > 1 ? 's' : ''} d'affilée
          </span>
        </div>
      )}

      {/* l'anneau et ses étapes */}
      <AnneauEtapes
        part={enCours ? ecoule / objectifMs : 0}
        heures={heuresEcoulees}
        atteint={atteint}
      >
        {enCours ? (
          <>
            <div className="kicker">{atteint ? 'Objectif atteint' : 'Temps de jeûne'}</div>
            <div className="chiffre" style={{ fontSize: 34, letterSpacing: '-0.02em' }}>
              {chrono(ecoule)}
            </div>
            <div className="doux mini">
              {atteint ? `${duree(-reste)} de plus` : `il reste ${duree(reste)}`}
            </div>
          </>
        ) : (
          <>
            <div className="kicker">Commencer le jeûne</div>
            <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.2, marginTop: 2 }}>
              {jourRelatif(prevuDebut)},
              <br />
              {heureCourte(prevuDebut)}
            </div>
            <div className="doux mini" style={{ marginTop: 4 }}>
              {objectifHeures} h de jeûne
            </div>
          </>
        )}
      </AnneauEtapes>

      {enCours ? (
        <>
          <button type="button" className="bouton corail" onClick={terminer}>
            {atteint ? '🎉 Terminer le jeûne' : 'Terminer le jeûne'}
          </button>

          <div className="carte rangee" style={{ marginTop: 14 }}>
            <div>
              <div className="kicker">Commencé</div>
              <div className="chiffre" style={{ fontSize: 19 }}>
                {heureCourte(debut as Date)}
              </div>
              <div className="doux mini">{jourRelatif(debut as Date)}</div>
            </div>
            <div style={{ color: 'var(--estompe)' }}>→</div>
            <div style={{ textAlign: 'right' }}>
              <div className="kicker">Objectif</div>
              <div className="chiffre" style={{ fontSize: 19 }}>
                {heureCourte(finPrevue as Date)}
              </div>
              <div className="doux mini">{jourRelatif(finPrevue as Date)}</div>
            </div>
          </div>

          <div className="carte">
            <div className="rangee" style={{ alignItems: 'flex-start' }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>{phase.emoji}</div>
              <div style={{ flex: 1 }}>
                <div className="kicker">Ce qui se passe</div>
                <h2>{phase.nom}</h2>
                <p className="doux" style={{ margin: '4px 0 0' }}>
                  {phase.texte}
                </p>
                {suivante && (
                  <p className="doux mini" style={{ margin: '8px 0 0', color: 'var(--estompe)' }}>
                    Prochaine étape : {suivante.nom}, dans{' '}
                    {duree((suivante.debut - heuresEcoulees) * HEURE)}.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="bouton-fin" onClick={() => setCorrige(!corrige)}>
              <IconeCrayon /> Corriger l'heure de début
            </button>
            <button
              type="button"
              className="bouton-fin"
              onClick={() => {
                if (confirm('Annuler ce jeûne ? Il ne sera pas gardé.')) abandonner()
              }}
            >
              Annuler
            </button>
          </div>

          {corrige && debut && (
            <div className="carte" style={{ marginTop: 12 }}>
              <label className="etiquette" htmlFor="debut">
                Vraie heure du dernier repas
              </label>
              <input
                id="debut"
                type="datetime-local"
                className="champ"
                value={champDateHeure(debut)}
                max={champDateHeure(new Date(maintenant))}
                onChange={(e) => {
                  const choisi = new Date(e.target.value)
                  if (!Number.isNaN(choisi.getTime()) && choisi.getTime() <= Date.now()) {
                    corrigerDebut(choisi)
                  }
                }}
              />
              <p className="doux mini" style={{ marginBottom: 0 }}>
                Utile quand on a pensé au minuteur une heure après avoir posé la fourchette.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <button type="button" className="bouton" onClick={() => commencer()}>
            Démarrer maintenant
          </button>

          <div className="carte" style={{ marginTop: 14 }}>
            <div className="rangee" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="kicker">Commencer le jeûne</div>
                <input
                  type="time"
                  className="champ"
                  style={{ marginTop: 6 }}
                  value={etat.profil.heureJeune}
                  onChange={(e) => reglerLe({ heureJeune: e.target.value || '20:00' })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div className="kicker">Terminer le jeûne</div>
                <div
                  className="champ"
                  style={{ marginTop: 6, background: 'var(--piste)', border: 0 }}
                >
                  {heureCourte(prevuFin)}
                </div>
              </div>
            </div>
            <p className="doux mini" style={{ margin: '10px 0 0' }}>
              L'heure de fin se calcule toute seule à partir du plan {plan.nom}. Pour la changer,
              changez le plan dans les réglages.
            </p>
          </div>
        </>
      )}

      {/* pour rompre le jeûne */}
      <div className="titre-section">Pour rompre le jeûne</div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
        {RECETTES.filter((r) => r.categorie === 'rompre').map((recette) => (
          <button
            key={recette.id}
            type="button"
            className="carte"
            style={{
              flex: '0 0 160px',
              border: 0,
              textAlign: 'left',
              marginBottom: 4,
              padding: 14,
            }}
            onClick={() => ouvrir({ nom: 'recette', id: recette.id })}
          >
            <div
              style={{
                height: 62,
                borderRadius: 14,
                background: recette.couleur,
                display: 'grid',
                placeItems: 'center',
                fontSize: 30,
              }}
            >
              {recette.emoji}
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 8, lineHeight: 1.25 }}>
              {recette.nom}
            </div>
            <div className="doux mini">
              {recette.kcal} kcal · {recette.minutes} min
            </div>
          </button>
        ))}
      </div>

      {/* ajouter un jeûne oublié */}
      {ajout ? (
        <AjoutJeunePasse
          enregistrer={(debut, fin) => {
            ajouterJeunePasse(debut, fin)
            setAjout(false)
          }}
          annuler={() => setAjout(false)}
        />
      ) : (
        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%' }}
          onClick={() => setAjout(true)}
        >
          + Ajouter un jeûne oublié
        </button>
      )}

      <HistoriqueJeunes />
    </div>
  )
}

/* ---------- l'anneau avec les étapes du corps posées autour ---------- */

function AnneauEtapes({
  part,
  heures,
  atteint,
  children,
}: {
  part: number
  heures: number
  atteint: boolean
  children: React.ReactNode
}) {
  const taille = 250
  const epaisseur = 16
  const rayon = (taille - epaisseur) / 2
  const tour = 2 * Math.PI * rayon
  const avance = Math.min(1, Math.max(0, part))
  // Les étapes sont réparties sur vingt-quatre heures : le tour du cadran.
  const surLeTour = (h: number) => (h / 24) * 2 * Math.PI - Math.PI / 2

  return (
    <div style={{ position: 'relative', width: taille, height: taille, margin: '6px auto 18px' }}>
      <svg width={taille} height={taille} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <defs>
          <linearGradient id="degradeJeune" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={atteint ? '#f6b45e' : '#34b795'} />
            <stop offset="100%" stopColor={atteint ? '#f4886c' : '#1f9a86'} />
          </linearGradient>
        </defs>
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          fill="none"
          stroke="var(--piste)"
          strokeWidth={epaisseur}
        />
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          fill="none"
          stroke="url(#degradeJeune)"
          strokeWidth={epaisseur}
          strokeLinecap="round"
          strokeDasharray={tour}
          strokeDashoffset={tour * (1 - avance)}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>

      {PHASES.filter((p) => p.debut > 0 && p.debut < 24).map((phase) => {
        const angle = surLeTour(phase.debut)
        const x = taille / 2 + Math.cos(angle) * rayon
        const y = taille / 2 + Math.sin(angle) * rayon
        const passee = heures >= phase.debut
        return (
          <div
            key={phase.nom}
            title={`${phase.nom} — ${phase.debut} h`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              width: 34,
              height: 34,
              borderRadius: 999,
              background: passee ? 'var(--menthe-pale)' : '#fff',
              border: `2px solid ${passee ? 'var(--menthe)' : 'var(--bord)'}`,
              boxShadow: '0 2px 8px rgba(29,47,56,.12)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 16,
              opacity: passee ? 1 : 0.5,
            }}
          >
            {phase.emoji}
          </div>
        )
      })}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 44,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ---------- noter un jeûne après coup ---------- */

function AjoutJeunePasse({
  enregistrer,
  annuler,
}: {
  enregistrer: (debut: Date, fin: Date) => void
  annuler: () => void
}) {
  // Par défaut, hier : c'est presque toujours le jeûne qu'on a oublié de noter.
  const [jour, setJour] = useState(() => clefJour(new Date(Date.now() - 864e5)))
  const [debut, setDebut] = useState('20:00')
  const [fin, setFin] = useState('12:00')

  function valider() {
    const depart = depuisChampHeure(new Date(jour + 'T12:00'), debut)
    let arrivee = depuisChampHeure(new Date(jour + 'T12:00'), fin)
    // Un jeûne qui finit avant son début, c'est qu'il passe minuit.
    if (arrivee <= depart) arrivee = new Date(arrivee.getTime() + 864e5)
    enregistrer(depart, arrivee)
  }

  return (
    <div className="carte">
      <div className="kicker">Un jeûne oublié</div>
      <label className="etiquette" style={{ marginTop: 10 }} htmlFor="jour-jeune">
        Le jour où il a commencé
      </label>
      <input
        id="jour-jeune"
        type="date"
        className="champ"
        value={jour}
        max={clefJour()}
        onChange={(e) => setJour(e.target.value)}
      />
      <div className="grille2" style={{ marginTop: 12 }}>
        <div>
          <label className="etiquette" htmlFor="h-debut">
            Dernier repas
          </label>
          <input
            id="h-debut"
            type="time"
            className="champ"
            value={debut}
            onChange={(e) => setDebut(e.target.value)}
          />
        </div>
        <div>
          <label className="etiquette" htmlFor="h-fin">
            Repas suivant
          </label>
          <input
            id="h-fin"
            type="time"
            className="champ"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
          />
        </div>
      </div>
      <div style={{ height: 12 }} />
      <button type="button" className="bouton" onClick={valider}>
        Enregistrer ce jeûne
      </button>
      <div style={{ height: 10 }} />
      <button type="button" className="bouton-fin" style={{ width: '100%' }} onClick={annuler}>
        Annuler
      </button>
    </div>
  )
}

/* ---------- l'historique ---------- */

function HistoriqueJeunes() {
  const { etat, supprimerJeune } = useApp()
  const finis = jeunesTermines(etat).slice(0, 12)
  if (finis.length === 0) return null
  return (
    <div className="carte" style={{ marginTop: 14 }}>
      <div className="kicker">Les derniers jeûnes</div>
      <div style={{ marginTop: 4 }}>
        {finis.map((jeune) => (
          <div key={jeune.id} className="ligne-liste">
            <div>
              <div style={{ fontWeight: 700 }}>
                {objectifAtteint(jeune) ? '✅' : '⏸️'} {duree(dureeMs(jeune))}
                <span className="doux" style={{ fontWeight: 500 }}>
                  {' '}
                  / {jeune.objectifHeures} h
                </span>
              </div>
              <div className="doux mini">
                {jourRelatif(new Date(jeune.fin as string))} · fini à{' '}
                {heureCourte(new Date(jeune.fin as string))}
              </div>
            </div>
            <button
              type="button"
              className="bouton-fin"
              style={{ padding: '4px 10px' }}
              aria-label="Supprimer ce jeûne"
              onClick={() => supprimerJeune(jeune.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Le format attendu par un champ « datetime-local » : 2026-08-30T18:30 */
function champDateHeure(date: Date): string {
  const deux = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${deux(date.getMonth() + 1)}-${deux(date.getDate())}` +
    `T${deux(date.getHours())}:${deux(date.getMinutes())}`
  )
}
