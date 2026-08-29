/* L'eau du jour. Boire pendant le jeûne ne le casse pas : c'est même ce qui
   fait passer les creux de faim. */

import Anneau from '../composants/Anneau'
import Entete from '../composants/Entete'
import { ajouterJours, clefJour, jourCourt } from '../lib/dates'
import { useApp } from '../lib/etat'

export default function EcranEau({ ouvrirReglages }: { ouvrirReglages: () => void }) {
  const { etat, ajouterVerres } = useApp()
  const aujourdhui = clefJour()
  const bus = etat.eau[aujourdhui] ?? 0
  const but = etat.reglages.butEau
  const ml = etat.reglages.verreMl

  // Les sept derniers jours, du plus ancien au plus récent.
  const semaine = Array.from({ length: 7 }, (_, i) => {
    const jour = ajouterJours(new Date(), i - 6)
    return { jour, clef: clefJour(jour), verres: etat.eau[clefJour(jour)] ?? 0 }
  })
  const maxSemaine = Math.max(but, ...semaine.map((j) => j.verres))

  return (
    <div className="page">
      <Entete kicker="Hydratation" titre="Mon eau du jour" ouvrirReglages={ouvrirReglages} />

      <div style={{ padding: '4px 0 16px' }}>
        <Anneau progression={bus / but} taille={210} couleurs={['#4a7dff', '#17c3a2']}>
          <div style={{ fontSize: 30 }}>💧</div>
          <div className="chiffre" style={{ fontSize: 34, marginTop: 2 }}>
            {bus} / {but}
          </div>
          <div className="doux" style={{ fontSize: 13 }}>
            {(bus * ml).toLocaleString('fr-FR')} ml bus
          </div>
        </Anneau>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <button
          type="button"
          className="bouton-fin"
          style={{ flex: '0 0 auto', fontSize: 20, padding: '10px 20px' }}
          onClick={() => ajouterVerres(-1)}
          disabled={bus === 0}
          aria-label="Retirer un verre"
        >
          −
        </button>
        <button type="button" className="bouton" onClick={() => ajouterVerres(1)}>
          + Un verre de {ml} ml
        </button>
      </div>

      <div className="carte">
        <div className="kicker">Les verres d'aujourd'hui</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {Array.from({ length: Math.max(but, bus) }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Verre ${i + 1}`}
              // Toucher un verre déjà plein annule tout ce qui vient après :
              // c'est la façon la plus simple de corriger une fausse manœuvre.
              onClick={() => ajouterVerres(i < bus ? i - bus : i + 1 - bus)}
              style={{
                width: 38,
                height: 46,
                borderRadius: '8px 8px 14px 14px',
                border: `2px solid ${i < bus ? 'transparent' : 'var(--bord)'}`,
                background:
                  i < bus ? 'linear-gradient(160deg, #4a7dff, #17c3a2)' : 'var(--piste)',
                color: '#fff',
                fontSize: 16,
              }}
            >
              {i < bus ? '💧' : ''}
            </button>
          ))}
        </div>
        <p className="doux" style={{ margin: '12px 0 0' }}>
          {bus >= but
            ? "Objectif atteint pour aujourd'hui. 🎉"
            : `Encore ${but - bus} verre${but - bus > 1 ? 's' : ''} pour y être.`}
        </p>
      </div>

      <div className="carte">
        <div className="kicker">Les sept derniers jours</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            height: 110,
            margin: '14px 0 6px',
          }}
        >
          {semaine.map(({ jour, clef, verres }) => (
            <div key={clef} style={{ flex: 1, textAlign: 'center' }}>
              <div className="chiffre" style={{ fontSize: 12, color: 'var(--doux)' }}>
                {verres || ''}
              </div>
              <div
                style={{
                  height: Math.max(4, (verres / maxSemaine) * 74),
                  borderRadius: 8,
                  background:
                    verres >= but
                      ? 'linear-gradient(180deg, #4a7dff, #17c3a2)'
                      : 'var(--piste)',
                  marginTop: 4,
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  marginTop: 6,
                  fontWeight: 800,
                  color: clef === aujourdhui ? 'var(--menthe)' : 'var(--estompe)',
                }}
              >
                {clef === aujourdhui ? "auj." : jourCourt(jour).split(' ')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
