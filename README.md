# Sweet Home · la maison

L'application de la maison, pour les deux foyers qui y vivent : les **LAI AH
CHE** et les **LENOIR**. Les charges, la caisse commune des courses, et ce
qu'on doit à la roulotte.

Elle a remplacé *Mahana* (le suivi de poids) à la même adresse. L'ancienne app
n'est pas perdue : elle reste dans l'historique du dépôt, jusqu'au commit
« Mes recettes et mes séances, écrites par moi ».

*Le dossier et le paquet s'appellent encore `fare` — « la maison » en tahitien,
le nom du projet avant que Maru choisisse celui affiché sur l'écran. Rien à
corriger : ce n'est qu'un nom de dossier.*

## Les quatre onglets

| | |
|---|---|
| **Maison** | Tout d'un coup d'œil : qui doit quoi entre les foyers, ce qu'il reste dans la caisse, ce qu'on doit à la roulotte, et les factures en attente. |
| **Charges** | Électricité, eau, internet, impôts, déchets. Mois par mois. |
| **Caisse** | Les cotisations de chaque foyer et les courses achetées en gros. |
| **Roulotte** | Ce que chaque foyer a pris à manger, à rembourser en fin de mois. |

Le **+** au milieu note n'importe laquelle de ces quatre choses sans avoir à
chercher le bon écran.

## Les charges : payer et rembourser sont deux choses différentes

### Trois participants, pas deux

Les charges de la maison se partagent à trois : **LA ROULOTTE la moitié**, et
**chaque famille un quart**. La roulotte n'est pas un foyer — c'est
l'entreprise, installée à la même adresse, qui consomme sa part d'électricité
et d'eau. Elle partage donc les factures, mais elle ne fait pas les courses en
commun et ne prend rien à sa propre ardoise : elle n'apparaît ni dans la
caisse, ni dans l'ardoise, ni dans « qui est-ce ? ».

C'est le drapeau `estUneEntreprise` sur le foyer qui la tient hors de ces
écrans-là, et `foyersFamille(maison)` qui sert partout où il est question de
vivre ici. Les pourcentages se changent dans les réglages ; les factures déjà
saisies gardent le partage qu'elles avaient.

### L'électricité ne se partage pas comme les impôts

Ce sont les frigos et les congélateurs de la roulotte qui tournent jour et
nuit : sur l'électricité, **la roulotte paie deux tiers**, et le tiers restant
se partage en deux. Les autres charges suivent le partage habituel.

Ça se règle dans la maisonnée, *Un partage à part pour certaines charges* :
chaque nature peut avoir ses propres pour cent, ou rester « habituel ». Les
pour cent sont ramenés à leur total, donc 67 / 17 / 17 partage aussi bien que
66,7 / 16,7 / 16,7 — et le franc en trop va au dernier de la liste.

### Corriger une facture

Une faute de frappe sur le montant, un mauvais mois, la mauvaise nature : la
facture se corrige sur place (*Corriger la facture*, en bas de son écran).
Supprimer pour ressaisir ferait perdre les remboursements déjà notés et la
photo.

Si le montant change, **les parts suivent dans les mêmes proportions** : une
part corrigée à la main le reste, et une facture partagée à deux avant
l'arrivée de la roulotte reste partagée à deux. Si quelqu'un avait déjà rendu
plus que sa nouvelle part, l'écran le dit avant d'enregistrer.

Quand une facture n'est pas partagée comme le réglage du jour le voudrait
(entrée avant les deux tiers de la roulotte, par exemple), la carte le signale
d'elle-même et propose **« Repartager selon le réglage d'aujourd'hui »**. Les
parts figées ne bougent que par ce geste-là, jamais toutes seules.

C'est la règle qui a façonné cet écran. À la maison, c'est presque toujours
**un seul foyer qui règle le fournisseur**, et l'autre lui rend sa part
ensuite. L'app suit donc les deux séparément :

1. La facture est saisie : 24 600 F d'électricité pour septembre. Le partage
   est proposé d'après les parts de la maison et se corrige à la main quand
   cette facture-là se partage autrement.
2. Quelqu'un paie le fournisseur : on note **qui a avancé**.
3. L'autre foyer rend sa part — en une fois, ou en plusieurs.

Une facture n'est **soldée** que quand les deux sont faits. Une facture payée
dont la part n'a pas été rendue reste en attente : c'est exactement là que les
oublis arrivent.

Les parts sont **figées au moment de la saisie**. Changer la répartition de la
maison en janvier ne touche pas aux factures de décembre — sinon des comptes
déjà soldés se remettraient à bouger tout seuls.

### La facture en image

Chaque facture peut porter sa **photo ou son PDF** — à la saisie, pendant
qu'elle est encore dans la main, ou plus tard depuis l'écran de la facture. Une facture d'électricité
se règle entre les deux foyers des semaines après son arrivée, et le papier,
lui, s'égare : quand quelqu'un demande « c'est quoi ce montant ? », la réponse
doit être dans l'app. La liste des factures porte un petit repère 📄 sur celles
qui ont leur papier.

Les fichiers ne sont **jamais publics**. L'app demande à Supabase une adresse
valable une heure à chaque ouverture — une facture porte le nom, l'adresse et
le numéro de contrat de la maison, et une adresse publique et permanente, une
fois partagée par erreur, ne se reprend pas. Les photos sont réduites à
1400 pixels avant l'envoi : un téléphone sort 4 Mo là où 400 ko suffisent à
relire un montant, et la réserve gratuite fait un gigaoctet.

### Importer une année d'un coup

EDT met à disposition, dans l'espace client, un fichier qui liste **toutes les
factures de l'année** avec leur date et leur montant. Le bouton *Importer un
relevé du fournisseur*, en bas de l'écran des charges, le lit et en fait des
factures.

Deux précautions tiennent cet écran :

- **On montre ce qu'on a compris avant d'écrire quoi que ce soit.** Un import
  qui se fait tout seul et se trompe coûte plus cher que la saisie à la main.
- **Une facture déjà entrée est reconnue** par son numéro chez le fournisseur
  (`F202609010958`) et laissée de côté. Le même fichier peut donc être repris
  chaque mois sans jamais créer de doublon.

Une case, cochée par défaut, dit que ces vieilles factures sont **déjà
remboursées entre les deux foyers** : les entrer sans le dire ferait
apparaître une dette qui n'existe pas, et c'est le genre de chiffre faux qu'on
ne remarque qu'après une dispute.

Le fichier n'a pas besoin d'être celui d'EDT : les colonnes sont cherchées par
leur intitulé, pas par leur position, et les deux écritures de date
(`2026-09-07` et `07/09/2026`) sont comprises.

### Les PDF se rangent tout seuls

Le même écran accepte **les PDF des factures**, autant qu'on veut d'un coup.
Chaque facture d'EDT porte son numéro (`F202608005989`) — le même que celui du
relevé — et l'app le lit dans le PDF pour aller la ranger sur **sa** facture.
Ouvrir douze fois le bon écran, c'est douze occasions de se tromper.

Un PDF dont le numéro ne correspond à rien est signalé « sans facture » : c'est
qu'elle n'a pas encore été entrée. Un scan sans texte est signalé « illisible »
et se joint alors à la main, depuis la facture.

Aucune bibliothèque pour lire les PDF : un PDF, c'est des morceaux compressés à
la zlib, et le navigateur sait les décompresser (`DecompressionStream`). On ne
cherche pas à comprendre la page, juste à y trouver un numéro.

## Les déchets verts et les encombrants

La commune de Mahina passe **une semaine par mois**, et un seul jour dans cette
semaine selon le quartier. Le calendrier papier finit sur le frigo puis à la
poubelle, et on rate le passage — qui ne revient que le mois suivant.

Secteur **Pointe-Vénus**, l'ordre de ramassage dans la semaine :

| | quartiers | jour |
|---|---|---|
| **P1** | Fond de la Pointe Vénus jusqu'au cimetière catholique, Taputuarai 1 & 2, Bontan, Auguste, Coulon, Helme | lundi |
| **P2** | Titine, Paofai, Aumeran | mardi |
| **P3** | Raveino, quartier Tafai jusqu'à la Socredo | mercredi |
| **P4** | Route du stade et bords de route | jeudi |

On choisit sa tournée une fois. L'accueil affiche ensuite le prochain passage,
et **passe au corail cinq jours avant** — les déchets peuvent être déposés le
week-end précédent, c'est le seul moment où toute la maison est là pour porter
un canapé.

Le calendrier est une **donnée, pas du code** : celui du 2ᵉ semestre 2026 est
le point de départ, et les semaines s'ajoutent ou se retirent depuis l'écran.
Quand la commune publiera celui de 2027, personne n'aura besoin de toucher au
code.

L'écran rappelle aussi ce qui est ramassé, ce qui ne l'est pas (le verre, les
batteries, la peinture, les gravats) et le numéro du Centre technique. Et il
dit ce que la commune écrit elle-même : **les semaines de jours fériés, les
tournées sont décalées** et l'annonce passe sur la page Facebook de la commune.
Mieux vaut le dire que laisser croire à une date sûre.

## Nos dépenses : ce que l'autre famille ne voit pas

Chaque famille note ses propres dépenses — les téléphones, les sorties, les
courses perso, l'essence, l'école — et **l'autre famille ne les voit pas**.
Sur l'accueil, carte *Nos dépenses* ; dans le +, *Une dépense de la famille*.

Ce n'est pas l'écran qui les cache : c'est la base. La table `depenses_perso`
n'a pas la politique « la maisonnée » des autres tables, mais « chaque famille
la sienne » : elle ne rend à un compte que les lignes de son foyer, et refuse
d'en écrire pour un autre. Un écran qui filtrerait, n'importe qui l'aurait
contourné en répondant « Mana » à « qui es-tu ? ».

Pour que la base sache qui frappe, il a fallu **un compte par famille** au lieu
du compte unique : `lai-ah-che@sweet-home.pf` et `lenoir@sweet-home.pf`, chacun
avec **son code à quatre chiffres**. Le code se tape dans le même champ
qu'avant, l'app essaie chaque compte — personne n'a à choisir sa famille dans
une liste. Supabase refuse un mot de passe de moins de six signes : l'app
complète le code en coulisses (`1234` devient `1234-fare`), et c'est ce mot de
passe complet qu'on donne au compte dans Supabase. L'ancien compte commun ouvre
encore tout ce qui est partagé, mais ne voit les dépenses de personne : il
n'est d'aucune famille.

## La caisse commune

Chacun fait ses courses de son côté, mais certaines choses s'achètent en gros
pour toute la maison : le poulet, la viande, les légumes, le riz, le lait, le
pain de mie. Chaque foyer verse une somme au début du mois, et c'est avec cet
argent-là qu'on achète.

Deux chiffres suffisent : **ce qui a été versé**, **ce qui a été dépensé**. La
différence, c'est ce qu'il reste. Si la caisse passe en négatif, l'app le dit
franchement : quelqu'un a payé de sa poche sans le noter.

Une cotisation *notée* et une cotisation *versée* ne sont pas la même chose —
l'app distingue les deux, sinon la caisse a l'air pleine alors qu'elle est vide.

## L'ardoise de la roulotte

Quand quelqu'un de la maison prend à manger à la roulotte, ce n'est pas un
cadeau : c'est du stock et de la caisse en moins pour l'entreprise. On le note
au moment où ça arrive — deux touches — et en fin de mois chaque foyer
rembourse son total.

Sans ça, la caisse de la roulotte ne tombe jamais juste et personne ne sait
dire pourquoi.

## Mode essai, et mode partagé

L'application n'a de sens que **partagée** : quand Maru note la facture
d'électricité, il faut que Manahiti la voie sur son téléphone. Les données sont
donc sur un serveur, contrairement à Mahana qui ne quittait jamais le téléphone.

Tant que le serveur n'est pas branché, l'app tourne en **mode essai** : tout
reste dans le navigateur, personne d'autre ne voit rien, et un bandeau le dit
en haut de l'écran. C'est fait pour regarder à quoi ça ressemble avant de
monter quoi que ce soit.

### Un seul code pour toute la maison

Quatre comptes avec quatre mots de passe, c'était la bonne façon de faire sur
le papier — et la mauvaise dans cette maison : personne ne les aurait retenus,
et Maru serait devenue le service d'assistance de sa propre famille. Un code
partagé qu'on se dit une fois vaut mieux qu'un système parfait dont tout le
monde se détourne.

Techniquement, la maison a **un seul compte** chez Supabase. Son adresse est
écrite dans l'app (`COMPTE_MAISON`, dans `src/ecrans/Connexion.tsx`) et
personne n'a à la connaître ; le code que l'on tape à l'entrée est le **mot de
passe** de ce compte. La serrure est donc exactement celle d'un vrai compte —
c'est seulement la clé qui est partagée, comme celle de la porte d'entrée.

Pour créer ou changer le code : Supabase → **Authentication → Users**, sur le
compte `maison@sweet-home.pf`. Six caractères minimum.

### Et une fois entré, « qui es-tu ? »

Posée une seule fois, à la première ouverture, la réponse reste dans ce
téléphone-là. **Ce n'est pas une sécurité** — le code a déjà fait ce travail.
C'est ce qui permet à l'app de dire bonjour par le prénom, et de cocher
d'avance qui est allé faire les courses ou chercher à manger à la roulotte.

Ça se change dans **Maisonnée → Ce téléphone → Ce n'est pas moi**.

### Les ados n'ont qu'un écran

Mia et Manahiti prennent à manger à la roulotte comme tout le monde, et c'est
à eux de le noter — personne d'autre ne sait ce qu'ils ont pris. Mais les
factures, les cotisations et les comptes entre les deux familles ne les
regardent pas.

Quand la personne identifiée sur ce téléphone est marquée **Enfant**, l'app
n'affiche donc **que** l'écran de la roulotte : deux champs, un bouton, et le
total de son mois. Pas d'onglets, pas de charges.

⚠️ **C'est une convenance, pas une serrure.** Le code de la maison est le même
pour tout le monde ; rien n'empêche de répondre « Maru » à la question « qui
es-tu ? ». Séparer pour de bon demanderait un code par personne — ce que la
maison a justement écarté. L'écran des ados range les choses, il ne les
verrouille pas.

Deux réglages, deux questions différentes, dans **Maisonnée** :

| Réglage | Ce qu'il décide |
|---|---|
| **A l'app / Sans app** | Apparaît-il dans « qui es-tu ? ». Eva a quatre ans : sans app. |
| **Adulte / Enfant** | Voit-il toute la maison, ou seulement l'écran de la roulotte. |

### Brancher le serveur

1. Sur [supabase.com](https://supabase.com), créer un projet — gratuit.
   **Un nouveau projet**, séparé de celui de la roulotte.
2. Ouvrir **SQL Editor**, coller **tout** le contenu de `supabase/schema.sql`,
   et lancer. Le fichier peut être recollé autant de fois qu'on veut.
3. Dans **Authentication → Users → Add user → Create new user**, créer
   **un seul** compte, celui de la maison :
   - adresse : `maison@sweet-home.pf` — **exactement celle-là**, elle est
     écrite dans l'app
   - mot de passe : le code de la maison, six caractères minimum
   - cocher **Auto Confirm User**, sinon personne ne pourra entrer

   Pas d'inscription depuis l'app, exprès : on n'ouvre pas les comptes de deux
   familles à qui tomberait sur l'adresse.
4. Dans **Project Settings → API**, relever l'**URL** et la clé **anon public**.
5. Sur Netlify (ou Vercel), ajouter deux variables d'environnement :

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

6. Redéployer. Le bandeau « mode essai » disparaît, l'app demande le mot de
   passe, et les deux foyers voient enfin la même chose.

La clé « anon » est dans la page : ce n'est **pas** un secret, et ce n'est pas
elle qui protège les données. La vraie barrière, c'est la politique du schéma :
il faut un compte pour lire ou écrire quoi que ce soit.

## Ce qui reste à faire

Maru en a demandé bien plus que ce qui est là. Dans l'ordre prévu :

- **La maison face au temps** — El Niño, cyclone, tsunami : qui fait quoi
  physiquement (les volets, l'eau, le groupe électrogène, la voiture), le kit
  d'urgence, les numéros. Préparé au calme, pas la veille.
- **Les enfants** — Manahiti, Mia et Eva : qui récupère qui et quel jour, les
  horaires, les activités, et le relais quand quelqu'un ne peut pas.
- **Les sorties et les voyages** — Moorea, camping, marche en montagne,
  restaurant : qui vient, qui apporte quoi, le budget, la liste des affaires.
- **Les idées** — chacun propose, tout le monde vote. Pour que rien ne se
  perde dans les conversations.

## Travailler dessus

```bash
npm install
npm run dev                     # le serveur de développement
npm run build                   # tsc -b && vite build — doit passer
npm run lint                    # oxlint
npm run icones                  # refabrique le logo et les icônes
./supabase/verifier_schema.sh   # le schéma se rejoue-t-il sans erreur ?
```

## Les fichiers

```
src/
  lib/
    types.ts          le modèle : foyers, membres, charges, caisse, ardoise
    base.ts           où vivent les données — serveur ou mode essai
    maison.tsx        l'état partagé par tous les écrans
    argent.ts         les francs, les mois, et tous les calculs
    fichiers.ts       les photos et PDF des factures — réserve ou navigateur
    releve.ts         lire le relevé de factures du fournisseur
    dechets.ts        le calendrier de ramassage de la commune
    pdf.ts            trouver le numéro de facture écrit dans un PDF
    comptes.ts        un compte Supabase par famille, et le code à 4 chiffres
    navigation.ts     les écrans qui s'ouvrent par-dessus les onglets
  composants/         en-tête, onglets, symboles, bandeaux
  ecrans/             un fichier par écran
  theme.css           toutes les couleurs, en variables
supabase/
  schema.sql          la base, à recoller en entier dans Supabase
  verifier_schema.sh  monte une base jetable et rejoue le schéma trois fois
outils/icones.mjs     fabrique le logo en PNG, sans dépendance
```
