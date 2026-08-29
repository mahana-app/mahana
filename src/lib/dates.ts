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
