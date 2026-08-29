/* Le journal : ce qui a été fait, et ce que ça donne dans la durée.
   C'est l'écran qui répond à « est-ce que ça marche ? ». */

import Entete from '../composants/Entete'
import { ajouterJours, clefJour, duree, heureCourte, jourCourt } from '../lib/dates'
import { useApp } from '../lib/etat'
import {
  bilan,
  defis,
  dureeHeures,
  dureeMs,
  jourDuJeune,
  jeunesTermines,
  objectifAtteint,
  serie,
  serieLaPlusLongue,
} from '../lib/jeune'

export default function EcranJournal({ ouvrirReglages }: { ouvrirReglages: () => void }) {
  const { etat, supprimerJeune } = useApp()
  const finis = jeunesTermines(etat)
  const chiffres = bilan(etat)
  const jours = serie(etat)
  const record = serieLaPlusLongue(etat)
  const listeDefis = defis(etat)
  const obtenus = listeDefis.filter((d) => d.obtenu).length

  // Les heures jeûnées par journée, pour le calendrier des cinq dernières semaines.
  const parJour = new Map<string, number>()
  for (const jeune of finis) {
    const clef = jourDuJeune(jeune)
    parJour.set(clef, Math.max(parJour.get(clef) ?? 0, dureeHeures(jeune)))
  }
  const grille = Array.from({ length: 35 }, (_, i) => {
    const jour = ajouterJours(new Date(), i - 34)
    return { jour, clef: clefJour(jour), heures: parJour.get(clefJour(jour)) ?? 0 }
  })

  return (
    <div className="page">
      <Entete kicker="Historique" titre="Mon journal" ouvrirReglages={ouvrirReglages} />

      <div className="carte">
        <div className="rangee">
          <Chiffre valeur={`${jours}`} legende="jours de suite" emoji="🔥" />
          <Chiffre valeur={`${chiffres.reussis}`} legende="objectifs atteints" emoji="🎯" />
          <Chiffre valeur={`${Math.round(chiffres.totalHeures)} h`} legende="jeûnées en tout" emoji="⏳" />
        </div>
      </div>

      <div className="carte">
        <div className="kicker">Les cinq dernières semaines</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6,
            margin: '12px 0 8px',
          }}
        >
          {grille.map(({ jour, clef, heures }) => {
            const part = Math.min(1, heures / Math.max(1, etat.reglages.objectifHeures))
            return (
              <div
                key={clef}
                title={`${jourCourt(jour)}${heures ? ` — ${duree(heures * 3_600_000)}` : ''}`}
                style={{
                  aspectRatio: '1',
                  borderRadius: 9,
                  background: heures
                    ? `linear-gradient(160deg, rgba(23,195,162,${0.25 + part * 0.75}), rgba(74,125,255,${0.25 + part * 0.75}))`
                    : 'var(--piste)',
                  border: clef === clefJour() ? '2px solid var(--or)' : '2px solid transparent',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 10,
                  fontWeight: 800,
                  color: heures ? '#fff' : 'var(--estompe)',
                }}
              >
                {jour.getDate()}
              </div>
            )
          })}
        </div>
        <p className="doux" style={{ margin: 0, fontSize: 12 }}>
          Plus la case est vive, plus le jeûne de ce jour-là a été long.
        </p>
      </div>

      <div className="carte">
        <div className="kicker">En résumé</div>
        <div className="ligne-liste">
          <span className="doux">Jeûnes terminés</span>
          <span className="chiffre">{chiffres.termines}</span>
        </div>
        <div className="ligne-liste">
          <span className="doux">Le plus long</span>
          <span className="chiffre">{duree(chiffres.plusLong * 3_600_000)}</span>
        </div>
        <div className="ligne-liste">
          <span className="doux">Moyenne des 7 derniers jours</span>
          <span className="chiffre">
            {chiffres.moyenneSeptJours ? duree(chiffres.moyenneSeptJours * 3_600_000) : '—'}
          </span>
        </div>
        <div className="ligne-liste">
          <span className="doux">Meilleure série</span>
          <span className="chiffre">{record} jour{record > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="carte">
        <div className="rangee">
          <div className="kicker">Défis</div>
          <span className="pilule">
            {obtenus} / {listeDefis.length}
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
            gap: 10,
            marginTop: 12,
          }}
        >
          {listeDefis.map((defi) => (
            <div
              key={defi.id}
              title={defi.comment}
              style={{
                textAlign: 'center',
                padding: '12px 6px',
                borderRadius: 14,
                background: defi.obtenu ? 'rgba(247,183,49,.14)' : 'var(--piste)',
                opacity: defi.obtenu ? 1 : 0.55,
              }}
            >
              <div style={{ fontSize: 24, filter: defi.obtenu ? 'none' : 'grayscale(1)' }}>
                {defi.emoji}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, marginTop: 4, lineHeight: 1.25 }}>
                {defi.nom}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="carte">
        <div className="kicker">Tous les jeûnes</div>
        {finis.length === 0 ? (
          <p className="vide">
            Rien encore.
            <br />
            Le premier jeûne terminé s'inscrira ici.
          </p>
        ) : (
          <div style={{ marginTop: 6 }}>
            {finis.map((jeune) => {
              const debut = new Date(jeune.debut)
              const fin = new Date(jeune.fin as string)
              const gagne = objectifAtteint(jeune)
              return (
                <div key={jeune.id} className="ligne-liste">
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {gagne ? '✅' : '⏸️'} {duree(dureeMs(jeune))}
                      <span className="doux" style={{ fontWeight: 600 }}>
                        {' '}
                        / {jeune.objectifHeures} h
                      </span>
                    </div>
                    <div className="doux" style={{ fontSize: 12 }}>
                      {jourCourt(debut)} {heureCourte(debut)} → {jourCourt(fin)} {heureCourte(fin)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bouton-fin"
                    style={{ padding: '4px 10px' }}
                    aria-label="Supprimer ce jeûne"
                    onClick={() => {
                      if (confirm('Effacer ce jeûne du journal ?')) supprimerJeune(jeune.id)
                    }}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Chiffre({ valeur, legende, emoji }: { valeur: string; legende: string; emoji: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 20 }}>{emoji}</div>
      <div className="chiffre" style={{ fontSize: 24 }}>
        {valeur}
      </div>
      <div className="doux" style={{ fontSize: 11, lineHeight: 1.2 }}>
        {legende}
      </div>
    </div>
  )
}
