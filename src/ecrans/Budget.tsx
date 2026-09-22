/* Notre budget du mois — la fiche que Maru avait sous les yeux, en app.

   Revenus, dépenses fixes, dépenses variables avec le prévu et le dépensé,
   le reste à vivre, les épargnes et leur progression, le bilan et les notes.
   Tout est propre à notre famille : même serrure que « nos dépenses ».

   Deux choses que le papier ne fait pas : le « dépensé » des dépenses
   variables s'écrit tout seul depuis ce qu'on note au jour le jour, et notre
   part des charges de la maison arrive d'elle-même dans les dépenses fixes. */

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
    <div className="page">
      <Entete kicker={foyer.nom} titre="Notre budget" retour={fermer} />

      <ChoixMois periode={periode} changer={setPeriode} />

      {/* ---------- l'en-tête de la fiche : le mois et son objectif ---------- */}
      <div className="carte" style={{ background: 'var(--lagon-pale)' }}>
        <div className="rangee">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="kicker">Reste à vivre · {moisEnMots(periode)}</div>
            <div
              className="chiffre"
              style={{ fontSize: 32, color: bilan.resteAVivre < 0 ? 'var(--corail-fonce)' : undefined }}
            >
              {fcfp(bilan.resteAVivre)}
            </div>
            <div className="doux mini">revenus − dépenses fixes − dépenses variables</div>
          </div>
          <Symbole nom="cadenas" taille={24} couleur="var(--lagon)" />
        </div>
        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="objectif-mois">
          Objectif du mois
        </label>
        <input
          key={`objectif-${periode}-${note('objectif')?.id ?? ''}`}
          id="objectif-mois"
          className="champ"
          placeholder="ex. Mettre 20 000 F de côté pour Moorea"
          defaultValue={note('objectif')?.libelle ?? ''}
          onBlur={(e) => void ecrireNote('objectif', e.target.value)}
        />
      </div>

      {vide && lignesDernier.length > 0 && (
        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%', marginBottom: 14 }}
          onClick={() => {
            // Les revenus, les fixes, les budgets et les objectifs d'épargne
            // se ressemblent d'un mois à l'autre. Le mis de côté, non.
            for (const l of lignesDernier) {
              void nouvelle(l.genre, l.cle, l.libelle, l.montant, 0)
            }
          }}
        >
          Recopier la fiche de {moisEnMots(moisDernier)}
        </button>
      )}

      {/* ---------- 1. les revenus ---------- */}
      <Section numero={1} titre="Mes revenus" total={bilan.revenus}>
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
      </Section>

      {/* ---------- 2. les dépenses fixes ---------- */}
      <Section numero={2} titre="Mes dépenses fixes" total={bilan.fixes}>
        {partCharges > 0 && (
          <div className="ligne-liste">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Notre part des charges de la maison</div>
              <div className="doux mini">électricité, eau… — calculée depuis les factures</div>
            </div>
            <span className="chiffre mini">{fcfp(partCharges)}</span>
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
                className="pilule"
                style={{ border: 0, cursor: 'pointer' }}
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
      </Section>

      {/* ---------- 3. les dépenses variables ---------- */}
      <div className="carte">
        <div className="rangee">
          <div className="kicker">3 · Mes dépenses variables</div>
          <span className="pilule">
            {fcfp(bilan.variables)} / {fcfp(bilan.prevu)}
          </span>
        </div>
        <div className="doux mini" style={{ margin: '4px 0 6px' }}>
          Le dépensé vient de « nos dépenses ». Tapez le budget prévu de chaque catégorie.
        </div>
        <div
          className="doux mini"
          style={{ display: 'grid', gridTemplateColumns: '1fr 82px 82px', gap: 8, padding: '6px 0' }}
        >
          <span>catégorie</span>
          <span style={{ textAlign: 'right' }}>prévu</span>
          <span style={{ textAlign: 'right' }}>dépensé</span>
        </div>
        {CATEGORIES_DEPENSE.map((c) => {
          const prevu = prevuDe(c.id)?.montant ?? 0
          const depense = reel[c.id] ?? 0
          const difference = prevu - depense
          return (
            <div
              key={c.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 82px 82px',
                gap: 8,
                alignItems: 'center',
                padding: '7px 0',
                borderTop: '1px solid var(--bord)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {c.emoji} {c.nom}
                </div>
                {prevu > 0 && (
                  <div
                    className="doux mini"
                    style={{ color: difference < 0 ? 'var(--corail-fonce)' : 'var(--feuille)' }}
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
                style={{ padding: '8px 8px', textAlign: 'right', fontSize: 14 }}
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
      </div>

      {/* ---------- le récap ---------- */}
      <div className="carte" style={{ background: 'var(--creme)' }}>
        <div className="kicker">Mon récap du mois</div>
        <Recap nom="Total revenus" valeur={bilan.revenus} />
        <Recap nom="− dépenses fixes" valeur={bilan.fixes} />
        <Recap nom="− dépenses variables" valeur={bilan.variables} />
        <Recap nom="= reste à vivre" valeur={bilan.resteAVivre} fort />
        <Recap nom="− mis de côté" valeur={bilan.epargneFaite} />
        <Recap nom="= ce qu'il reste" valeur={bilan.solde} fort />
        <p className="doux mini" style={{ margin: '10px 0 0', lineHeight: 1.7 }}>
          Mettez de côté en premier ce que vous voulez épargner, puis vivez avec le reste.
          C'est la clé.
        </p>
      </div>

      {/* ---------- les épargnes ---------- */}
      <div className="carte">
        <div className="rangee">
          <div className="kicker">Suivi de mes épargnes</div>
          <span className="pilule vert">
            {fcfp(bilan.epargneFaite)} / {fcfp(bilan.epargneVisee)}
          </span>
        </div>
        {de('epargne').map((l) => {
          const pourcent = l.montant > 0 ? Math.min(100, Math.round((l.realise / l.montant) * 100)) : 0
          return (
            <div key={l.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--bord)' }}>
              <div className="rangee">
                <input
                  key={`nom-${l.id}`}
                  className="champ"
                  style={{ padding: '6px 8px', fontSize: 14, flex: 1 }}
                  defaultValue={l.libelle}
                  aria-label="Objectif"
                  onBlur={(e) => void modifierLigneBudget(l.id, { libelle: e.target.value })}
                />
                <button
                  type="button"
                  className="bouton-fin"
                  style={{ padding: '4px 10px', flex: '0 0 auto' }}
                  aria-label={`Retirer ${l.libelle}`}
                  onClick={() => void supprimerLigneBudget(l.id)}
                >
                  <Symbole nom="croix" taille={13} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <div>
                  <div className="etiquette">visé</div>
                  <input
                    key={`vise-${l.id}-${l.montant}`}
                    className="champ"
                    inputMode="numeric"
                    style={{ padding: '8px', fontSize: 14, textAlign: 'right' }}
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
                    style={{ padding: '8px', fontSize: 14, textAlign: 'right' }}
                    defaultValue={l.realise || ''}
                    aria-label="Mis de côté"
                    onBlur={(e) => void modifierLigneBudget(l.id, { realise: lireMontant(e.target.value) })}
                  />
                </div>
              </div>
              <div className="rangee" style={{ marginTop: 8, gap: 10 }}>
                <div className="barre" style={{ flex: 1 }}>
                  <i style={{ width: `${pourcent}%`, background: 'var(--feuille)' }} />
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
      <div className="carte">
        <div className="kicker">4 · Bilan du mois</div>
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
          className="champ"
          rows={2}
          defaultValue={note('fiere')?.libelle ?? ''}
          onBlur={(e) => void ecrireNote('fiere', e.target.value)}
        />
        <label className="etiquette" style={{ marginTop: 12 }} htmlFor="ameliorer">
          Ce que je vais améliorer le mois prochain
        </label>
        <textarea
          key={`ameliorer-${periode}-${note('ameliorer')?.id ?? ''}`}
          id="ameliorer"
          className="champ"
          rows={2}
          defaultValue={note('ameliorer')?.libelle ?? ''}
          onBlur={(e) => void ecrireNote('ameliorer', e.target.value)}
        />
      </div>

      {/* ---------- les notes ---------- */}
      <div className="carte">
        <label className="etiquette" htmlFor="notes">
          Notes et idées
        </label>
        <textarea
          key={`notes-${periode}-${note('notes')?.id ?? ''}`}
          id="notes"
          className="champ"
          rows={3}
          placeholder="Un budget ne sert pas à se priver, mais à choisir ce qui compte vraiment pour vous."
          defaultValue={note('notes')?.libelle ?? ''}
          onBlur={(e) => void ecrireNote('notes', e.target.value)}
        />
      </div>
    </div>
  )
}

/* ---------- les petits morceaux de la fiche ---------- */

function Section({
  numero,
  titre,
  total,
  children,
}: {
  numero: number
  titre: string
  total: number
  children: React.ReactNode
}) {
  return (
    <div className="carte">
      <div className="rangee">
        <div className="kicker">
          {numero} · {titre}
        </div>
        <span className="pilule">{fcfp(total)}</span>
      </div>
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  )
}

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
    <div className="ligne-liste" style={{ gap: 8 }}>
      <input
        key={`l-${ligne.id}`}
        className="champ"
        style={{ padding: '8px', fontSize: 14, flex: 1, minWidth: 0 }}
        defaultValue={ligne.libelle}
        aria-label="Libellé"
        onBlur={(e) => modifier({ libelle: e.target.value })}
      />
      <input
        key={`m-${ligne.id}-${ligne.montant}`}
        className="champ"
        inputMode="numeric"
        style={{ padding: '8px', fontSize: 14, width: 96, textAlign: 'right' }}
        defaultValue={ligne.montant || ''}
        placeholder="0"
        aria-label={`Montant ${ligne.libelle}`}
        onBlur={(e) => {
          const montant = lireMontant(e.target.value)
          if (montant !== ligne.montant) modifier({ montant })
        }}
      />
      <button
        type="button"
        className="bouton-fin"
        style={{ padding: '4px 10px', flex: '0 0 auto' }}
        aria-label={`Retirer ${ligne.libelle}`}
        onClick={retirer}
      >
        <Symbole nom="croix" taille={13} />
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
    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
      <input
        className="champ"
        style={{ padding: '8px', fontSize: 14, flex: 1, minWidth: 0 }}
        placeholder={placeholder}
        value={libelle}
        onChange={(e) => setLibelle(e.target.value)}
      />
      <input
        className="champ"
        inputMode="numeric"
        style={{ padding: '8px', fontSize: 14, width: 96, textAlign: 'right' }}
        placeholder={libelleMontant}
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
      />
      <button
        type="button"
        className="bouton"
        style={{ width: 'auto', padding: '8px 14px', fontSize: 14, flex: '0 0 auto' }}
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
    <div className="rangee" style={{ marginTop: 6 }}>
      <span className={fort ? '' : 'doux'} style={{ fontWeight: fort ? 700 : 400 }}>
        {nom}
      </span>
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
      <span style={{ fontSize: 24 }}>{reponse === null ? '🙂' : reponse ? '😄' : '😕'}</span>
    </div>
  )
}
