/* L'écran d'accueil : le minuteur.
   Un seul jeûne peut être en cours à la fois — c'est celui dont la fin est
   vide dans la liste. */

import { useState } from 'react'
import Anneau from '../composants/Anneau'
import Entete from '../composants/Entete'
import { useApp, useHorloge } from '../lib/etat'
import { chrono, duree, heureCourte, jourRelatif } from '../lib/dates'
import { dureeMs, jeuneEnCours, phaseA, phaseSuivante, planParId, serie } from '../lib/jeune'

const HEURE = 3_600_000

export default function EcranJeune({ ouvrirReglages }: { ouvrirReglages: () => void }) {
  const { etat, commencer, terminer, abandonner, corrigerDebut } = useApp()
  const enCours = jeuneEnCours(etat)
  const maintenant = useHorloge()
  const [corrige, setCorrige] = useState(false)

  const objectifHeures = enCours?.objectifHeures ?? etat.reglages.objectifHeures
  const objectifMs = objectifHeures * HEURE
  const ecoule = enCours ? dureeMs(enCours, maintenant) : 0
  const reste = objectifMs - ecoule
  const atteint = reste <= 0
  const heuresEcoulees = ecoule / HEURE
  const phase = phaseA(heuresEcoulees)
  const suivante = phaseSuivante(heuresEcoulees)
  const plan = planParId(etat.reglages.plan)
  const jours = serie(etat)

  const debut = enCours ? new Date(enCours.debut) : null
  const finPrevue = debut ? new Date(debut.getTime() + objectifMs) : null
  const finSiOnCommenceMaintenant = new Date(maintenant + objectifMs)

  const prenom = etat.reglages.prenom
  const bonjour = prenom ? `Bonjour ${prenom}` : 'Bonjour'

  return (
    <div className="page">
      <Entete
        kicker={bonjour}
        titre={enCours ? 'Jeûne en cours' : 'Prêt·e à jeûner'}
        ouvrirReglages={ouvrirReglages}
      />

      {jours > 0 && (
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <span className="pilule">
            🔥 {jours} jour{jours > 1 ? 's' : ''} d'affilée
          </span>
        </div>
      )}

      <div style={{ padding: '10px 0 18px' }}>
        <Anneau
          progression={enCours ? ecoule / objectifMs : 0}
          couleurs={atteint ? ['#f7b731', '#ff7a59'] : ['#17c3a2', '#4a7dff']}
        >
          {enCours ? (
            <>
              <div className="kicker">{atteint ? 'Objectif atteint' : 'Temps de jeûne'}</div>
              <div className="chiffre" style={{ fontSize: 38, letterSpacing: '-0.02em' }}>
                {chrono(ecoule)}
              </div>
              <div className="doux" style={{ fontSize: 13 }}>
                {atteint
                  ? `${duree(-reste)} de plus que l'objectif`
                  : `il reste ${duree(reste)} sur ${objectifHeures} h`}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 34 }}>🌅</div>
              <div className="kicker" style={{ marginTop: 6 }}>
                Rythme {plan.nom}
              </div>
              <div className="doux" style={{ fontSize: 13, marginTop: 4 }}>
                {objectifHeures} heures sans manger
              </div>
            </>
          )}
        </Anneau>
      </div>

      {enCours && debut && finPrevue ? (
        <>
          <div className="carte rangee">
            <div>
              <div className="kicker">Commencé</div>
              <div className="chiffre" style={{ fontSize: 20 }}>
                {heureCourte(debut)}
              </div>
              <div className="doux" style={{ fontSize: 12 }}>
                {jourRelatif(debut)}
              </div>
            </div>
            <div style={{ color: 'var(--estompe)' }}>→</div>
            <div style={{ textAlign: 'right' }}>
              <div className="kicker">Objectif</div>
              <div className="chiffre" style={{ fontSize: 20 }}>
                {heureCourte(finPrevue)}
              </div>
              <div className="doux" style={{ fontSize: 12 }}>
                {jourRelatif(finPrevue)}
              </div>
            </div>
          </div>

          <div className="carte">
            <div className="rangee" style={{ alignItems: 'flex-start' }}>
              <div style={{ fontSize: 30, lineHeight: 1 }}>{phase.emoji}</div>
              <div style={{ flex: 1 }}>
                <div className="kicker">Ce qui se passe</div>
                <h2>{phase.nom}</h2>
                <p className="doux" style={{ margin: '4px 0 0' }}>
                  {phase.texte}
                </p>
                {suivante && (
                  <p className="doux" style={{ margin: '8px 0 0', color: 'var(--estompe)' }}>
                    Prochaine étape : {suivante.nom}, dans {duree((suivante.debut - heuresEcoulees) * HEURE)}.
                  </p>
                )}
              </div>
            </div>
          </div>

          <button type="button" className="bouton chaud" onClick={terminer}>
            {atteint ? '🎉 Terminer le jeûne' : 'Terminer le jeûne'}
          </button>

          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              marginTop: 12,
              flexWrap: 'wrap',
            }}
          >
            <button type="button" className="bouton-fin" onClick={() => setCorrige(!corrige)}>
              ✏️ Corriger l'heure de début
            </button>
            <button
              type="button"
              className="bouton-fin"
              onClick={() => {
                if (confirm('Annuler ce jeûne ? Il ne sera pas gardé dans le journal.')) abandonner()
              }}
            >
              Annuler
            </button>
          </div>

          {corrige && (
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
              <p className="doux" style={{ marginBottom: 0 }}>
                Utile quand on a pensé au minuteur une heure après avoir posé la fourchette.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <button type="button" className="bouton" onClick={() => commencer()}>
            Commencer le jeûne
          </button>
          <div className="carte" style={{ marginTop: 14 }}>
            <div className="kicker">Si vous commencez maintenant</div>
            <p style={{ margin: '6px 0 0', fontWeight: 700 }}>
              Le jeûne se termine {jourRelatif(finSiOnCommenceMaintenant)} à{' '}
              {heureCourte(finSiOnCommenceMaintenant)}.
            </p>
            <p className="doux" style={{ marginBottom: 0 }}>
              Le compteur part du dernier repas. Si vous avez déjà mangé il y a un moment,
              lancez-le puis corrigez l'heure de début.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

/** Le format attendu par un champ « datetime-local » : 2026-08-27T18:30 */
function champDateHeure(date: Date): string {
  const deuxChiffres = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${deuxChiffres(date.getMonth() + 1)}-${deuxChiffres(date.getDate())}` +
    `T${deuxChiffres(date.getHours())}:${deuxChiffres(date.getMinutes())}`
  )
}
