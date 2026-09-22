/* Notre budget du mois — la fiche que Maru avait sous les yeux, en app.

   Revenus, dépenses fixes, dépenses variables avec le prévu et le dépensé,
   le reste à vivre, les épargnes et leur progression, le bilan et les notes.
   Tout est propre à notre famille : même serrure que « nos dépenses ».

   Deux choses que le papier ne fait pas : le « dépensé » des dépenses
   variables s'écrit tout seul depuis ce qu'on note au jour le jour, et notre
   part des charges de la maison arrive d'elle-même dans les dépenses fixes.

   Et l'allure d'une page de planner — rose poudré, sauge, pointillés — parce
   que c'est celle-là que Maru voulait, et qu'une fiche qu'on a envie
   d'ouvrir est une fiche qu'on remplit. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import ChoixMois from '../composants/ChoixMois'
import Symbole from '../composants/Symbole'
import {
  bilanDuMois,
  budgetDuMois,
  fcfp,
  lireMontant,
  moisDe,
  moisDecale,
  moisEnMots,
  notrePartDesCharges,
  reelParCategorie,
} from '../lib/argent'
import { useMaison } from '../lib/maison'
import { CATEGORIES_DEPENSE, foyerDe } from '../lib/types'
import type { GenreBudget, LigneBudget } from '../lib/types'

const FIXES_PROPOSEES = ['Loyer ou crédit', 'Téléphones', 'Internet', 'Assurances', 'Abonnements', 'Voiture']

export default function Budget({ fermer }: { fermer: () => void }) {
  const {
    maison,
    monFoyerId,
    partagee,
    ajouterLigneBudget,
    modifierLigneBudget,
    supprimerLigneBudget,
  } = useMaison()
  const [periode, setPeriode] = useState(moisDe())
  const foyer = foyerDe(maison, monFoyerId)

  if (!monFoyerId || !foyer) {
    return (
      <div className="page">
        <Entete kicker="Nos dépenses" titre="Notre budget" retour={fermer} />
        <div className="carte" style={{ background: 'var(--ocre-pale)' }}>
          <div style={{ fontWeight: 700 }}>
            {partagee ? "Ce compte n'est d'aucune famille" : 'Dites d’abord qui vous êtes'}
          </div>
          <p className="doux mini" style={{ margin: '6px 0 0', lineHeight: 1.7 }}>
            Le budget est celui de votre famille : entrez avec son code.
          </p>
        </div>
      </div>
    )
  }

  const foyerId = monFoyerId
  const lignes = budgetDuMois(maison, foyerId, periode)
  const de = (genre: GenreBudget) => lignes.filter((l) => l.genre === genre)
  const note = (cle: string) => lignes.find((l) => l.genre === 'note' && l.cle === cle)
  const reel = reelParCategorie(maison, foyerId, periode)
  const partCharges = notrePartDesCharges(maison, foyerId, periode)
  const bilan = bilanDuMois(maison, foyerId, periode)

  const moisDernier = moisDecale(periode, -1)
  const lignesDernier = budgetDuMois(maison, foyerId, moisDernier).filter((l) => l.genre !== 'note')
  const vide = lignes.length === 0

  const nouvelle = (genre: GenreBudget, cle: string, libelle: string, montant = 0, realise = 0) =>
    ajouterLigneBudget({ foyerId, periode, genre, cle, libelle, montant, realise })

  const ecrireNote = (cle: string, texte: string) => {
    const existante = note(cle)
    if (existante) return modifierLigneBudget(existante.id, { libelle: texte })
    if (texte.trim()) return nouvelle('note', cle, texte)
    return Promise.resolve()
  }

  /* Le budget d'une catégorie variable : une ligne « prevu », créée à la
     première saisie. */
  const prevuDe = (categorie: string) => de('prevu').find((l) => l.cle === categorie)
  const ecrirePrevu = (categorie: string, nom: string, montant: number) => {
    const existante = prevuDe(categorie)
    if (existante) return modifierLigneBudget(existante.id, { montant })
    return nouvelle('prevu', categorie, nom, montant)
  }

  return (
    <div className="page fiche">
      <Entete kicker={foyer.nom} titre="Notre budget" retour={fermer} />

      {/* ---------- la tête de la fiche ---------- */}
      <div className="fiche-entete">
        <span className="deco" style={{ left: 14, top: 12 }} aria-hidden="true">
          🌿
        </span>
        <span className="deco" style={{ right: 14, top: 14 }} aria-hidden="true">
          ☕
        </span>
        <span className="deco" style={{ right: 22, bottom: 14, fontSize: 18 }} aria-hidden="true">
          🌸
        </span>
        <div className="fiche-titre">MON BUDGET</div>
        <span className="fiche-script">du mois</span>
        <div className="fiche-devise">Gérer son budget, c'est s'offrir plus de liberté !</div>
        <div style={{ marginTop: 12 }}>
          <ChoixMois periode={periode} changer={setPeriode} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: -2 }}>
          <div style={{ textAlign: 'left' }}>
            <div className="etiquette" style={{ marginBottom: 2 }}>
              Reste à vivre
            </div>
            <div
              className="chiffre"
              style={{
                fontSize: 24,
                color: bilan.resteAVivre < 0 ? 'var(--corail-fonce)' : 'var(--fiche-sauge)',
              }}
            >
              {fcfp(bilan.resteAVivre)}
            </div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <label className="etiquette" htmlFor="objectif-mois" style={{ marginBottom: 2 }}>
              Objectif du mois
            </label>
            <input
              key={`objectif-${periode}-${note('objectif')?.id ?? ''}`}
              id="objectif-mois"
              className="champ"
              style={{ padding: '7px 10px', fontSize: 14 }}
              placeholder="ex. 20 000 F pour Moorea"
              defaultValue={note('objectif')?.libelle ?? ''}
              onBlur={(e) => void ecrireNote('objectif', e.target.value)}
            />
          </div>
        </div>
      </div>

      {vide && lignesDernier.length > 0 && (
        <button
          type="button"
          className="fiche-sticker"
          style={{ width: '100%', justifyContent: 'center', padding: 10, marginBottom: 14 }}
          onClick={() => {
            // Les revenus, les fixes, les budgets et les objectifs d'épargne
            // se ressemblent d'un mois à l'autre. Le mis de côté, non.
            for (const l of lignesDernier) {
              void nouvelle(l.genre, l.cle, l.libelle, l.montant, 0)
            }
          }}
        >
          📋 Recopier la fiche de {moisEnMots(moisDernier)}
        </button>
      )}

      {/* ---------- 1. les revenus ---------- */}
      <div className="fiche-bloc sauge">
        <div className="fiche-bloc-titre">
          <span className="fiche-numero">1</span> Mes revenus
          <span className="bout">💶</span>
        </div>
        <div className="fiche-tete" style={{ gridTemplateColumns: '1fr 96px 28px' }}>
          <span>source</span>
          <span style={{ textAlign: 'right' }}>montant</span>
          <span />
        </div>
        {de('revenu').map((l) => (
          <Ligne
            key={l.id}
            ligne={l}
            modifier={(c) => void modifierLigneBudget(l.id, c)}
            retirer={() => void supprimerLigneBudget(l.id)}
          />
        ))}
        <AjouterLigne
          placeholder="ex. Salaire Will"
          ajouter={(libelle, montant) => void nouvelle('revenu', '', libelle, montant)}
        />
        <div className="fiche-total">
          <span>TOTAL REVENUS</span>
          <span className="chiffre" style={{ color: 'inherit' }}>{fcfp(bilan.revenus)}</span>
        </div>
      </div>

      {/* ---------- 2. les dépenses fixes ---------- */}
      <div className="fiche-bloc rose">
        <div className="fiche-bloc-titre">
          <span className="fiche-numero">2</span> Mes dépenses fixes
          <span className="bout">🏠</span>
        </div>
        {partCharges > 0 && (
          <div className="fiche-rangee" style={{ gridTemplateColumns: '1fr 96px 28px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>⚡ Notre part des charges de la maison</div>
              <div className="doux mini">calculée depuis les factures</div>
            </div>
            <span className="chiffre mini" style={{ textAlign: 'right' }}>
              {fcfp(partCharges)}
            </span>
            <span />
          </div>
        )}
        {de('fixe').map((l) => (
          <Ligne
            key={l.id}
            ligne={l}
            modifier={(c) => void modifierLigneBudget(l.id, c)}
            retirer={() => void supprimerLigneBudget(l.id)}
          />
        ))}
        {de('fixe').length === 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0 4px' }}>
            {FIXES_PROPOSEES.map((nom) => (
              <button
                key={nom}
                type="button"
                className="fiche-sticker"
                onClick={() => void nouvelle('fixe', '', nom)}
              >
                + {nom}
              </button>
            ))}
          </div>
        )}
        <AjouterLigne
          placeholder="ex. Assurance voiture"
          ajouter={(libelle, montant) => void nouvelle('fixe', '', libelle, montant)}
        />
        <div className="fiche-total">
          <span>TOTAL FIXES</span>
          <span className="chiffre" style={{ color: 'inherit' }}>{fcfp(bilan.fixes)}</span>
        </div>
      </div>

      {/* ---------- 3. les dépenses variables ---------- */}
      <div className="fiche-bloc">
        <div className="fiche-bloc-titre">
          <span className="fiche-numero">3</span> Mes dépenses variables
          <span className="bout">🛍️</span>
        </div>
        <div className="fiche-tete" style={{ gridTemplateColumns: '1fr 78px 78px' }}>
          <span>catégorie</span>
          <span style={{ textAlign: 'right' }}>prévu</span>
          <span style={{ textAlign: 'right' }}>dépensé</span>
        </div>
        {CATEGORIES_DEPENSE.map((c) => {
          const prevu = prevuDe(c.id)?.montant ?? 0
          const depense = reel[c.id] ?? 0
          const difference = prevu - depense
          return (
            <div key={c.id} className="fiche-rangee" style={{ gridTemplateColumns: '1fr 78px 78px' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {c.emoji} {c.nom}
                </div>
                {prevu > 0 && (
                  <div
                    className="mini"
                    style={{ color: difference < 0 ? 'var(--corail-fonce)' : 'var(--fiche-sauge)' }}
                  >
                    {difference < 0 ? `dépassé de ${fcfp(-difference)}` : `reste ${fcfp(difference)}`}
                  </div>
                )}
              </div>
              <input
                key={`${c.id}-${periode}-${prevu}`}
                className="champ"
                inputMode="numeric"
                placeholder="0"
                defaultValue={prevu || ''}
                aria-label={`Budget prévu ${c.nom}`}
                style={{ padding: '7px 8px', textAlign: 'right', fontSize: 14 }}
                onBlur={(e) => {
                  const montant = lireMontant(e.target.value)
                  if (montant !== prevu) void ecrirePrevu(c.id, c.nom, montant)
                }}
              />
              <span className="chiffre mini" style={{ textAlign: 'right' }}>
                {fcfp(depense)}
              </span>
            </div>
          )
        })}
        <div className="doux mini" style={{ margin: '8px 0 0' }}>
          Le dépensé vient tout seul de « nos dépenses ».
        </div>
        <div className="fiche-total">
          <span>TOTAL VARIABLES</span>
          <span className="chiffre" style={{ color: 'inherit' }}>
            {fcfp(bilan.variables)} <span className="mini">/ {fcfp(bilan.prevu)} prévu</span>
          </span>
        </div>
      </div>

      {/* ---------- le récap ---------- */}
      <div className="fiche-bloc rose">
        <div className="fiche-bloc-titre">
          <span style={{ color: 'var(--fiche-rose)' }}>♥</span> Mon récap du mois
        </div>
        <Recap nom="Total revenus" valeur={bilan.revenus} />
        <Recap nom="− Total dépenses fixes" valeur={bilan.fixes} />
        <Recap nom="− Total dépenses variables" valeur={bilan.variables} />
        <Recap nom="= Reste à vivre" valeur={bilan.resteAVivre} fort />
        <Recap nom="− Mis de côté" valeur={bilan.epargneFaite} />
        <Recap nom="= Ce qu'il reste vraiment" valeur={bilan.solde} fort />
      </div>

      <div className="fiche-astuce">
        <span style={{ fontSize: 30 }} aria-hidden="true">
          🐷
        </span>
        <div>
          <b style={{ fontStyle: 'normal' }}>
            Astuce <span className="coeur">♥</span>
          </b>
          <br />
          Mettez de côté en premier ce que vous voulez épargner, puis vivez avec le reste.
          C'est la clé !
        </div>
      </div>

      {/* ---------- les épargnes ---------- */}
      <div className="fiche-bloc sauge">
        <div className="fiche-bloc-titre">
          <span style={{ color: 'var(--fiche-sauge)' }}>◎</span> Suivi de mes épargnes
          <span className="bout">
            {fcfp(bilan.epargneFaite)} / {fcfp(bilan.epargneVisee)}
          </span>
        </div>
        {de('epargne').map((l) => {
          const pourcent = l.montant > 0 ? Math.min(100, Math.round((l.realise / l.montant) * 100)) : 0
          return (
            <div key={l.id} style={{ padding: '8px 0', borderBottom: '1.5px dotted var(--fiche-trait)' }}>
              <div className="rangee" style={{ gap: 8 }}>
                <input
                  key={`nom-${l.id}`}
                  className="champ"
                  style={{ padding: '7px 8px', fontSize: 14, flex: 1 }}
                  defaultValue={l.libelle}
                  aria-label="Objectif"
                  onBlur={(e) => void modifierLigneBudget(l.id, { libelle: e.target.value })}
                />
                <button
                  type="button"
                  className="croix"
                  aria-label={`Retirer ${l.libelle}`}
                  onClick={() => void supprimerLigneBudget(l.id)}
                >
                  <Symbole nom="croix" taille={12} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <div>
                  <div className="etiquette">visé</div>
                  <input
                    key={`vise-${l.id}-${l.montant}`}
                    className="champ"
                    inputMode="numeric"
                    style={{ padding: '7px 8px', fontSize: 14, textAlign: 'right' }}
                    defaultValue={l.montant || ''}
                    aria-label="Montant visé"
                    onBlur={(e) => void modifierLigneBudget(l.id, { montant: lireMontant(e.target.value) })}
                  />
                </div>
                <div>
                  <div className="etiquette">mis de côté</div>
                  <input
                    key={`fait-${l.id}-${l.realise}`}
                    className="champ"
                    inputMode="numeric"
                    style={{ padding: '7px 8px', fontSize: 14, textAlign: 'right' }}
                    defaultValue={l.realise || ''}
                    aria-label="Mis de côté"
                    onBlur={(e) => void modifierLigneBudget(l.id, { realise: lireMontant(e.target.value) })}
                  />
                </div>
              </div>
              <div className="rangee" style={{ marginTop: 8, gap: 10 }}>
                <div className="fiche-progression">
                  <i style={{ width: `${pourcent}%` }} />
                </div>
                <span className="chiffre mini">{pourcent} %</span>
              </div>
            </div>
          )
        })}
        <AjouterLigne
          placeholder="ex. Voyage à Moorea"
          libelleMontant="visé"
          ajouter={(libelle, montant) => void nouvelle('epargne', '', libelle, montant)}
        />
      </div>

      {/* ---------- 4. le bilan ---------- */}
      <div className="fiche-bloc">
        <div className="fiche-bloc-titre">
          <span className="fiche-numero">4</span> Bilan du mois
        </div>
        <Question
          texte="Ai-je respecté mon budget ?"
          reponse={bilan.prevu === 0 ? null : bilan.variables <= bilan.prevu}
          detail={
            bilan.prevu === 0
              ? 'pas encore de budget prévu'
              : bilan.variables <= bilan.prevu
                ? `oui — ${fcfp(bilan.prevu - bilan.variables)} sous le prévu`
                : `non — ${fcfp(bilan.variables - bilan.prevu)} au-dessus`
          }
        />
        <Question
          texte="Ai-je atteint mes objectifs ?"
          reponse={bilan.epargneVisee === 0 ? null : bilan.epargneFaite >= bilan.epargneVisee}
          detail={
            bilan.epargneVisee === 0
              ? "pas encore d'objectif d'épargne"
              : `${fcfp(bilan.epargneFaite)} mis de côté sur ${fcfp(bilan.epargneVisee)}`
          }
        />
        <label className="etiquette" style={{ marginTop: 12 }} htmlFor="fiere">
          Ce dont je suis fière ce mois-ci
        </label>
        <textarea
          key={`fiere-${periode}-${note('fiere')?.id ?? ''}`}
          id="fiere"
          className="champ fiche-lignes"
          rows={3}
          defaultValue={note('fiere')?.libelle ?? ''}
          onBlur={(e) => void ecrireNote('fiere', e.target.value)}
        />
        <label className="etiquette" style={{ marginTop: 12 }} htmlFor="ameliorer">
          Ce que je vais améliorer le mois prochain
        </label>
        <textarea
          key={`ameliorer-${periode}-${note('ameliorer')?.id ?? ''}`}
          id="ameliorer"
          className="champ fiche-lignes"
          rows={3}
          defaultValue={note('ameliorer')?.libelle ?? ''}
          onBlur={(e) => void ecrireNote('ameliorer', e.target.value)}
        />
      </div>

      {/* ---------- les notes ---------- */}
      <div className="fiche-bloc sauge">
        <div className="fiche-bloc-titre">
          <span style={{ color: 'var(--fiche-or)' }}>✎</span> Notes &amp; idées
        </div>
        <textarea
          key={`notes-${periode}-${note('notes')?.id ?? ''}`}
          id="notes"
          className="champ fiche-lignes"
          rows={4}
          placeholder="Un budget ne sert pas à se priver, mais à choisir ce qui compte vraiment pour vous."
          defaultValue={note('notes')?.libelle ?? ''}
          onBlur={(e) => void ecrireNote('notes', e.target.value)}
        />
        <p className="doux mini" style={{ margin: '10px 0 0', textAlign: 'center', fontStyle: 'italic' }}>
          Chaque petite action compte. Soyez fière de chaque pas vers vos objectifs ♥
        </p>
      </div>
    </div>
  )
}

/* ---------- les petits morceaux de la fiche ---------- */

function Ligne({
  ligne,
  modifier,
  retirer,
}: {
  ligne: LigneBudget
  modifier: (changements: Partial<LigneBudget>) => void
  retirer: () => void
}) {
  return (
    <div className="fiche-rangee" style={{ gridTemplateColumns: '1fr 96px 28px' }}>
      <input
        key={`l-${ligne.id}`}
        className="champ"
        style={{ padding: '7px 8px', fontSize: 14, minWidth: 0 }}
        defaultValue={ligne.libelle}
        aria-label="Libellé"
        onBlur={(e) => modifier({ libelle: e.target.value })}
      />
      <input
        key={`m-${ligne.id}-${ligne.montant}`}
        className="champ"
        inputMode="numeric"
        style={{ padding: '7px 8px', fontSize: 14, textAlign: 'right' }}
        defaultValue={ligne.montant || ''}
        placeholder="0"
        aria-label={`Montant ${ligne.libelle}`}
        onBlur={(e) => {
          const montant = lireMontant(e.target.value)
          if (montant !== ligne.montant) modifier({ montant })
        }}
      />
      <button type="button" className="croix" aria-label={`Retirer ${ligne.libelle}`} onClick={retirer}>
        <Symbole nom="croix" taille={12} />
      </button>
    </div>
  )
}

function AjouterLigne({
  placeholder,
  libelleMontant = 'montant',
  ajouter,
}: {
  placeholder: string
  libelleMontant?: string
  ajouter: (libelle: string, montant: number) => void
}) {
  const [libelle, setLibelle] = useState('')
  const [montant, setMontant] = useState('')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 96px 36px', gap: 8, marginTop: 10 }}>
      <input
        className="champ"
        style={{ padding: '7px 8px', fontSize: 14, minWidth: 0 }}
        placeholder={placeholder}
        value={libelle}
        onChange={(e) => setLibelle(e.target.value)}
      />
      <input
        className="champ"
        inputMode="numeric"
        style={{ padding: '7px 8px', fontSize: 14, textAlign: 'right' }}
        placeholder={libelleMontant}
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
      />
      <button
        type="button"
        className="bouton-fiche"
        style={{ padding: 0, width: 36, height: 36 }}
        aria-label="Ajouter"
        disabled={libelle.trim().length === 0}
        onClick={() => {
          ajouter(libelle.trim(), lireMontant(montant))
          setLibelle('')
          setMontant('')
        }}
      >
        +
      </button>
    </div>
  )
}

function Recap({ nom, valeur, fort = false }: { nom: string; valeur: number; fort?: boolean }) {
  return (
    <div
      className="rangee"
      style={{ padding: '6px 0', borderBottom: '1.5px dotted var(--fiche-trait)', fontWeight: fort ? 700 : 400 }}
    >
      <span>{nom}</span>
      <span
        className="chiffre mini"
        style={{ color: fort && valeur < 0 ? 'var(--corail-fonce)' : undefined }}
      >
        {fcfp(valeur)}
      </span>
    </div>
  )
}

function Question({
  texte,
  reponse,
  detail,
}: {
  texte: string
  reponse: boolean | null
  detail: string
}) {
  return (
    <div className="rangee" style={{ marginTop: 8, alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{texte}</div>
        <div className="doux mini">{detail}</div>
      </div>
      <span style={{ fontSize: 26 }}>{reponse === null ? '🙂' : reponse ? '😄' : '😕'}</span>
    </div>
  )
}
