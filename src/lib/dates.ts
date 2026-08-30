/* Les dates, telles que l'app en a besoin.
   Tout est en heure locale du téléphone : à Tahiti comme ailleurs, une
   journée commence à minuit sur l'horloge de celle qui jeûne. */

/** La clé d'une journée : « 2026-08-27 ». Sert d'identifiant partout. */
export function clefJour(date: Date = new Date()): string {
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const jour = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mois}-${jour}`
}

export function deClefJour(clef: string): Date {
  const [annee, mois, jour] = clef.split('-').map(Number)
  return new Date(annee, mois - 1, jour)
}

export function ajouterJours(date: Date, nombre: number): Date {
  const copie = new Date(date)
  copie.setDate(copie.getDate() + nombre)
  return copie
}

/** « 18:30 » */
export function heureCourte(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/** « lun. 25 août » */
export function jourCourt(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** « aujourd'hui », « hier », sinon la date. */
export function jourRelatif(date: Date): string {
  const aujourdhui = clefJour()
  const clef = clefJour(date)
  if (clef === aujourdhui) return "aujourd'hui"
  if (clef === clefJour(ajouterJours(new Date(), -1))) return 'hier'
  return jourCourt(date)
}

/** Une durée en millisecondes, écrite « 13 h 42 » ou « 42 min ». */
export function duree(millisecondes: number): string {
  const minutes = Math.max(0, Math.floor(millisecondes / 60000))
  const heures = Math.floor(minutes / 60)
  if (heures === 0) return `${minutes} min`
  return `${heures} h ${String(minutes % 60).padStart(2, '0')}`
}

/** Le compte à rebours du minuteur : « 13:42:07 ». */
export function chrono(millisecondes: number): string {
  const total = Math.max(0, Math.floor(millisecondes / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

/** Pour les champs « heure » du formulaire de correction : « 18:30 ». */
export function versChampHeure(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/** L'inverse : applique « 18:30 » à une journée donnée. */
export function depuisChampHeure(jour: Date, valeur: string): Date {
  const [heures, minutes] = valeur.split(':').map(Number)
  const resultat = new Date(jour)
  resultat.setHours(heures || 0, minutes || 0, 0, 0)
  return resultat
}

/** Les sept derniers jours, du plus ancien à aujourd'hui. */
export function septDerniersJours(): Array<{ date: Date; clef: string }> {
  return Array.from({ length: 7 }, (_, i) => {
    const date = ajouterJours(new Date(), i - 6)
    return { date, clef: clefJour(date) }
  })
}

/** « lun. », « mar. »… la première lettre suffit sur les graphiques. */
export function initialeJour(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'narrow' }).toUpperCase()
}

/** Minutes écoulées entre deux heures « HH:MM », en passant minuit si besoin. */
export function minutesEntre(depart: string, arrivee: string): number {
  const [hd, md] = depart.split(':').map(Number)
  const [ha, ma] = arrivee.split(':').map(Number)
  let minutes = ha * 60 + ma - (hd * 60 + md)
  if (minutes <= 0) minutes += 24 * 60 // on a dormi en passant minuit
  return minutes
}

/** « 7 h 30 » à partir d'un nombre de minutes. */
export function heuresMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m} min`
  return `${h} h ${String(m).padStart(2, '0')}`
}
