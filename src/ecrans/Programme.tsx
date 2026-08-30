/* Un programme suivi — par exemple un défi de vingt-huit jours en vidéo.
   L'avancement se compte en séances faites, pas en jours de calendrier :
   sauter un jour ne fait pas perdre sa place. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { IconeCrayon } from '../composants/Icones'
import Symbole from '../composants/Symbole'
import { deClefJour, jourCourt, jourRelatif } from '../lib/dates'
import { useApp } from '../lib/etat'
import type { Vue } from '../lib/navigation'
import { FAMILLES, joursFaits, prochainJour, symboleFamille } from '../lib/sport'
import type { CategorieSport, Programme } from '../lib/stockage'

export default function EcranProgramme({
  id,
  fermer,
  ouvrir,
}: {
  id: string
  fermer: () => void
  ouvrir: (vue: Vue) => void
}) {
  const { etat, supprimerSeance, modifierProgramme, terminerProgramme, supprimerProgramme } =
    useApp()
  const [modifie, setModifie] = useState(false)
  const programme = etat.programmes.find((p) => p.id === id)

  if (!programme) {
    return (
      <div className="page">
        <Entete kicker="Programme" titre="Introuvable" retour={fermer} />
      </div>
    )
  }

  const faits = joursFaits(programme.id, etat.seances)
  const suivant = prochainJour(programme.id, etat.seances)
  const seances = etat.seances
    .filter((s) => s.programmeId === programme.id)
    .sort((a, b) => (b.numeroJour ?? 0) - (a.numeroJour ?? 0))
  const famille = FAMILLES.find((f) => f.id === programme.categorie)
  const minutes = seances.reduce((t, s) => t + s.minutes, 0)
  const kcal = seances.reduce((t, s) => t + s.kcal, 0)

  return (
    <div className="page">
      <Entete kicker="Programme suivi" titre={programme.nom} retour={fermer} />

      <div className="carte" style={{ borderTop: `3px solid ${famille?.couleur ?? 'var(--argile)'}` }}>
        <div className="rangee">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span
              className="pastille"
              style={{ width: 46, height: 46, background: 'var(--piste)', color: famille?.couleur }}
            >
              <Symbole nom={symboleFamille(programme.categorie)} taille={23} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="kicker">{famille?.nom ?? 'Sport'}</div>
              <div className="chiffre" style={{ fontSize: 24 }}>
                Jour {Math.min(suivant, programme.jours)}
                <span className="doux" style={{ fontSize: 15, fontWeight: 500 }}>
                  {' '}
                  sur {programme.jours}
                </span>
              </div>
              {programme.avec && <div className="doux mini">avec {programme.avec}</div>}
            </div>
          </div>
          <button
            type="button"
            className="bouton-fin"
            style={{ padding: '7px 12px' }}
            onClick={() => setModifie(!modifie)}
          >
            <IconeCrayon /> Modifier
          </button>
        </div>

        <div className="barre" style={{ margin: '14px 0 6px' }}>
          <i style={{ width: `${(faits.size / programme.jours) * 100}%` }} />
        </div>
        <div className="doux mini">
          {faits.size} séance{faits.size > 1 ? 's' : ''} faite{faits.size > 1 ? 's' : ''} ·{' '}
          {minutes} min · {kcal} kcal · commencé le {jourCourt(deClefJour(programme.debut))}
        </div>
      </div>

      {modifie && (
        <FormulaireProgramme
          programme={programme}
          minimumJours={Math.max(1, ...[...faits, 1])}
          enregistrer={(changements) => {
            modifierProgramme(programme.id, changements)
            setModifie(false)
          }}
          annuler={() => setModifie(false)}
        />
      )}

      {/* la grille des jours : on touche un jour pour le noter */}
      <div className="carte">
        <div className="kicker">Les {programme.jours} jours</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6,
            marginTop: 12,
          }}
        >
          {Array.from({ length: programme.jours }, (_, i) => i + 1).map((numero) => {
            const fait = faits.has(numero)
            return (
              <button
                key={numero}
                type="button"
                onClick={() => ouvrir({ nom: 'noter-seance', programmeId: programme.id, numeroJour: numero })}
                style={{
                  aspectRatio: '1',
                  borderRadius: 12,
                  border:
                    numero === suivant ? '1.5px solid var(--argile)' : '1.5px solid transparent',
                  background: fait ? 'var(--argile)' : 'var(--piste)',
                  color: fait ? 'var(--sur-accent)' : 'var(--estompe)',
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {fait ? '✓' : numero}
              </button>
            )
          })}
        </div>
        <p className="doux mini" style={{ margin: '12px 0 0' }}>
          Touchez un jour pour noter la séance correspondante.
        </p>
      </div>

      {!programme.termine && (
        <button
          type="button"
          className="bouton"
          onClick={() => ouvrir({ nom: 'noter-seance', programmeId: programme.id })}
        >
          Noter le jour {Math.min(suivant, programme.jours)}
        </button>
      )}

      {programme.lien && (
        <>
          <div style={{ height: 10 }} />
          <a
            className="bouton-fin"
            style={{ width: '100%', textDecoration: 'none' }}
            href={programme.lien}
            target="_blank"
            rel="noreferrer"
          >
            Ouvrir les vidéos
          </a>
        </>
      )}

      {seances.length > 0 && (
        <>
          <div className="titre-section">Ce qui est fait</div>
          <div className="carte">
            {seances.map((seance) => (
              <div key={seance.id} className="ligne-liste">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{seance.nom}</div>
                  <div className="doux mini">
                    {jourRelatif(deClefJour(seance.jour))} · {seance.minutes} min · {seance.kcal} kcal
                    {seance.parties?.length ? ` · ${seance.parties.join(', ')}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  className="bouton-fin"
                  style={{ padding: '4px 10px' }}
                  aria-label="Supprimer cette séance"
                  onClick={() => supprimerSeance(seance.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        className="bouton-fin"
        style={{ width: '100%' }}
        onClick={() => terminerProgramme(programme.id)}
      >
        {programme.termine ? 'Reprendre ce programme' : 'Marquer comme terminé'}
      </button>
      <div style={{ height: 10 }} />
      <button
        type="button"
        className="bouton-fin"
        style={{ width: '100%', color: 'var(--argile)' }}
        onClick={() => {
          if (confirm('Supprimer ce programme ? Les séances déjà notées sont conservées.')) {
            supprimerProgramme(programme.id)
            fermer()
          }
        }}
      >
        Supprimer le programme
      </button>
    </div>
  )
}

/* ---------- créer un programme ---------- */

export function NouveauProgramme({ fermer }: { fermer: () => void }) {
  const { ajouterProgramme } = useApp()
  const [nom, setNom] = useState('')
  const [categorie, setCategorie] = useState<CategorieSport>('pilates')
  const [jours, setJours] = useState('28')
  const [avec, setAvec] = useState('')
  const [lien, setLien] = useState('')

  const nombre = Math.max(1, Math.min(365, Number(jours) || 28))

  return (
    <div className="page">
      <Entete kicker="Sport" titre="Nouveau programme" retour={fermer} />

      <div className="carte">
        <p className="doux" style={{ margin: 0 }}>
          Un programme, c'est une série de séances numérotées — un défi en vidéo, un plan de salle,
          un cours suivi semaine après semaine. L'app compte les jours faits, pas les jours passés.
        </p>
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="nom-prog">
          Le nom du programme
        </label>
        <input
          id="nom-prog"
          className="champ"
          autoFocus
          placeholder="ex. Pilates by Izzy"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        <label className="etiquette" style={{ marginTop: 14 }}>
          Quel sport
        </label>
        <div className="grille2">
          {FAMILLES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`choix${categorie === f.id ? ' actif' : ''}`}
              style={{ padding: '12px 8px', textAlign: 'center' }}
              onClick={() => setCategorie(f.id)}
            >
              <span style={{ display: 'flex', justifyContent: 'center', color: f.couleur }}>
                <Symbole nom={f.icone} taille={22} />
              </span>
              <b style={{ fontSize: 14, marginTop: 6 }}>{f.nom}</b>
            </button>
          ))}
        </div>

        <div className="grille2" style={{ marginTop: 14 }}>
          <div>
            <label className="etiquette" htmlFor="jours-prog">
              Sur combien de jours
            </label>
            <input
              id="jours-prog"
              className="champ"
              inputMode="numeric"
              value={jours}
              onChange={(e) => setJours(e.target.value)}
            />
          </div>
          <div>
            <label className="etiquette" htmlFor="avec-prog">
              Avec qui (facultatif)
            </label>
            <input
              id="avec-prog"
              className="champ"
              placeholder="ex. ma belle-sœur"
              value={avec}
              onChange={(e) => setAvec(e.target.value)}
            />
          </div>
        </div>

        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="lien-prog">
          Le lien des vidéos (facultatif)
        </label>
        <input
          id="lien-prog"
          className="champ"
          inputMode="url"
          placeholder="https://youtube.com/@izzy.samuel"
          value={lien}
          onChange={(e) => setLien(e.target.value)}
        />
      </div>

      <button
        type="button"
        className="bouton"
        disabled={!nom.trim()}
        onClick={() => {
          ajouterProgramme({
            nom: nom.trim(),
            categorie,
            jours: nombre,
            avec: avec.trim() || undefined,
            lien: lien.trim() || undefined,
          })
          fermer()
        }}
      >
        Créer le programme
      </button>
    </div>
  )
}

/* ---------- corriger un programme ---------- */

function FormulaireProgramme({
  programme,
  minimumJours,
  enregistrer,
  annuler,
}: {
  programme: Programme
  /** On ne peut pas raccourcir un programme en dessous du dernier jour noté. */
  minimumJours: number
  enregistrer: (changements: Partial<Omit<Programme, 'id'>>) => void
  annuler: () => void
}) {
  const [nom, setNom] = useState(programme.nom)
  const [jours, setJours] = useState(String(programme.jours))
  const [avec, setAvec] = useState(programme.avec ?? '')
  const [lien, setLien] = useState(programme.lien ?? '')

  const nombre = Math.max(minimumJours, Math.min(365, Number(jours) || programme.jours))

  return (
    <div className="carte">
      <div className="kicker">Corriger le programme</div>

      <label className="etiquette" style={{ marginTop: 12 }} htmlFor="edit-nom">
        Le nom
      </label>
      <input
        id="edit-nom"
        className="champ"
        autoFocus
        value={nom}
        onChange={(e) => setNom(e.target.value)}
      />

      <div className="grille2" style={{ marginTop: 12 }}>
        <div>
          <label className="etiquette" htmlFor="edit-jours">
            Nombre de jours
          </label>
          <input
            id="edit-jours"
            className="champ"
            inputMode="numeric"
            value={jours}
            onChange={(e) => setJours(e.target.value)}
          />
        </div>
        <div>
          <label className="etiquette" htmlFor="edit-avec">
            Avec qui
          </label>
          <input
            id="edit-avec"
            className="champ"
            placeholder="facultatif"
            value={avec}
            onChange={(e) => setAvec(e.target.value)}
          />
        </div>
      </div>

      <label className="etiquette" style={{ marginTop: 12 }} htmlFor="edit-lien">
        Le lien des vidéos
      </label>
      <input
        id="edit-lien"
        className="champ"
        inputMode="url"
        placeholder="facultatif"
        value={lien}
        onChange={(e) => setLien(e.target.value)}
      />

      {minimumJours > 1 && (
        <p className="doux mini" style={{ margin: '10px 0 0' }}>
          Le programme ne peut pas descendre en dessous de {minimumJours} jours : c'est le dernier
          jour que vous avez noté.
        </p>
      )}

      <div style={{ height: 14 }} />
      <button
        type="button"
        className="bouton"
        disabled={!nom.trim()}
        onClick={() =>
          enregistrer({
            nom: nom.trim(),
            jours: nombre,
            avec: avec.trim() || undefined,
            lien: lien.trim() || undefined,
          })
        }
      >
        Enregistrer
      </button>
      <div style={{ height: 10 }} />
      <button type="button" className="bouton-fin" style={{ width: '100%' }} onClick={annuler}>
        Annuler
      </button>
    </div>
  )
}
