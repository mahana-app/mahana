# Où on en est

*Dernière mise à jour : dimanche 14 septembre 2026.*

## Ce qui est fait

- **La base Supabase est montée.** Organisation **Maison**, projet
  **Sweet Home**, région Sydney. Les neuf tables sont là et verrouillées.
- **L'app est en ligne sur Vercel**, à l'adresse `sweet-home.vercel.app`.
  Netlify est abandonné (reconstructions suspendues faute de crédits) ; le
  site `sweet-home-mahina.netlify.app` peut être supprimé quand on y pensera.
- **L'entrée se fait avec un seul code**, le même pour toute la maison, suivi
  d'une question « qui es-tu ? » posée une fois par téléphone.
- **Chaque facture peut porter sa photo ou son PDF**, et le relevé annuel du
  fournisseur s'importe d'un coup depuis l'écran des charges.

## Ce qui reste à faire, tout de suite

**Créer le compte de la maison dans Supabase.** Sans lui, le code ne peut
ouvrir aucune porte.

Authentication → Users → Add user → **Create new user** :

| | |
|---|---|
| Email | `maison@sweet-home.pf` — **exactement celle-là**, elle est écrite dans l'app |
| Password | le code choisi, six caractères minimum |
| Auto Confirm User | **coché** |

**Recoller `supabase/schema.sql` en entier** dans l'éditeur SQL : il crée la
table des pièces jointes et le panier `factures` de la réserve, sans quoi
l'ajout d'une photo de facture échouera.

L'ancien compte `maifanoyolande@gmail.com` ne sert plus : on peut le
supprimer ou le laisser dormir, l'app ne s'en sert pas.

## Ensuite

1. Réinstaller le raccourci sur le téléphone (l'ancien garde le nom et l'icône
   de Mahana, figés au jour de l'installation) : appui long → Désinstaller,
   puis Chrome → `sweet-home.vercel.app` → menu ⋮ → Installer l'application.
2. Donner le code aux trois autres.
3. Importer le relevé EDT de l'année (Charges → *Importer un relevé du
   fournisseur*) : les douze factures de 2026 entrent d'un coup.
4. Renseigner la maisonnée dans l'app : les prénoms, la part de chaque foyer
   dans les charges, ce que chacun verse dans la caisse.

## Ce qui n'est pas encore construit

- **La maison face au temps** — El Niño, cyclone, tsunami : qui fait quoi
  physiquement, le kit d'urgence, les numéros.
- **Les enfants** — Manahiti, Mia et Eva : qui récupère qui, les horaires, le
  relais quand quelqu'un ne peut pas.
- **Les sorties et les voyages** — Moorea, camping, montagne, restaurant.
- **Les idées** — chacun propose, tout le monde vote.

Et deux choses à demander à Maru : le prénom de la sœur de Will, et si son
fils s'appelle bien Manahiti lui aussi (pour le distinguer de son beau-frère
dans l'app).
