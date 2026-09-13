/* Qui se sert de ce téléphone.

   La maison n'a qu'un seul code, partagé par les quatre adultes. C'est
   volontaire : quatre mots de passe à retenir et à redonner, personne ne
   l'aurait fait. Mais l'app gagne à savoir qui la tient — pour dire bonsoir
   par son prénom, et pour cocher d'avance qui est allé faire les courses.

   D'où cette question posée une seule fois, à la première ouverture, et dont
   la réponse reste dans ce téléphone-là. Elle n'est pas une sécurité : c'est
   une politesse. Le code, lui, est la serrure. */

const CLE = 'fare.moi'

export function lireMoi(): string | null {
  try {
    return localStorage.getItem(CLE)
  } catch {
    return null
  }
}

export function ecrireMoi(id: string | null): void {
  try {
    if (id) localStorage.setItem(CLE, id)
    else localStorage.removeItem(CLE)
  } catch {
    /* navigation privée : l'app marche, elle demandera à chaque fois */
  }
}

/** « Bonjour », « Bonsoir » — selon l'heure qu'il est vraiment ici. */
export function salutation(heure: number = new Date().getHours()): string {
  return heure >= 18 || heure < 5 ? 'Bonsoir' : 'Bonjour'
}
