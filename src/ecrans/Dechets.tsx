/* Le ramassage des déchets verts et des encombrants.

   La commune passe une semaine par mois, et un seul jour dans cette semaine
   selon le quartier. Rater le passage, c'est garder le vieux canapé un mois
   de plus. Le calendrier papier finit sur le frigo puis à la poubelle : cet
   écran le remplace, et l'accueil prévient quand c'est la semaine.

   Le calendrier est modifiable ici même. La commune publie le sien par
   semestre ; quand celui de 2027 sortira, il s'ajoute d'ici, sans attendre
   que quelqu'un touche au code. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import Pliant from '../composants/Pliant'
import { jourDe } from '../lib/argent'
import { useMaison } from '../lib/maison'
import {
  CENTRE_TECHNIQUE,
  ENCOMBRANTS,
  PAS_PAR_LA_COMMUNE,
  PAS_RAMASSES,
  TOURNEES,
  dansCombien,
  joursAvant,
  jourEnMots,
  passagesAVenir,
  sortirCeWeekEnd,
  tourneeDe,
} from '../lib/dechets'
import type { Tournee } from '../lib/dechets'

export default function Dechets({ fermer }: { fermer: () => void }) {
  const { maison, reglerDechets } = useMaison()
  const dechets = maison.reglages.dechets
  const aujourdhui = jourDe()
  const [nouveauLundi, setNouveauLundi] = useState('')

  const ma = tourneeDe(dechets.tournee)
  const passages = passagesAVenir(dechets, aujourdhui)
  const prochain = passages[0]
  const dans = prochain ? joursAvant(prochain, aujourdhui) : null

  return (
    <div className="page">
      <Entete kicker="La maison" titre="Les déchets verts" retour={fermer} />

      {/* ---------- le prochain passage ---------- */}
      {!dechets.tournee ? (
        <div className="carte">
          <div className="kicker">Pour commencer</div>
          <p className="doux mini" style={{ margin: '6px 0 0' }}>
            Choisissez la tournée de la maison ci-dessous : c'est elle qui donne le jour
            de passage.
          </p>
        </div>
      ) : prochain ? (
        <div
          className="carte"
          style={{
            background: sortirCeWeekEnd(dans ?? 99) ? 'var(--corail-pale)' : 'var(--lagon-pale)',
            textAlign: 'center',
          }}
        >
          <div className="kicker">Prochain passage</div>
          <div className="chiffre" style={{ fontSize: 30, marginTop: 4 }}>
            {ma?.jour} {jourEnMots(prochain)}
          </div>
          <div className="doux mini" style={{ marginTop: 2 }}>
            {dansCombien(dans ?? 0)} · tournée {dechets.tournee}
          </div>
          {sortirCeWeekEnd(dans ?? 99) && (
            <p style={{ margin: '10px 0 0', fontWeight: 700, color: 'var(--corail-fonce)' }}>
              À sortir maintenant
            </p>
          )}
        </div>
      ) : (
        <div className="carte">
          <p className="vide" style={{ padding: '10px 6px' }}>
            Plus de passage prévu. La commune publie son calendrier par semestre — ajoutez
            les semaines plus bas dès qu'il sort.
          </p>
        </div>
      )}

      {/* La commune le dit sur son propre calendrier : on ne le cache pas. */}
      <div className="carte" style={{ background: 'var(--ocre-pale)' }}>
        <div className="rangee" style={{ alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <p className="doux mini" style={{ margin: 0, flex: 1 }}>
            Les semaines de jours fériés, la commune décale ses tournées et l'annonce sur sa
            page Facebook. En cas de doute, le Centre technique répond au{' '}
            <b>{CENTRE_TECHNIQUE.telephone}</b>.
          </p>
        </div>
      </div>

      {/* ---------- la tournée ---------- */}
      <div className="carte">
        <div className="kicker">Notre tournée</div>
        <p className="doux mini" style={{ margin: '6px 0 10px' }}>
          Secteur Pointe-Vénus. Chaque tournée passe un jour différent de la semaine.
        </p>
        {TOURNEES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`choix${dechets.tournee === t.id ? ' actif' : ''}`}
            style={{ width: '100%', marginBottom: 8, textAlign: 'left' }}
            onClick={() => void reglerDechets({ ...dechets, tournee: t.id as Tournee })}
          >
            <b>
              {t.id} · {t.jour}
            </b>
            <span className="doux mini">{t.quartiers}</span>
          </button>
        ))}
      </div>

      {/* ---------- tous les passages ---------- */}
      <div className="carte">
        <div className="kicker">Les semaines de ramassage</div>
        {dechets.semaines.length === 0 && (
          <p className="vide" style={{ padding: '10px 6px' }}>
            Aucune semaine enregistrée.
          </p>
        )}
        {[...dechets.semaines].sort().map((lundi) => {
          const passe = lundi < aujourdhui
          return (
            <div key={lundi} className="ligne-liste">
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, opacity: passe ? 0.45 : 1 }}>
                  Semaine du {jourEnMots(lundi)}
                </div>
                <div className="doux mini">
                  {dechets.tournee
                    ? `passage le ${tourneeDe(dechets.tournee)?.jour}`
                    : 'lundi à jeudi selon la tournée'}
                </div>
              </div>
              <button
                type="button"
                className="bouton-fin"
                style={{ flex: '0 0 auto', padding: '8px 10px' }}
                aria-label={`Retirer la semaine du ${lundi}`}
                onClick={() =>
                  void reglerDechets({
                    ...dechets,
                    semaines: dechets.semaines.filter((s) => s !== lundi),
                  })
                }
              >
                <Symbole nom="croix" taille={16} couleur="var(--corail-fonce)" />
              </button>
            </div>
          )
        })}

        <div className="etiquette" style={{ marginTop: 14 }}>
          Ajouter une semaine
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <input
            className="champ"
            type="date"
            value={nouveauLundi}
            onChange={(e) => setNouveauLundi(e.target.value)}
          />
          <button
            type="button"
            className="bouton"
            style={{ width: 'auto', padding: '12px 18px' }}
            disabled={!nouveauLundi || dechets.semaines.includes(nouveauLundi)}
            onClick={() => {
              void reglerDechets({
                ...dechets,
                semaines: [...dechets.semaines, nouveauLundi].sort(),
              })
              setNouveauLundi('')
            }}
          >
            Ajouter
          </button>
        </div>
        <p className="doux mini" style={{ margin: '8px 0 0' }}>
          Le <b>lundi</b> de la semaine, tel qu'il est écrit sur le calendrier de la commune.
        </p>
      </div>

      {/* ---------- ce qui se ramasse ---------- */}
      <Pliant titre="Ce qui est ramassé" ouvertAuDepart={false}>
        <p className="doux mini" style={{ margin: '0 0 10px' }}>
          À déposer le week-end précédent la date de collecte, et <b>séparés</b> : les
          déchets verts d'un côté, les encombrants de l'autre.
        </p>
        {ENCOMBRANTS.map((ligne) => (
          <div key={ligne} className="doux mini" style={{ padding: '5px 0' }}>
            • {ligne}
          </div>
        ))}
      </Pliant>

      <Pliant titre="Ce qui n'est pas ramassé" ouvertAuDepart={false}>
        {PAS_RAMASSES.map((ligne) => (
          <div key={ligne} className="doux mini" style={{ padding: '5px 0' }}>
            • {ligne}
          </div>
        ))}
        <p className="doux mini" style={{ margin: '10px 0 0' }}>
          Pour tout cela, appeler le Centre technique : <b>{CENTRE_TECHNIQUE.telephone}</b> ou{' '}
          {CENTRE_TECHNIQUE.courriel}.
        </p>
        <div style={{ height: 10 }} />
        {PAS_PAR_LA_COMMUNE.map((ligne) => (
          <div key={ligne} className="doux mini" style={{ padding: '5px 0' }}>
            • {ligne}
          </div>
        ))}
      </Pliant>
    </div>
  )
}
