/* La règle de l'IMC : quatre zones colorées et le curseur qui se place
   dessus. Un chiffre seul ne dit rien ; posé sur la règle, il parle. */

const ZONES = [
  { nom: 'Poids insuffisant', couleur: '#2f5a66', jusqua: 18.5 },
  { nom: 'Normal', couleur: '#4e5b3c', jusqua: 25 },
  { nom: 'Surpoids', couleur: '#c89a5b', jusqua: 30 },
  { nom: 'Obésité', couleur: '#c0603a', jusqua: 40 },
]

/* La règle s'arrête à 40 : au-delà, le curseur reste au bout. */
const MINI = 15
const MAXI = 40

export default function RegleImc({ valeur }: { valeur: number }) {
  const position = Math.min(100, Math.max(0, ((valeur - MINI) / (MAXI - MINI)) * 100))
  const zone = ZONES.find((z) => valeur < z.jusqua) ?? ZONES[3]

  return (
    <div>
      <div className="rangee" style={{ alignItems: 'baseline' }}>
        <div>
          <span className="chiffre" style={{ fontSize: 30 }}>
            {valeur.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
          <span className="doux" style={{ fontWeight: 700 }}> d'IMC</span>
        </div>
        <span
          className="pilule"
          style={{ background: `${zone.couleur}22`, color: zone.couleur, fontWeight: 800 }}
        >
          {zone.nom}
        </span>
      </div>

      <div style={{ position: 'relative', margin: '14px 0 10px' }}>
        <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden' }}>
          {ZONES.map((z, index) => {
            const debut = index === 0 ? MINI : ZONES[index - 1].jusqua
            return (
              <div
                key={z.nom}
                style={{ flex: z.jusqua - debut, background: z.couleur }}
                title={z.nom}
              />
            )
          })}
        </div>
        <div
          style={{
            position: 'absolute',
            top: -4,
            left: `${position}%`,
            transform: 'translateX(-50%)',
            width: 20,
            height: 20,
            borderRadius: 999,
            background: '#fff',
            border: `3px solid ${zone.couleur}`,
            boxShadow: '0 2px 6px rgba(29,47,56,.2)',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {ZONES.map((z) => (
          <span key={z.nom} className="doux mini" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{ width: 8, height: 8, borderRadius: 999, background: z.couleur }}
            />
            {z.nom}
          </span>
        ))}
      </div>
    </div>
  )
}
