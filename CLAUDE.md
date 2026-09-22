# Sweet Home — consignes de travail

**Sweet Home** est le nom affiché ; le dossier et le paquet s'appellent encore
`fare` (« la maison » en tahitien), nom du projet avant que Maru choisisse
celui de l'écran. Ce n'est qu'un nom de dossier, rien à corriger.

Application de la maison de Mahina, partagée par les deux foyers qui y vivent :
les **LAI AH CHE** (Maru, Will) et les **LENOIR** (la sœur de Will, Manahiti
Lenoir, et leurs filles Mia et Eva). React + TypeScript + Vite (PWA), base
PostgreSQL sur Supabase décrite par `supabase/schema.sql`.

**Cette application n'a rien à voir avec Sodi's App**, l'application RH de la
roulotte — dépôt différent, base différente, équipe différente. Le seul point
de contact est l'ardoise : ce que la maison prend à manger à la roulotte et lui
rembourse. Cette ardoise vit **ici**, pas dans la base de la roulotte.

Elle a remplacé *Mahana* (suivi de poids) à la même adresse, sur demande de
Maru. L'ancienne app reste dans l'historique du dépôt — ne pas la ressusciter
sans qu'elle le demande.

## Les règles

- **Tout est en français** — composants, fonctions, variables, colonnes SQL,
  commentaires. L'utilisatrice est non-technique et lit le code.
- Les commentaires expliquent **la règle de la maison**, pas la syntaxe :
  pourquoi un foyer avance une facture et l'autre lui rend sa part, pas ce que
  fait la ligne.
- **Les montants sont des entiers en francs Pacifique.** Jamais de centimes, le
  F CFP n'en a pas. Un arrondi à la virgule finirait par créer des écarts que
  personne ne saurait expliquer.
- **Mobile d'abord** : tout se consulte sur un téléphone, à une main, pouce en
  bas de l'écran.
- **Aucune couleur en dur**, nulle part : tout passe par une variable de
  `src/theme.css`. Le contrôle :

  ```bash
  grep -rn "#[0-9a-fA-F]\{3,6\}" src --include=*.ts --include=*.tsx
  ```

## Trois pièges déjà payés

**1. Un nom de classe qui en écrase un autre.** `.feuille` est la fiche qui
monte du bas : `position: fixed; z-index: 31`. Une pastille écrite
`class="pilule feuille"` héritait des deux et se retrouvait collée en bas de
l'écran, par-dessus les onglets — invisible à la lecture du code, trouvée par
le navigateur. Un mot qui sert déjà à une **disposition** ne peut pas servir de
**variante de couleur**. Les variantes de pastille sont `lagon`, `corail`,
`vert`, `ocre`.

**2. Les parts d'une facture sont figées à la saisie.** Elles ne sont jamais
recalculées depuis les parts courantes de la maison. Sinon, changer la
répartition en janvier ferait bouger les comptes de décembre, déjà soldés.

**3. Un écran qui ne peut pas lire ne doit jamais afficher une liste vide.**
Une liste vide se lit comme « il n'y a rien », et on cherche des jours au
mauvais endroit. Le message de la base remonte tel quel, dans le bandeau rouge
(`BandeauErreur`). Ne jamais le remplacer par un texte qui croit savoir.

## Où vit quoi

**La base ne fait que garder des lignes.** Tous les calculs — le partage d'une
facture, le solde entre foyers, l'état de la caisse, le dû à la roulotte — sont
en TypeScript dans `src/lib/argent.ts`. Une règle écrite à un seul endroit ne
peut pas se contredire elle-même, et c'est ce qui permet d'avoir deux rangements
(serveur et mode essai) sans écrire deux fois la même règle.

`src/lib/base.ts` expose trois gestes seulement — ajouter, modifier, supprimer
une ligne — et deux implémentations :

- **`baseSupabase`** quand `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont
  présentes : les données sont partagées entre les téléphones.
- **`baseLocale`** sinon : tout reste dans le navigateur, et l'app l'annonce
  avec le bandeau « mode essai ». C'est ce qui permet de la mettre à l'épreuve
  écran par écran, dans un vrai navigateur, sans serveur.

Les identifiants sont fabriqués par l'app (`nouvelId()`), pas par la base :
l'écran peut ainsi afficher une ligne tout de suite et l'envoyer ensuite, ce
qui reste fluide avec une mauvaise 4G.

La conversion des noms de colonnes est mécanique : `foyerId` ⇄ `foyer_id`.
Ne pas tenir de liste à la main, on oublierait de la compléter.

## Écrire dans `supabase/schema.sql`

Ce fichier se recolle **en entier** dans l'éditeur SQL de Supabase, à la main,
à chaque mise à jour. Il doit pouvoir être rejoué indéfiniment sans échouer —
et quand il échoue, ça ne se voit pas : Supabase s'arrête à la ligne fautive et
tout ce qui suit n'arrive jamais dans la base.

```bash
./supabase/verifier_schema.sh
```

Le script monte une base PostgreSQL jetable et applique le schéma **trois
fois**. Le passage 1 ne prouve rien (base vierge) ; ce sont les passages 2 et 3
qui attrapent les bugs. **Aucun changement de schéma ne part sans ce script au
vert.**

Ce qui est propre à Supabase (le rôle `authenticated`, le schéma `storage`)
doit être **gardé** — par un `if exists (select 1 from pg_roles …)`, ou par un
`if to_regclass('storage.buckets') is null then return; end if;` — sinon le
script de vérification, qui tourne sur un PostgreSQL ordinaire, échoue à tort.

## La roulotte partage les charges, et rien d'autre

Ils sont **trois** à se partager les factures de la maison : LA ROULOTTE la
moitié, chaque famille un quart. La roulotte est l'entreprise, à la même
adresse — elle consomme sa part d'électricité et d'eau.

Mais elle **ne vit pas ici** : pas de courses en commun, pas d'ardoise, pas de
personnes. Le drapeau `Foyer.estUneEntreprise` la tient hors de ces écrans, et
`foyersFamille(maison)` est à utiliser partout où il est question de vivre ici
(caisse, ardoise, « qui es-tu ? »). Les charges, elles, prennent
`maison.foyers` en entier.

Conséquence à ne pas oublier : **un écran qui suppose deux participants est
faux**. Quand un seul avance la facture, DEUX lui doivent — c'est ce qui a fait
réécrire `QuiDoitQuoi`, qui nommait un débiteur et un seul.

## Les fichiers des factures

Les photos et PDF des factures ne vivent pas dans la base mais dans la réserve
(Storage), panier `factures`, qui **n'est pas public** : `src/lib/fichiers.ts`
demande une adresse signée valable une heure à chaque ouverture. Une facture
porte le nom, l'adresse et le numéro de contrat de la maison ; une adresse
publique et permanente, une fois partagée par erreur, ne se reprend pas.

Comme pour les données, il existe une deuxième version qui garde tout dans le
navigateur (IndexedDB) : elle sert au mode essai, et surtout à mettre les
écrans à l'épreuve dans un vrai navigateur sans dépendre d'un serveur.

Supprimer une facture ou une pièce **retire aussi le fichier**. Sans ça la
réserve se remplit de factures que plus rien ne désigne, et personne ne saura
les retrouver.

## Le calendrier des déchets

Le calendrier de ramassage de la commune est une **donnée**, rangée dans les
réglages (`reglages.dechets`), avec celui du 2ᵉ semestre 2026 comme point de
départ dans `src/lib/dechets.ts`. Il s'édite depuis l'écran. Ne pas le figer
dans le code : la commune en publie un nouveau tous les six mois, et Maru ne
doit pas dépendre de nous pour l'entrer.

Et une honnêteté à garder : la commune décale ses tournées les semaines de
jours fériés. L'écran le dit, avec le numéro du Centre technique. Une date
affichée sans réserve serait une promesse qu'on ne tient pas.

## Importer un relevé de fournisseur

`src/lib/releve.ts` lit le CSV qu'on télécharge chez EDT. Deux règles :

- Les colonnes se cherchent **par leur intitulé**, jamais par leur position :
  le séparateur, l'ordre et l'écriture des dates changent d'un fournisseur à
  l'autre, et parfois d'une année à l'autre chez le même.
- Une facture entrée porte le **numéro du fournisseur** (`Charge.reference`).
  C'est lui qui empêche d'importer deux fois le même relevé — le fichier
  contient toute l'année et sera repris chaque mois.

Et une règle d'écran : on montre ce qu'on a compris **avant** d'écrire quoi que
ce soit. Un import qui se fait tout seul et se trompe coûte plus cher que la
saisie à la main.

Le même écran range les **PDF** des factures : `src/lib/pdf.ts` y cherche le
numéro du fournisseur et l'app le rapproche de `Charge.reference`. Deux pièges
déjà payés, à ne pas réintroduire :

- `new Response(flux).arrayBuffer()` sur un `DecompressionStream` échoue ici
  sans rien dire, et le PDF passe pour illisible. Lire le flux au `getReader()`.
- Le saut de ligne qui précède `endstream` ne fait pas partie des données :
  le laisser fait échouer la décompression sur « junk found after end of
  compressed data ».

## L'entrée : un code, puis une politesse

**Le code de la maison est le mot de passe d'un compte Supabase unique**
(`COMPTE_MAISON` dans `src/ecrans/Connexion.tsx`). L'adresse de ce compte est
dans le code, jamais tapée par personne. Ne pas remplacer ce mécanisme par un
code vérifié dans l'application : ce serait une porte peinte sur un mur.

Quatre comptes séparés étaient plus corrects et ont été essayés. Ils ont été
abandonnés pour une raison qui n'est pas technique : quatre mots de passe à
retenir et à redistribuer dans une famille, ça ne tient pas une semaine. Un
système parfait dont on se détourne protège moins qu'un système simple qu'on
utilise.

**« Qui es-tu ? » n'est pas une sécurité** et ne doit jamais le devenir. La
réponse vit dans le `localStorage` de chaque téléphone (`src/lib/moi.ts`), se
change d'une touche, et ne sert qu'au confort : dire bonjour par le prénom,
cocher d'avance qui a fait les courses. Ne rien y accrocher qui demande de la
confiance.

## Deux réglages par personne, deux questions distinctes

Ne jamais les reconfondre — l'app le faisait au début, et c'était faux :

- **`aUnTelephone`** : cette personne se sert-elle de l'app ? Décide de qui
  apparaît dans « qui es-tu ? » et dans les listes « qui y est allé ». Eva a
  quatre ans : non. Mia et Manahiti sont des ados : oui.
- **`role`** (`adulte` | `enfant`) : voit-elle toute la maison, ou seulement
  l'écran de la roulotte (`src/ecrans/Enfant.tsx`) ? Servira aussi au module
  des écoles et des activités.

L'écran des ados est une **convenance, pas une serrure** : le code est commun,
on peut répondre « Maru » à la question. Ne pas l'écrire comme s'il protégeait
quelque chose, et ne rien y accrocher qui demande de la confiance.

## La sécurité, en une phrase

La clé « anon » est dans la page : ce n'est pas un secret. Ce qui protège les
comptes des deux familles, c'est la politique du schéma — **il faut un compte
pour lire ou écrire quoi que ce soit**. Ne jamais ouvrir une table au rôle
`anon`, quelle que soit la raison.

## Avant de pousser

```bash
npm run build                   # tsc -b && vite build — doit passer
npm run lint                    # oxlint
./supabase/verifier_schema.sh   # si le schéma a bougé
```

`noUnusedLocals` est actif : un import qui traîne fait échouer le build.

Et vérifier dans un vrai navigateur. C'est comme ça qu'on a trouvé la collision
de classes ci-dessus, que ni le compilateur ni le linter ne pouvaient voir.

Messages de commit en français, à l'indicatif, décrivant l'effet pour la maison
plutôt que le détail technique.
