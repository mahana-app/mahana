/* « Dans combien de temps j'y suis ? »

   La question qu'on se pose vraiment en montant sur la balance. L'app y
   répond avec une date, et surtout avec l'hypothèse qui va avec : au rythme
   mesuré sur les pesées, ou au rythme promis par le déficit choisi tant qu'il
   n'y a pas assez de pesées pour mesurer quoi que ce soit.

   Elle ne cache pas non plus quand il n'y a pas de date à donner : un poids
   qui stagne trois semaines n'a pas d'échéance, et inventer un chiffre serait
   la meilleure façon de faire abandonner. */

import { jourCourt } from '../lib/dates'
import { nombreFr } from '../lib/formats'
import { delaiEnMots, projection } from '../lib/objectif'
import type { Etat } from '../lib/stockage'
import Symbole from './Symbole'

export default function CarteObjectif({
  etat,
  ouvrirReglages,
}: {
  etat: Etat
  ouvrirReglages?: () => void
}) {
  const p = projection(etat)

  if (p.situation === 'sans-but') {
    return (
      <div className="carte">
        <div className="kicker">Objectif</div>
        <p className="doux" style={{ margin: '6px 0 0' }}>
          Renseignez le poids que vous visez{ouvrirReglages ? ' dans les réglages' : ''} : l'app
          dira alors dans combien de temps vous y serez.
        </p>
        {ouvrirReglages && (
          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%', marginTop: 10 }}
            onClick={ouvrirReglages}
          >
            Choisir mon objectif
          </button>
        )}
      </div>
    )
  }

  if (p.situation === 'sans-pesee') {
    return (
      <div className="carte">
        <div className="kicker">Objectif</div>
        <p className="doux" style={{ margin: '6px 0 0' }}>
          Objectif : {nombreFr(p.but ?? 0, 1)} kg. Notez une première pesée et le compte à rebours
          démarre.
        </p>
      </div>
    )
  }

  if (p.situation === 'atteint') {
    return (
      <div className="carte" style={{ background: 'var(--olive-pale)' }}>
        <div className="rangee">
          <div>
            <div className="kicker">Objectif</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>Vous y êtes 🎉</div>
            <div className="doux mini" style={{ marginTop: 4 }}>
              {nombreFr(p.but ?? 0, 1)} kg visés, {nombreFr(p.poids ?? 0, 1)} kg aujourd'hui.
            </div>
          </div>
          <Symbole nom="medaille" taille={30} couleur="var(--olive)" />
        </div>
      </div>
    )
  }

  /* ---------- il reste du chemin ---------- */
  return (
    <div className="carte" style={{ background: 'var(--argile-pale)' }}>
      <div className="rangee" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="kicker">Il reste</div>
          <div className="chiffre" style={{ fontSize: 34, lineHeight: 1.1 }}>
            {nombreFr(p.reste, 1)}
            <span className="doux" style={{ fontSize: 16, fontWeight: 500 }}> kg</span>
          </div>
          <div className="doux mini">jusqu'à {nombreFr(p.but ?? 0, 1)} kg</div>
        </div>
        <Symbole nom="defi" taille={28} couleur="var(--argile)" />
      </div>

      {p.part !== null && (
        <div style={{ marginTop: 14 }}>
          <div className="barre" style={{ height: 7 }}>
            <i style={{ width: `${Math.round(p.part * 100)}%`, background: 'var(--argile)' }} />
          </div>
          <div className="doux mini" style={{ marginTop: 5 }}>
            {Math.round(p.part * 100)} % du chemin fait depuis la première pesée
          </div>
        </div>
      )}

      {/* la date, quand il y en a une */}
      {p.situation === 'en-route' && p.date && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--bord)' }}>
          <div style={{ fontSize: 19, fontWeight: 700 }}>
            Vers le {jourCourt(p.date)}
          </div>
          <div className="doux mini" style={{ marginTop: 2 }}>
            {delaiEnMots(p.jours ?? 0)} — {p.jours} jours
          </div>
        </div>
      )}

      {p.situation === 'en-route' && p.tropLoin && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--bord)' }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Plus de trois ans à ce rythme</div>
          <div className="doux mini" style={{ marginTop: 2 }}>
            Une date aussi lointaine ne veut plus rien dire. Un objectif intermédiaire, plus
            proche, tiendrait mieux.
          </div>
        </div>
      )}

      {p.situation === 'stagne' && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--bord)' }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Pas de date pour l'instant</div>
          <div className="doux mini" style={{ marginTop: 2 }}>
            {p.mesure
              ? `Sur les ${p.mesure.jours} derniers jours, le poids ne descend pas. C'est très courant — le corps garde de l'eau, la courbe repart ensuite.`
              : 'Aucun déficit de calories n’est prévu : l’objectif choisi est le maintien.'}
          </div>
          {/* L'écart entre ce qui était prévu et ce qui se passe est le seul
              renseignement utile ici : il dit où chercher. */}
          {p.mesure && p.rythmePrevu !== null && p.rythmePrevu < -0.05 && (
            <div className="doux mini" style={{ marginTop: 8 }}>
              Votre objectif visait {nombreFr(p.rythmePrevu, 2)} kg par semaine. Quand le poids ne
              suit pas pendant trois semaines, c'est le plus souvent que la dépense estimée est un
              peu haute, ou que les portions ont glissé sans qu'on le voie.
            </div>
          )}
        </div>
      )}

      {/* l'hypothèse : une date sans son hypothèse est une promesse, pas une information */}
      {p.rythme !== null && p.source !== null && p.situation === 'en-route' && (
        <p className="doux mini" style={{ margin: '12px 0 0', lineHeight: 1.7 }}>
          {p.source === 'reel' ? (
            <>
              Au rythme de vos pesées — <b>{nombreFr(p.rythme, 2)} kg par semaine</b> mesurés sur{' '}
              {p.mesure?.pesees} pesées et {p.mesure?.jours} jours.
              {p.rythmePrevu !== null && Math.abs(p.rythmePrevu - p.rythme) > 0.15 && (
                <>
                  {' '}
                  Le rythme prévu par votre objectif était de {nombreFr(p.rythmePrevu, 2)} kg par
                  semaine.
                </>
              )}
            </>
          ) : (
            <>
              Au rythme prévu par votre objectif — <b>{nombreFr(p.rythme, 2)} kg par semaine</b>.
              Après trois semaines de pesées, l'app calculera sur votre rythme réel, qui est
              toujours le bon.
            </>
          )}
        </p>
      )}

      {(p.tropVite || p.butTropBas) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {p.tropVite && (
            <span className="pilule ambre">Plus d'un kilo par semaine, c'est rapide</span>
          )}
          {p.butTropBas && <span className="pilule ambre">Cet objectif passe sous un IMC de 18,5</span>}
        </div>
      )}

      <p className="doux mini" style={{ margin: '12px 0 0', lineHeight: 1.7, opacity: 0.85 }}>
        C'est une ligne droite tracée à travers la vraie vie : il y aura des paliers, des semaines
        sans rien et des semaines à deux kilos. La date est un ordre de grandeur, pas un rendez-vous.
      </p>
    </div>
  )
}
