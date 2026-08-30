/* Le suivi d'une sortie au GPS.

   Le téléphone donne une position toutes les quelques secondes, avec sa
   précision. On additionne les distances entre deux points — en jetant ceux
   qui sont trop imprécis, et les micro-écarts qui ne sont que du bruit :
   sans ce filtre, un téléphone posé sur une table « parcourt » deux
   kilomètres dans la journée. */

import { useCallback, useEffect, useRef, useState } from 'react'

export type Point = { lat: number; lon: number; t: number }

/** Distance entre deux points du globe, en mètres (formule de haversine). */
export function distanceMetres(a: Point, b: Point): number {
  const R = 6_371_000
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

/** Au-delà de cette imprécision, le point ne vaut rien. */
const PRECISION_MAX = 30
/** En dessous de ce déplacement, c'est du bruit, pas un pas. */
const PAS_MINIMUM = 6

export function useSuiviGps() {
  const [actif, setActif] = useState(false)
  const [metres, setMetres] = useState(0)
  const [precision, setPrecision] = useState<number | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const dernier = useRef<Point | null>(null)
  const veille = useRef<number | null>(null)

  const supporte = typeof navigator !== 'undefined' && 'geolocation' in navigator

  const arreter = useCallback(() => {
    if (veille.current !== null) {
      navigator.geolocation.clearWatch(veille.current)
      veille.current = null
    }
    setActif(false)
  }, [])

  const demarrer = useCallback(() => {
    if (!supporte) {
      setErreur("Ce téléphone ne donne pas sa position à l'application.")
      return
    }
    setErreur(null)
    dernier.current = null
    veille.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setPrecision(Math.round(accuracy))
        if (accuracy > PRECISION_MAX) return
        const point: Point = { lat: latitude, lon: longitude, t: position.timestamp }
        if (dernier.current) {
          const ecart = distanceMetres(dernier.current, point)
          if (ecart >= PAS_MINIMUM) {
            setMetres((total) => total + ecart)
            dernier.current = point
          }
        } else {
          dernier.current = point
        }
      },
      (probleme) => {
        setErreur(
          probleme.code === probleme.PERMISSION_DENIED
            ? "La position est refusée. Il faut l'autoriser dans les réglages du navigateur."
            : 'Le signal GPS ne passe pas. Sous les arbres ou en intérieur, ça arrive.',
        )
        arreter()
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    )
    setActif(true)
  }, [supporte, arreter])

  const remettreAZero = useCallback(() => {
    setMetres(0)
    dernier.current = null
  }, [])

  // Si l'écran est quitté, on coupe la veille : sinon la batterie y passe.
  useEffect(() => arreter, [arreter])

  return { supporte, actif, distanceKm: metres / 1000, precision, erreur, demarrer, arreter, remettreAZero }
}
