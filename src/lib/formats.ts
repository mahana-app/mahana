/* Les nombres à la française : une virgule, pas un point. Un « 7.5 kg »
   au milieu d'une phrase en français, ça se voit tout de suite. */

export function nombreFr(valeur: number, decimales = 1): string {
  return valeur.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}
