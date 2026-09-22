/* Le rapport de l'année — la même fiche que le premier rapport, dans l'app.
   Même allure que le budget : c'est une page du même carnet. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { fcfp } from '../lib/argent'

const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
import { useMaison } from '../lib/maison'
import { anneesDisponibles, posteDe, rapportDe } from '../lib/rapport'
import type { Vue } from '../lib/navigation'
import { foyerDe } from '../lib/types'

export default function Rapport({ ouvrir, fermer }: { ouvrir: (vue: Vue) => void; fermer: () => void }) {
  const { maison, monFoyerId } = useMaison()
  const foyer = foyerDe(maison, monFoyerId)
  const annees = monFoyerId ? anneesDisponibles(maison, monFoyerId) : []
  const [annee, setAnnee] = useState(annees[0] ?? String(new Date().getFullYear()))

  if (!monFoyerId || !foyer) {
    return (
      <div className="page">
        <Entete kicker="Nos dépenses" titre="Le rapport" retour={fermer} />
        <div className="carte" style={{ background: 'var(--ocre-pale)' }}>
          <p className="doux mini" style={{ margin: 0 }}>
            Le rapport est celui de votre famille : entrez avec son code.
          </p>
        </div>
      </div>
    )
  }

  const r = rapportDe(maison, monFoyerId, annee)
  const parMois = Math.round(r.depenses / r.nbMois)
  const solde = r.revenus - r.depenses
  const maxPoste = r.parPoste[0]?.total ?? 1
  const maxMois = Math.max(1, ...r.parMois.map((m) => Math.max(m.revenus, m.depenses)))
  const jour = (d: string) => (d ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : '—')
  const pct = (v: number) => (r.depenses > 0 ? `${Math.round((100 * v) / r.depenses)} %` : '—')

  if (r.nbLignes === 0) {
    return (
      <div className="page fiche">
        <Entete kicker={foyer.nom} titre="Le rapport" retour={fermer} />
        <div className="fiche-bloc">
          <p style={{ margin: 0 }}>
            Rien à rapporter pour {annee}. Importez le relevé de la banque, ou notez vos dépenses au
            jour le jour : le rapport se fait tout seul.
          </p>
          <button
            type="button"
            className="bouton-fiche"
            style={{ marginTop: 12 }}
            onClick={() => ouvrir({ nom: 'importer-banque' })}
          >
            Importer le relevé de la banque
          </button>
        </div>
      </div>
    )
  }

  const remarques: string[] = []
  const credit = posteDe(r, 'credit')
  if (credit > 0) remarques.push(`Le crédit : ${fcfp(credit)}, soit ${fcfp(Math.round(credit / r.nbMois))} par mois — ${pct(credit)} des dépenses.`)
  if (r.virements > 0)
    remarques.push(
      `Les virements sortants pèsent ${fcfp(r.virements)}. Ceux vers vos propres comptes sont de l'épargne, pas des dépenses : si c'est le cas, le vrai solde est meilleur que ${fcfp(solde)}.`,
    )
  const courses = posteDe(r, 'courses')
  if (courses > 0) remarques.push(`Les courses : ${fcfp(Math.round(courses / r.nbMois))} par mois${r.topCourses ? `, surtout chez ${r.topCourses}` : ''}.`)
  const elec = posteDe(r, 'electricite')
  if (elec > 0) remarques.push(`L'électricité (${fcfp(elec)}) est réglée depuis ce compte : c'est la facture de toute la maison, et les autres participants en doivent leur part.`)
  const roulotte = posteDe(r, 'roulotte')
  if (roulotte > 0) remarques.push(`${fcfp(roulotte)} de frais de la roulotte sont passés sur le compte perso : des charges de l'entreprise, à rebasculer sur son compte — elles se déduisent.`)
  const abos = posteDe(r, 'abonnements')
  if (abos > 0) remarques.push(`Les abonnements : ${fcfp(abos)}, ${fcfp(Math.round(abos / r.nbMois))} par mois. Le poste le plus facile à alléger : une revue de ce qui sert vraiment.`)
  const sorties = posteDe(r, 'sorties')
  if (sorties > 0) remarques.push(`Restaurants et sorties : ${fcfp(sorties)} — ${fcfp(Math.round(sorties / r.nbMois))} par mois.`)

  return (
    <div className="page fiche">
      <Entete kicker={foyer.nom} titre="Le rapport" retour={fermer} />

      <div className="fiche-entete">
        <span className="deco" style={{ left: 14, top: 12 }} aria-hidden="true">🌿</span>
        <span className="deco" style={{ right: 14, top: 14 }} aria-hidden="true">📊</span>
        <div className="fiche-titre">NOS DÉPENSES</div>
        <span className="fiche-script">{annee}</span>
        {annees.length > 1 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
            {annees.map((a) => (
              <button key={a} type="button" className="fiche-sticker" style={{ background: a === annee ? 'var(--fiche-rose-pale)' : undefined }} onClick={() => setAnnee(a)}>
                {a}
              </button>
            ))}
          </div>
        )}
        <div className="doux mini" style={{ marginTop: 8 }}>
          {r.nbLignes} mouvements · du {jour(r.premiere)} au {jour(r.derniere)} · {r.nbMois} mois
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
          <Carte titre="Revenus" valeur={r.revenus} sous={`${fcfp(Math.round(r.revenus / r.nbMois))} / mois`} fond="var(--fiche-sauge-pale)" />
          <Carte titre="Dépenses" valeur={r.depenses} sous={`${fcfp(parMois)} / mois`} fond="var(--fiche-rose-pale)" />
          <Carte titre="Solde" valeur={solde} sous={`${fcfp(Math.round(solde / r.nbMois))} / mois`} fond="var(--fiche-papier)" couleur={solde < 0 ? 'var(--corail-fonce)' : 'var(--fiche-sauge)'} />
        </div>
      </div>

      {/* ---------- 1. mois par mois ---------- */}
      <div className="fiche-bloc">
        <div className="fiche-bloc-titre"><span className="fiche-numero">1</span> Mois par mois</div>
        <div className="fiche-tete" style={{ gridTemplateColumns: '54px 1fr 1fr 1fr' }}>
          <span>mois</span><span style={{ textAlign: 'right' }}>revenus</span><span style={{ textAlign: 'right' }}>dépenses</span><span style={{ textAlign: 'right' }}>solde</span>
        </div>
        {r.parMois.map((m) => (
          <div key={m.mois} className="fiche-rangee" style={{ gridTemplateColumns: '54px 1fr 1fr 1fr' }}>
            <span style={{ fontWeight: 600 }}>{MOIS_COURTS[Number(m.mois.slice(5, 7)) - 1]}</span>
            <span className="chiffre mini" style={{ textAlign: 'right' }}>{fcfp(m.revenus)}</span>
            <span className="chiffre mini" style={{ textAlign: 'right' }}>{fcfp(m.depenses)}</span>
            <span className="chiffre mini" style={{ textAlign: 'right', color: m.revenus - m.depenses < 0 ? 'var(--corail-fonce)' : 'var(--fiche-sauge)' }}>{fcfp(m.revenus - m.depenses)}</span>
            <div className="fiche-progression" style={{ gridColumn: '1 / -1', height: 6 }}>
              <i style={{ width: `${Math.round((100 * m.depenses) / maxMois)}%`, background: 'var(--fiche-rose)' }} />
            </div>
          </div>
        ))}
      </div>

      {/* ---------- 2. où part l'argent ---------- */}
      <div className="fiche-bloc rose">
        <div className="fiche-bloc-titre"><span className="fiche-numero">2</span> Où part l'argent</div>
        <div className="fiche-tete" style={{ gridTemplateColumns: '1fr 86px 40px' }}>
          <span>poste</span><span style={{ textAlign: 'right' }}>par mois</span><span style={{ textAlign: 'right' }}>part</span>
        </div>
        {r.parPoste.map((p) => (
          <div key={p.categorie} className="fiche-rangee" style={{ gridTemplateColumns: '1fr 86px 40px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.emoji} {p.nom}</div>
              <div className="doux mini">{fcfp(p.total)} · {p.nb} fois</div>
            </div>
            <span className="chiffre mini" style={{ textAlign: 'right' }}>{fcfp(Math.round(p.total / r.nbMois))}</span>
            <span className="mini" style={{ textAlign: 'right' }}>{pct(p.total)}</span>
            <div className="fiche-progression" style={{ gridColumn: '1 / -1', height: 6 }}>
              <i style={{ width: `${Math.max(2, Math.round((100 * p.total) / maxPoste))}%`, background: p.essentiel ? 'var(--fiche-sauge)' : 'var(--fiche-rose)' }} />
            </div>
          </div>
        ))}
        <div className="doux mini" style={{ marginTop: 8 }}>
          <span style={{ color: 'var(--fiche-sauge)' }}>■</span> l'essentiel — crédit, factures, courses, santé ·{' '}
          <span style={{ color: 'var(--fiche-rose)' }}>■</span> le reste
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
          <Carte titre="L'essentiel" valeur={r.essentiel} sous={pct(r.essentiel)} fond="var(--fiche-sauge-pale)" />
          <Carte titre="Plaisirs" valeur={r.plaisirs} sous={pct(r.plaisirs)} fond="var(--fiche-papier)" />
          <Carte titre="Virements" valeur={r.virements} sous={pct(r.virements)} fond="var(--fiche-papier)" />
        </div>
      </div>

      {/* ---------- 3. les virements ---------- */}
      {r.beneficiaires.length > 0 && (
        <div className="fiche-bloc">
          <div className="fiche-bloc-titre"><span className="fiche-numero">3</span> Les virements : à qui</div>
          <div className="doux mini" style={{ margin: '0 0 6px' }}>
            Ceux vers vos propres comptes sont de l'épargne : rangez-les dans « Vers le compte en euros » ou corrigez-les depuis la liste.
          </div>
          {r.beneficiaires.map((b) => (
            <div key={b.nom} className="fiche-rangee" style={{ gridTemplateColumns: '1fr 30px 96px' }}>
              <span style={{ fontWeight: 600, fontSize: 14, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.nom}</span>
              <span className="mini" style={{ textAlign: 'right' }}>{b.nb}×</span>
              <span className="chiffre mini" style={{ textAlign: 'right' }}>{fcfp(b.total)}</span>
            </div>
          ))}
        </div>
      )}

      {/* ---------- 4. les enseignes ---------- */}
      <div className="fiche-bloc sauge">
        <div className="fiche-bloc-titre"><span className="fiche-numero">4</span> Les enseignes qui reviennent</div>
        {r.enseignes.map((e) => (
          <div key={e.nom} className="fiche-rangee" style={{ gridTemplateColumns: '1fr 96px' }}>
            <span style={{ fontWeight: 600, fontSize: 14, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nom}</span>
            <span className="chiffre mini" style={{ textAlign: 'right' }}>{fcfp(e.total)}</span>
          </div>
        ))}
      </div>

      {/* ---------- 5. ce que je remarque ---------- */}
      <div className="fiche-bloc">
        <div className="fiche-bloc-titre"><span className="fiche-numero">5</span> Ce que je remarque</div>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, fontSize: 14 }}>
          {remarques.map((t) => (
            <li key={t} style={{ margin: '6px 0' }}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="fiche-astuce">
        <span style={{ fontSize: 30 }} aria-hidden="true">🐷</span>
        <div>Un budget ne sert pas à se priver, mais à choisir ce qui compte vraiment. Ces chiffres sont là pour ça — pas pour juger.</div>
      </div>

      <button type="button" className="fiche-sticker" style={{ width: '100%', justifyContent: 'center', padding: 10 }} onClick={() => ouvrir({ nom: 'importer-banque' })}>
        📥 Importer un nouveau relevé de la banque
      </button>
    </div>
  )
}

function Carte({ titre, valeur, sous, fond, couleur }: { titre: string; valeur: number; sous: string; fond: string; couleur?: string }) {
  return (
    <div style={{ background: fond, border: '1.5px solid var(--fiche-trait)', borderRadius: 12, padding: '8px 8px', textAlign: 'left' }}>
      <div className="etiquette" style={{ marginBottom: 0 }}>{titre}</div>
      <div className="chiffre" style={{ fontSize: 15, color: couleur }}>{fcfp(valeur)}</div>
      <div className="doux mini">{sous}</div>
    </div>
  )
}
