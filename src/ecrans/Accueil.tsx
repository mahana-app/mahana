/* L'écran d'accueil : la journée en un coup d'œil, et les gestes du quotidien
   à une touche. */

import Anneaux from '../composants/Anneaux'
import Entete from '../composants/Entete'
import { IconeFleche } from '../composants/Icones'
import { clefJour, duree, initialeJour, septDerniersJours } from '../lib/dates'
import { defiParId, joursTenus, jourValide } from '../lib/defis'
import { totauxDuJour, useApp, useHorloge } from '../lib/etat'
import { dureeMs, jeuneEnCours, serie } from '../lib/jeune'
import type { Vue } from '../lib/navigation'
import { objectifCalories, poidsActuel } from '../lib/profil'
import type { Onglet } from '../composants/BarreOnglets'

const HEURE = 3_600_000

export default function Accueil({
  ouvrir,
  allerA,
}: {
  ouvrir: (vue: Vue) => void
  allerA: (onglet: Onglet) => void
}) {
  const { etat, ajouterVerres, cocherJour } = useApp()
  const maintenant = useHorloge()
  const aujourdhui = clefJour()
  const totaux = totauxDuJour(etat, aujourdhui)
  const butKcal = objectifCalories(etat)
  const poids = poidsActuel(etat)
  const enCours = jeuneEnCours(etat)
  const jours = serie(etat)
  const defi = etat.defiEnCours ? defiParId(etat.defiEnCours.defiId) : null

  const restantes = butKcal ? butKcal - totaux.kcalMangees + totaux.kcalBrulees : null
  const semaine = septDerniersJours().map(({ date, clef }) => ({
    date,
    clef,
    minutes: etat.seances.filter((s) => s.jour === clef).reduce((t, s) => t + s.minutes, 0),
  }))
  const maxSemaine = Math.max(30, ...semaine.map((j) => j.minutes))

  const prenom = etat.profil.prenom
  const heure = new Date(maintenant).getHours()
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="page">
      <Entete
        kicker={`${salut} ${prenom} 👋`.trim()}
        titre="Votre journée"
        ouvrirReglages={() => ouvrir({ nom: 'reglages' })}
      />

      {/* La journée en trois anneaux : manger, bouger, marcher. */}
      <div className="carte">
        <div className="rangee" style={{ alignItems: 'center', gap: 16 }}>
          <Anneaux
            cercles={[
              {
                nom: 'calories',
                part: butKcal ? totaux.kcalMangees / butKcal : 0,
                couleur: 'var(--corail)',
              },
              { nom: 'sport', part: totaux.minutesSport / 30, couleur: 'var(--menthe)' },
              { nom: 'pas', part: totaux.pas / etat.profil.butPas, couleur: 'var(--ambre)' },
            ]}
          />
          <div style={{ flex: 1, display: 'grid', gap: 10 }}>
            <Legende
              couleur="var(--corail)"
              nom="Calories"
              valeur={`${totaux.kcalMangees}${butKcal ? ` / ${butKcal}` : ''}`}
            />
            <Legende
              couleur="var(--menthe)"
              nom="Sport"
              valeur={totaux.minutesSport ? `${totaux.minutesSport} min` : '—'}
            />
            <Legende
              couleur="var(--ambre)"
              nom="Pas"
              valeur={totaux.pas ? totaux.pas.toLocaleString('fr-FR') : '—'}
            />
          </div>
        </div>

        {restantes !== null && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid var(--bord)',
              textAlign: 'center',
            }}
          >
            <span className="chiffre" style={{ fontSize: 26 }}>
              {Math.max(0, restantes)}
            </span>{' '}
            <span className="doux" style={{ fontWeight: 600 }}>
              {restantes >= 0 ? 'kcal encore possibles aujourd’hui' : 'kcal au-dessus'}
            </span>
          </div>
        )}
      </div>

      {/* Le jeûne */}
      <button
        type="button"
        className="carte"
        style={{ width: '100%', border: 0, textAlign: 'left' }}
        onClick={() => ouvrir({ nom: 'jeune' })}
      >
        <div className="rangee">
          <div>
            <div className="kicker">Jeûne</div>
            {enCours ? (
              <>
                <div className="chiffre" style={{ fontSize: 24 }}>
                  {duree(dureeMs(enCours, maintenant))}
                </div>
                <div className="doux mini">
                  sur {enCours.objectifHeures} h ·{' '}
                  {Math.max(
                    0,
                    Math.round(
                      (enCours.objectifHeures * HEURE - dureeMs(enCours, maintenant)) / 60000,
                    ),
                  )}{' '}
                  min restantes
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Pas de jeûne en cours</div>
                <div className="doux mini">Toucher pour lancer le minuteur</div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {jours > 0 && <span className="pilule corail">🔥 {jours} j</span>}
            <IconeFleche />
          </div>
        </div>
      </button>

      {/* Le défi de la semaine */}
      {etat.defiEnCours && defi && (
        <div className="carte">
          <div className="rangee">
            <div style={{ minWidth: 0 }}>
              <div className="kicker">Défi en cours</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {defi.emoji} {defi.nom}
              </div>
              <div className="doux mini">{joursTenus(etat)} jours tenus sur 7</div>
            </div>
            <button
              type="button"
              className={jourValide(etat, aujourdhui) ? 'bouton-fin' : 'bouton'}
              style={{ width: 'auto', padding: '10px 16px', flex: '0 0 auto' }}
              onClick={() => cocherJour(aujourdhui)}
            >
              {jourValide(etat, aujourdhui) ? '✅ Tenu' : 'Cocher'}
            </button>
          </div>
        </div>
      )}

      {/* Le sport de la semaine */}
      <div className="carte">
        <div className="rangee">
          <div className="kicker">Sport de la semaine</div>
          <span className="doux mini">
            {semaine.reduce((t, j) => t + j.minutes, 0)} min au total
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            height: 92,
            margin: '14px 0 0',
          }}
        >
          {semaine.map(({ date, clef, minutes }) => (
            <div key={clef} style={{ flex: 1, textAlign: 'center' }}>
              <div
                style={{
                  height: Math.max(5, (minutes / maxSemaine) * 62),
                  borderRadius: 8,
                  background: minutes ? 'var(--degrade-menthe)' : 'var(--piste)',
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  marginTop: 6,
                  fontWeight: 700,
                  color: clef === aujourdhui ? 'var(--menthe)' : 'var(--estompe)',
                }}
              >
                {initialeJour(date)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="titre-section">Vite fait</div>
      <div className="grille2">
        <button type="button" className="tuile" onClick={() => allerA('sport')}>
          <span className="rond" style={{ background: 'var(--menthe-pale)' }}>
            🏃‍♀️
          </span>
          Une séance
        </button>
        <button type="button" className="tuile" onClick={() => allerA('repas')}>
          <span className="rond" style={{ background: 'var(--corail-pale)' }}>
            🍽️
          </span>
          Noter un repas
        </button>
        <button type="button" className="tuile" onClick={() => ajouterVerres(1)}>
          <span className="rond" style={{ background: '#e4f0fd' }}>
            💧
          </span>
          Un verre d'eau
          <span className="doux mini" style={{ marginLeft: 'auto' }}>
            {totaux.verres}/{etat.profil.butEau}
          </span>
        </button>
        <button type="button" className="tuile" onClick={() => ouvrir({ nom: 'corps' })}>
          <span className="rond" style={{ background: 'var(--ambre-pale)' }}>
            ⚖️
          </span>
          {poids ? `${poids.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} kg` : 'Mon poids'}
        </button>
      </div>
    </div>
  )
}

function Legende({ couleur, nom, valeur }: { couleur: string; nom: string; valeur: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{ width: 9, height: 9, borderRadius: 999, background: couleur, flex: '0 0 auto' }}
      />
      <span className="doux mini" style={{ flex: 1, fontWeight: 600 }}>
        {nom}
      </span>
      <span className="chiffre" style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
        {valeur}
      </span>
    </div>
  )
}
