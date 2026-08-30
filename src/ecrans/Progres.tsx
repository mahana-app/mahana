/* L'onglet Progrès : le score du jour, la série, l'IMC, et les courbes sur
   la semaine, le mois ou l'année. C'est l'écran qui répond à la seule
   question qui compte : est-ce que ça avance ? */

import { useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import JaugeDemi from '../composants/JaugeDemi'
import RegleImc from '../composants/RegleImc'
import { ajouterJours, clefJour, heuresMinutes, initialeJour, jourCourt } from '../lib/dates'
import { useApp } from '../lib/etat'
import { nombreFr } from '../lib/formats'
import { dureeHeures, jourDuJeune, objectifAtteint, serie, serieLaPlusLongue } from '../lib/jeune'
import type { Vue } from '../lib/navigation'
import { delaiEnMots, projection } from '../lib/objectif'
import { imc, objectifCalories, poidsActuel } from '../lib/profil'
import { motDuScore, scoreDuJour } from '../lib/score'
import type { Etat } from '../lib/stockage'

type TypePeriode = 'semaine' | 'mois' | 'annee'
type Case = { clef: string; libelle: string; jours: string[] }

/** Les cases du graphique, selon la période choisie. */
function casesDe(type: TypePeriode, ancre: Date): { cases: Case[]; titre: string } {
  if (type === 'semaine') {
    const decalage = (ancre.getDay() + 6) % 7
    const lundi = ajouterJours(ancre, -decalage)
    const cases = Array.from({ length: 7 }, (_, i) => {
      const date = ajouterJours(lundi, i)
      return { clef: clefJour(date), libelle: initialeJour(date), jours: [clefJour(date)] }
    })
    const dimanche = ajouterJours(lundi, 6)
    const mois = dimanche.toLocaleDateString('fr-FR', { month: 'long' })
    return { cases, titre: `${mois} ${lundi.getDate()}–${dimanche.getDate()}` }
  }

  if (type === 'mois') {
    const nombreDeJours = new Date(ancre.getFullYear(), ancre.getMonth() + 1, 0).getDate()
    const cases = Array.from({ length: nombreDeJours }, (_, i) => {
      const date = new Date(ancre.getFullYear(), ancre.getMonth(), i + 1)
      return {
        clef: clefJour(date),
        libelle: i % 5 === 0 ? String(i + 1) : '',
        jours: [clefJour(date)],
      }
    })
    return {
      cases,
      titre: ancre.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    }
  }

  const cases = Array.from({ length: 12 }, (_, mois) => {
    const nombreDeJours = new Date(ancre.getFullYear(), mois + 1, 0).getDate()
    const jours = Array.from({ length: nombreDeJours }, (_, i) =>
      clefJour(new Date(ancre.getFullYear(), mois, i + 1)),
    )
    return {
      clef: `${ancre.getFullYear()}-${mois}`,
      libelle: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][mois],
      jours,
    }
  })
  return { cases, titre: String(ancre.getFullYear()) }
}

/* Les totaux d'une case, quels que soient les jours qu'elle regroupe. */
function totalDe(etat: Etat, jours: string[]) {
  const dedans = (jour: string) => jours.includes(jour)
  const repas = etat.repas.filter((r) => dedans(r.jour))
  const seances = etat.seances.filter((s) => dedans(s.jour))
  const jeunes = etat.jeunes.filter((j) => j.fin !== null && dedans(jourDuJeune(j)))
  const pesees = etat.pesees.filter((p) => dedans(p.jour))
  return {
    kcal: repas.reduce((t, r) => t + r.kcal, 0),
    glucides: repas.reduce((t, r) => t + r.glucides, 0),
    proteines: repas.reduce((t, r) => t + r.proteines, 0),
    lipides: repas.reduce((t, r) => t + r.lipides, 0),
    heuresJeune: jeunes.reduce((t, j) => Math.max(t, dureeHeures(j)), 0),
    jeuneReussi: jeunes.some(objectifAtteint),
    pas: jours.reduce((t, j) => t + (etat.pas[j] ?? 0), 0),
    minutesSport: seances.reduce((t, s) => t + s.minutes, 0),
    poids: pesees.length ? pesees.reduce((t, p) => t + p.poids, 0) / pesees.length : null,
  }
}

export default function Progres({ ouvrir }: { ouvrir: (vue: Vue) => void }) {
  const { etat } = useApp()
  const [type, setType] = useState<TypePeriode>('semaine')
  const [ancre, setAncre] = useState(() => new Date())
  const { cases, titre } = casesDe(type, ancre)
  const totaux = cases.map((c) => ({ ...c, ...totalDe(etat, c.jours) }))

  const score = scoreDuJour(etat)
  const poids = poidsActuel(etat)
  const valeurImc = poids !== null && etat.profil.tailleCm ? imc(poids, etat.profil.tailleCm) : null
  const but = objectifCalories(etat)

  function decaler(sens: number) {
    const suivant = new Date(ancre)
    if (type === 'semaine') suivant.setDate(suivant.getDate() + sens * 7)
    else if (type === 'mois') suivant.setMonth(suivant.getMonth() + sens)
    else suivant.setFullYear(suivant.getFullYear() + sens)
    if (suivant <= new Date()) setAncre(suivant)
  }

  // La semaine en cours, pour la carte « Série ».
  const semaine = Array.from({ length: 7 }, (_, i) => {
    const lundi = ajouterJours(new Date(), -((new Date().getDay() + 6) % 7))
    const date = ajouterJours(lundi, i)
    return { date, clef: clefJour(date) }
  })

  return (
    <div className="page">
      <Entete kicker="Où j'en suis" titre="Mes progrès" ouvrirReglages={() => ouvrir({ nom: 'reglages' })} />

      {/* le score du jour */}
      <div className="carte">
        <div className="rangee" style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 19, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Symbole nom="score" taille={19} couleur="var(--argile)" /> Score du jour
          </h2>
          <span className="doux mini">{motDuScore(score.total)}</span>
        </div>
        <JaugeDemi
          part={score.total / 100}
          centre={String(score.total)}
          legendeCentre="sur 100"
          couleurs={['var(--olive)', 'var(--argile)']}
        />
        <div style={{ marginTop: 10 }}>
          {score.parties.map((partie) => (
            <div key={partie.id} className="ligne-liste">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Symbole nom={partie.icone} taille={19} couleur={partie.couleur} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{partie.nom}</div>
                  <div className="doux mini">
                    {partie.restant || 'Objectif atteint 🎉'}
                  </div>
                </div>
              </div>
              <span
                className="chiffre mini"
                style={{ color: partie.restant ? 'var(--estompe)' : partie.couleur }}
              >
                {partie.points} / {partie.max}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* la série de la semaine */}
      <div className="carte">
        <div className="rangee">
          <h2 style={{ fontSize: 19, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Symbole nom="flamme" taille={19} couleur="var(--argile)" /> Série
          </h2>
          <span className="pilule corail">{serie(etat)} jours</span>
        </div>
        <div style={{ display: 'flex', gap: 6, margin: '14px 0 12px' }}>
          {semaine.map(({ date, clef }) => {
            const reussi = etat.jeunes.some(
              (j) => j.fin !== null && jourDuJeune(j) === clef && objectifAtteint(j),
            )
            const futur = clef > clefJour()
            return (
              <div key={clef} style={{ flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    aspectRatio: '1',
                    borderRadius: 999,
                    display: 'grid',
                    placeItems: 'center',
                    background: reussi ? 'var(--degrade-argile)' : 'var(--piste)',
                    color: reussi ? 'var(--sur-accent)' : 'var(--estompe)',
                    border: clef === clefJour() ? '2px solid var(--argile)' : '2px solid transparent',
                    opacity: futur ? 0.4 : 1,
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {reussi ? '✓' : ''}
                </div>
                <div style={{ fontSize: 10, marginTop: 5, color: 'var(--estompe)', fontWeight: 700 }}>
                  {initialeJour(date)}
                </div>
              </div>
            )
          })}
        </div>
        <div className="rangee">
          <Compteur icone="medaille" valeur={String(serieLaPlusLongue(etat))} legende="meilleure série" />
          <Compteur icone="jeune" valeur={String(etat.jeunes.filter(objectifAtteint).length)} legende="jeûnes réussis" />
          <Compteur icone="sport" valeur={String(etat.seances.length)} legende="séances" />
        </div>
      </div>

      {/* l'IMC */}
      {valeurImc !== null && (
        <div className="carte">
          <h2 style={{ fontSize: 19, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Symbole nom="poids" taille={19} couleur="var(--miel)" /> Indice de masse corporelle
          </h2>
          <RegleImc valeur={valeurImc} />
          <p className="doux mini" style={{ margin: '12px 0 0' }}>
            L'IMC ne distingue pas le muscle de la graisse : c'est un repère, pas un verdict.
          </p>
        </div>
      )}

      {/* le sélecteur de période */}
      <div className="carte serree">
        <div style={{ display: 'flex', gap: 6 }}>
          {(['semaine', 'mois', 'annee'] as TypePeriode[]).map((valeur) => (
            <button
              key={valeur}
              type="button"
              onClick={() => setType(valeur)}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 999,
                border: 0,
                fontWeight: 700,
                fontSize: 14,
                background: type === valeur ? 'var(--degrade-argile)' : 'transparent',
                color: type === valeur ? 'var(--sur-accent)' : 'var(--doux)',
              }}
            >
              {valeur === 'semaine' ? 'Semaine' : valeur === 'mois' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>
        <div className="rangee" style={{ marginTop: 10 }}>
          <button type="button" className="bouton-fin" onClick={() => decaler(-1)}>
            ‹
          </button>
          <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{titre}</span>
          <button type="button" className="bouton-fin" onClick={() => decaler(1)}>
            ›
          </button>
        </div>
      </div>

      {/* le poids */}
      <CourbePoids etat={etat} cases={totaux} />

      {/* les calories, en barres empilées */}
      <div className="carte">
        <div className="rangee">
          <h2 style={{ fontSize: 19, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Symbole nom="dejeuner" taille={19} couleur="var(--olive)" /> Calories
          </h2>
          {but && <span className="doux mini">objectif {but} kcal</span>}
        </div>
        <BarresEmpilees cases={totaux} />
        <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
          <Legende couleur="var(--miel)" nom="Glucides" />
          <Legende couleur="var(--olive)" nom="Protéines" />
          <Legende couleur="var(--argile)" nom="Lipides" />
        </div>
      </div>

      {/* le jeûne */}
      <div className="carte">
        <h2 style={{ fontSize: 19, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Symbole nom="jeune" taille={19} couleur="var(--argile)" /> Heures de jeûne
        </h2>
        <Barres
          cases={totaux.map((c) => ({
            libelle: c.libelle,
            valeur: c.heuresJeune,
            couleur: c.jeuneReussi ? 'var(--degrade-argile)' : 'var(--piste)',
          }))}
          unite="h"
        />
      </div>

      {/* les pas */}
      <div className="carte">
        <h2 style={{ fontSize: 19, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Symbole nom="pas" taille={19} couleur="var(--miel)" /> Pas
        </h2>
        <Barres
          cases={totaux.map((c) => ({
            libelle: c.libelle,
            valeur: c.pas,
            couleur:
              c.pas >= etat.profil.butPas
                ? 'linear-gradient(180deg, var(--miel), var(--argile))'
                : 'var(--piste)',
          }))}
          unite=""
        />
      </div>

      {/* le sport */}
      <div className="carte">
        <h2 style={{ fontSize: 19, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Symbole nom="sport" taille={19} couleur="var(--canard)" /> Minutes de sport
        </h2>
        <Barres
          cases={totaux.map((c) => ({
            libelle: c.libelle,
            valeur: c.minutesSport,
            couleur: c.minutesSport ? 'linear-gradient(180deg, var(--canard-clair), var(--canard-fonce))' : 'var(--piste)',
          }))}
          unite="min"
        />
        <div className="doux mini" style={{ marginTop: 8 }}>
          {heuresMinutes(totaux.reduce((t, c) => t + c.minutesSport, 0))} sur la période
        </div>
      </div>
    </div>
  )
}

/* ---------- petits blocs ---------- */

function Compteur({
  icone,
  valeur,
  legende,
}: {
  icone: Parameters<typeof Symbole>[0]['nom']
  valeur: string
  legende: string
}) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--doux)' }}>
        <Symbole nom={icone} taille={18} />
      </div>
      <div className="chiffre" style={{ fontSize: 20 }}>
        {valeur}
      </div>
      <div className="doux mini" style={{ lineHeight: 1.2 }}>
        {legende}
      </div>
    </div>
  )
}

function Legende({ couleur, nom }: { couleur: string; nom: string }) {
  return (
    <span className="doux mini" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 9, height: 9, borderRadius: 999, background: couleur }} />
      {nom}
    </span>
  )
}

function Barres({
  cases,
  unite,
}: {
  cases: Array<{ libelle: string; valeur: number; couleur: string }>
  unite: string
}) {
  const maximum = Math.max(...cases.map((c) => c.valeur))
  // Un graphique vide, c'est un grand rectangle blanc qui n'apprend rien.
  if (maximum === 0) return <p className="vide">Rien de noté sur cette période.</p>
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: cases.length > 12 ? 2 : 6, height: 100, marginTop: 10 }}>
      {cases.map((c, index) => (
        <div key={index} style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          {cases.length <= 12 && c.valeur > 0 && (
            <div className="chiffre" style={{ fontSize: 10, color: 'var(--doux)' }}>
              {Math.round(c.valeur)}
              {unite}
            </div>
          )}
          <div
            style={{
              height: Math.max(4, (c.valeur / maximum) * 62),
              borderRadius: 6,
              background: c.couleur,
              marginTop: 3,
            }}
          />
          <div style={{ fontSize: 9, marginTop: 5, color: 'var(--estompe)', fontWeight: 700 }}>
            {c.libelle}
          </div>
        </div>
      ))}
    </div>
  )
}

function BarresEmpilees({
  cases,
}: {
  cases: Array<{ libelle: string; glucides: number; proteines: number; lipides: number }>
}) {
  // Chaque gramme vaut ses calories : c'est ce qui donne la vraie proportion.
  const valeur = (c: { glucides: number; proteines: number; lipides: number }) =>
    c.glucides * 4 + c.proteines * 4 + c.lipides * 9
  const maximum = Math.max(...cases.map(valeur))
  if (maximum === 0) return <p className="vide">Aucun repas noté sur cette période.</p>

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: cases.length > 12 ? 2 : 6, height: 110, marginTop: 10 }}>
      {cases.map((c, index) => {
        const total = valeur(c)
        const hauteur = Math.max(4, (total / maximum) * 78)
        const parts = [
          { valeur: c.glucides * 4, couleur: 'var(--miel)' },
          { valeur: c.proteines * 4, couleur: 'var(--olive)' },
          { valeur: c.lipides * 9, couleur: 'var(--argile)' },
        ]
        return (
          <div key={index} style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
            <div
              style={{
                height: hauteur,
                borderRadius: 6,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column-reverse',
                background: total ? 'transparent' : 'var(--piste)',
              }}
            >
              {total > 0 &&
                parts.map((part, i) => (
                  <div
                    key={i}
                    style={{ height: `${(part.valeur / total) * 100}%`, background: part.couleur }}
                  />
                ))}
            </div>
            <div style={{ fontSize: 9, marginTop: 5, color: 'var(--estompe)', fontWeight: 700 }}>
              {c.libelle}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CourbePoids({
  etat,
  cases,
}: {
  etat: Etat
  cases: Array<{ libelle: string; poids: number | null }>
}) {
  const points = cases.map((c, i) => ({ i, poids: c.poids })).filter((p) => p.poids !== null) as Array<{
    i: number
    poids: number
  }>
  const dernier = etat.pesees.at(-1)

  if (points.length < 2) {
    return (
      <div className="carte">
        <div className="rangee">
          <h2 style={{ fontSize: 19, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Symbole nom="poids" taille={19} couleur="var(--olive)" /> Poids
          </h2>
          {dernier && (
            <span className="chiffre">{nombreFr(dernier.poids, 1)} kg</span>
          )}
        </div>
        <p className="vide" style={{ padding: '18px 8px' }}>
          Il faut au moins deux pesées sur la période pour tracer une courbe.
        </p>
        <LigneObjectif etat={etat} />
      </div>
    )
  }

  const largeur = 320
  const hauteur = 120
  const marge = 12
  const valeurs = points.map((p) => p.poids)
  const bas = Math.min(...valeurs)
  const haut = Math.max(...valeurs)
  const amplitude = haut - bas || 1
  const x = (i: number) => marge + (i / Math.max(1, cases.length - 1)) * (largeur - marge * 2)
  const y = (v: number) => hauteur - marge - ((v - bas) / amplitude) * (hauteur - marge * 2)
  const trace = points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${x(p.i)} ${y(p.poids)}`).join(' ')
  const ecart = valeurs[valeurs.length - 1] - valeurs[0]

  return (
    <div className="carte">
      <div className="rangee">
        <div style={{ fontWeight: 800 }}>⚖️ Poids</div>
        <span
          className="chiffre mini"
          style={{ color: ecart <= 0 ? 'var(--argile-fonce)' : 'var(--miel)' }}
        >
          {ecart > 0 ? '+' : ''}
          {nombreFr(ecart, 1)} kg sur la période
        </span>
      </div>
      <svg viewBox={`0 0 ${largeur} ${hauteur}`} width="100%" height={hauteur} style={{ marginTop: 8 }}>
        <defs>
          <linearGradient id="degradeProgres" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--olive)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--olive)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${trace} L ${x(points[points.length - 1].i)} ${hauteur} L ${x(points[0].i)} ${hauteur} Z`}
          fill="url(#degradeProgres)"
        />
        <path d={trace} fill="none" stroke="var(--olive)" strokeWidth="2.5" strokeLinecap="round" />
        {points.map((p) => (
          <circle key={p.i} cx={x(p.i)} cy={y(p.poids)} r="3.5" fill="var(--olive)" />
        ))}
      </svg>
      <div className="rangee doux mini">
        <span>{nombreFr(valeurs[0], 1)} kg</span>
        <span>{nombreFr(valeurs[valeurs.length - 1], 1)} kg</span>
      </div>
      <LigneObjectif etat={etat} />
    </div>
  )
}

/* Le rappel de l'échéance sous la courbe : c'est en la regardant qu'on se
   demande quand on y sera. Le détail et l'hypothèse sont dans « Mon poids ». */
function LigneObjectif({ etat }: { etat: Etat }) {
  const p = projection(etat)
  if (p.situation === 'sans-but' || p.situation === 'sans-pesee') return null

  const mot =
    p.situation === 'atteint'
      ? 'Objectif atteint 🎉'
      : p.situation === 'stagne'
        ? `Il reste ${nombreFr(p.reste, 1)} kg — pas de date tant que la courbe ne repart pas`
        : p.tropLoin
          ? `Il reste ${nombreFr(p.reste, 1)} kg — plus de trois ans à ce rythme`
          : `Il reste ${nombreFr(p.reste, 1)} kg — ${delaiEnMots(p.jours ?? 0)}, vers le ${jourCourt(p.date as Date)}`

  return (
    <div
      className="doux mini"
      style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--bord)' }}
    >
      🎯 {mot}
      {p.source === 'prevu' && p.situation === 'en-route' && ' (rythme prévu, pas encore mesuré)'}
    </div>
  )
}
