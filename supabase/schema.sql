-- Fare — la base de la maison.
--
-- Ce fichier se recolle EN ENTIER dans l'éditeur SQL de Supabase, autant de
-- fois qu'on veut : il ne doit jamais échouer au deuxième passage. D'où les
-- « if not exists » et les « drop policy if exists » partout.
--
-- Vérification avant de pousser :   ./supabase/verifier_schema.sh
-- Le script monte une base jetable et applique ce fichier trois fois. Les
-- passages 2 et 3 sont les vrais juges.
--
-- Deux principes tenus ici :
--
--  * La base ne fait que garder des lignes. Tous les calculs — le partage
--    d'une facture, le solde entre foyers, l'état de la caisse — sont faits
--    en TypeScript dans l'application. Une règle écrite à un seul endroit ne
--    peut pas se contredire elle-même.
--
--  * Les identifiants sont fabriqués par l'application, pas par la base.
--    L'app peut ainsi afficher une ligne tout de suite et l'envoyer ensuite,
--    ce qui rend l'usage fluide même avec une mauvaise 4G.

-- =====================================================================
--  Qui vit ici
-- =====================================================================

create table if not exists public.foyers (
  id      text primary key,
  nom     text not null,
  couleur text not null default 'var(--lagon)',
  -- Sa part des charges communes, de 0 à 1. Les parts font 1 au total.
  part    numeric not null default 0.5,
  ordre   integer not null default 1
);

create table if not exists public.membres (
  id       text primary key,
  foyer_id text not null references public.foyers(id) on delete cascade,
  prenom   text not null,
  role     text not null default 'adulte',   -- 'adulte' ou 'enfant'
  code     text not null default '',
  actif    boolean not null default true
);

-- Se sert de l'app sur son propre téléphone. Ce n'est pas la même chose
-- qu'être adulte : Mia et Manahiti sont des ados qui notent eux-mêmes ce
-- qu'ils prennent à la roulotte, Eva a quatre ans et ne notera rien.
-- « add column if not exists » : la table existe peut-être déjà, et
-- « create table if not exists » ne sait pas lui ajouter une colonne.
alter table public.membres
  add column if not exists a_un_telephone boolean not null default true;

-- La roulotte n'est pas un foyer : c'est l'entreprise, installée à la même
-- adresse, qui paie sa part des charges de la maison. Elle partage donc les
-- factures — mais elle ne fait pas les courses en commun et ne prend rien à
-- sa propre ardoise. Ce drapeau la tient hors de ces écrans-là.
alter table public.foyers
  add column if not exists est_une_entreprise boolean not null default false;

create index if not exists membres_foyer on public.membres(foyer_id);

-- Les deux foyers de départ. « on conflict do nothing » : si Maru les a
-- renommés depuis l'application, ce fichier ne doit pas écraser son travail
-- au prochain collage.
insert into public.foyers (id, nom, couleur, part, ordre) values
  ('lai-ah-che', 'LAI AH CHE', 'var(--lagon)',  0.5, 1),
  ('lenoir',     'LENOIR',     'var(--corail)', 0.5, 2)
on conflict (id) do nothing;

-- Le registre des corrections qui ne doivent tourner qu'UNE fois.
--
-- Sans lui, un « update » posé ici réécraserait à chaque collage du fichier
-- ce que l'app a changé depuis. Une part des charges corrigée dans les
-- réglages reviendrait à sa valeur d'origine sans que personne comprenne.
create table if not exists public.deja_fait (
  cle text primary key,
  le  timestamptz not null default now()
);

do $roulotte$
begin
  if not exists (select 1 from public.deja_fait where cle = 'roulotte-sur-les-charges') then
    insert into public.foyers (id, nom, couleur, part, ordre, est_une_entreprise)
    values ('roulotte', 'LA ROULOTTE', 'var(--ocre)', 0.50, 3, true)
    on conflict (id) do nothing;

    -- Les charges de la maison se partagent à trois : la roulotte la moitié,
    -- chaque famille un quart. Une seule fois : la suite appartient à l'app.
    update public.foyers set part = 0.25 where id in ('lai-ah-che', 'lenoir');
    update public.foyers set part = 0.50, est_une_entreprise = true where id = 'roulotte';

    insert into public.deja_fait (cle) values ('roulotte-sur-les-charges');
  end if;
end
$roulotte$;


-- Les sept personnes de la maison, telles que Maru les a données.
--
-- « on conflict do nothing » : si un prénom ou un rôle a été corrigé depuis
-- l'application, recoller ce fichier ne doit surtout pas écraser la
-- correction. Tout se change d'une touche dans Maisonnée — et c'est la
-- colonne « a_un_telephone », pas l'âge, qui décide de qui apparaît dans la
-- question « qui es-tu ? ».
insert into public.membres (id, foyer_id, prenom, role, a_un_telephone) values
  ('maru',     'lai-ah-che', 'Maru',     'adulte', true),
  ('will',     'lai-ah-che', 'Will',     'adulte', true),
  ('manahiti', 'lai-ah-che', 'Manahiti', 'enfant', true),
  ('mana',     'lenoir',     'Mana',     'adulte', true),
  ('miti',     'lenoir',     'Miti',     'adulte', true),
  ('mia',      'lenoir',     'Mia',      'enfant', true),
  ('eva',      'lenoir',     'Eva',      'enfant', false)
on conflict (id) do nothing;

-- =====================================================================
--  Les charges de la maison
-- =====================================================================

create table if not exists public.charges (
  id           text primary key,
  nature       text not null,          -- electricite, eau, internet, impots, dechets, autre
  libelle      text not null default '',
  periode      text not null,          -- « 2026-09 »
  montant      integer not null,       -- en francs Pacifique, jamais de centimes
  -- Le foyer qui a réglé le fournisseur. C'est presque toujours un seul foyer
  -- qui avance la totalité, l'autre lui rend sa part ensuite.
  avancee_par  text references public.foyers(id) on delete set null,
  payee_le     date,
  note         text not null default '',
  creee_le     date not null default current_date
);

create index if not exists charges_periode on public.charges(periode);

-- Le numéro de la facture chez le fournisseur. Il sert à reconnaître une
-- facture déjà entrée : le relevé qu'on télécharge chez EDT contient toute
-- l'année, et on doit pouvoir le reprendre sans créer de doublons.
alter table public.charges
  add column if not exists reference text not null default '';

create index if not exists charges_reference on public.charges(reference);

-- La part d'un foyer dans une facture, FIGÉE au moment de la saisie.
-- Elle n'est jamais recalculée : si la répartition de la maison change en
-- janvier, les factures de décembre gardent l'ancienne, sinon des comptes
-- déjà soldés se remettraient à bouger tout seuls.
create table if not exists public.parts_charge (
  id        text primary key,
  charge_id text not null references public.charges(id) on delete cascade,
  foyer_id  text not null references public.foyers(id) on delete cascade,
  montant   integer not null
);

create index if not exists parts_charge_charge on public.parts_charge(charge_id);

-- Un remboursement d'un foyer vers celui qui a avancé la facture.
create table if not exists public.reglements (
  id        text primary key,
  charge_id text not null references public.charges(id) on delete cascade,
  foyer_id  text not null references public.foyers(id) on delete cascade,
  montant   integer not null,
  le        date not null default current_date,
  note      text not null default ''
);

create index if not exists reglements_charge on public.reglements(charge_id);

-- Les pièces jointes d'une facture : la photo ou le PDF reçu du fournisseur.
-- Seul le CHEMIN du fichier est ici ; le fichier lui-même vit dans la réserve
-- (Storage), dans le panier « factures » qui n'est pas public. Une facture
-- d'électricité porte le nom, l'adresse et le numéro de contrat de la maison :
-- elle ne doit pas être lisible par quelqu'un qui devinerait son adresse.
create table if not exists public.pieces_charge (
  id         text primary key,
  charge_id  text not null references public.charges(id) on delete cascade,
  chemin     text not null,
  nom        text not null default '',
  type       text not null default '',
  taille     integer not null default 0,
  ajoutee_le date not null default current_date
);

create index if not exists pieces_charge_charge on public.pieces_charge(charge_id);

-- =====================================================================
--  La caisse commune des courses
-- =====================================================================

create table if not exists public.cotisations (
  id        text primary key,
  foyer_id  text not null references public.foyers(id) on delete cascade,
  periode   text not null,             -- « 2026-09 »
  montant   integer not null,
  -- Vide tant que l'argent n'est pas réellement dans la caisse : une
  -- cotisation promise et une cotisation versée ne sont pas la même chose.
  versee_le date,
  note      text not null default ''
);

create index if not exists cotisations_periode on public.cotisations(periode);

create table if not exists public.achats (
  id            text primary key,
  le            date not null default current_date,
  libelle       text not null,
  montant       integer not null,
  categorie     text not null default 'autre',
  par_membre_id text references public.membres(id) on delete set null,
  note          text not null default ''
);

create index if not exists achats_le on public.achats(le);

-- =====================================================================
--  L'ardoise de la roulotte
-- =====================================================================

-- Ce qu'un foyer a pris à manger à la roulotte. Ce n'est pas un cadeau : le
-- total du mois lui est remboursé, sinon la caisse de l'entreprise ne tombe
-- jamais juste et personne ne sait dire pourquoi.
create table if not exists public.ardoise (
  id             text primary key,
  le             date not null default current_date,
  foyer_id       text not null references public.foyers(id) on delete cascade,
  par_membre_id  text references public.membres(id) on delete set null,
  libelle        text not null,
  montant        integer not null,
  remboursee_le  date
);

create index if not exists ardoise_le on public.ardoise(le);

-- =====================================================================
--  Les réglages
-- =====================================================================

create table if not exists public.reglages (
  cle    text primary key,
  valeur jsonb not null
);

-- L'électricité ne se partage pas comme les impôts : ce sont les frigos et
-- les congélateurs de la roulotte qui tournent jour et nuit. Deux tiers pour
-- elle, le tiers restant en deux. Des fractions et non des pourcentages :
-- 66,67 % trois fois ne font pas un tiers chacun, et sur une facture de
-- 92 046 F l'écart se voit. Une seule fois : ensuite c'est réglable dans l'app.
do $electricite$
begin
  if not exists (select 1 from public.deja_fait where cle = 'electricite-deux-tiers') then
    insert into public.reglages (cle, valeur)
    values ('parts_par_nature', jsonb_build_object(
      'electricite', jsonb_build_object(
        'roulotte',   2.0 / 3.0,
        'lai-ah-che', 1.0 / 6.0,
        'lenoir',     1.0 / 6.0)))
    on conflict (cle) do update set valeur = excluded.valeur;
    insert into public.deja_fait (cle) values ('electricite-deux-tiers');
  end if;
end
$electricite$;

-- =====================================================================
--  Qui a le droit de lire et d'écrire
-- =====================================================================
--
-- Une seule règle, la même pour toutes les tables : il faut être connecté.
-- Ce sont les comptes de la maison, créés à la main dans Supabase
-- (Authentication → Users → Add user), un par adulte.
--
-- Sans ça, n'importe qui connaissant l'adresse de l'app lirait les comptes
-- des deux familles : la clé publique est dans la page, elle n'est pas un
-- secret. La vraie barrière, c'est cette politique.
--
-- Le bloc est gardé : sur une base PostgreSQL ordinaire (celle du script de
-- vérification), le rôle « authenticated » de Supabase n'existe pas.

-- Le verrou, table par table, écrit en clair.
--
-- Il tiendrait tout aussi bien dans la boucle ci-dessous, mais l'éditeur SQL
-- de Supabase LIT le texte du fichier sans l'exécuter, pour vérifier qu'aucune
-- table ne reste ouverte. Il ne voit pas ce qui se passe dans une boucle : il
-- avertissait donc, à chaque collage, d'un danger qui n'existait pas. Un
-- avertissement qu'on apprend à ignorer est pire que pas d'avertissement.
alter table public.foyers       enable row level security;
alter table public.deja_fait    enable row level security;
alter table public.membres      enable row level security;
alter table public.charges      enable row level security;
alter table public.parts_charge enable row level security;
alter table public.reglements   enable row level security;
alter table public.pieces_charge enable row level security;
alter table public.cotisations  enable row level security;
alter table public.achats       enable row level security;
alter table public.ardoise      enable row level security;
alter table public.reglages     enable row level security;

do $droits$
declare
  t text;
  supabase boolean := exists (select 1 from pg_roles where rolname = 'authenticated');
begin
  foreach t in array array[
    'foyers', 'deja_fait', 'membres', 'charges', 'parts_charge', 'reglements',
    'pieces_charge',
    'cotisations', 'achats', 'ardoise', 'reglages'
  ]
  loop
    execute format('drop policy if exists "la maisonnee" on public.%I', t);
    if supabase then
      execute format(
        'create policy "la maisonnee" on public.%I for all to authenticated using (true) with check (true)',
        t
      );
      -- Le droit d'atteindre la table à travers l'API. Supabase le donne tout
      -- seul quand l'option « Automatically expose new tables » est cochée à
      -- la création du projet — mais on ne veut pas en dépendre : avec
      -- l'option décochée, l'app se heurterait à « permission denied » alors
      -- que tout le reste est en place, et l'erreur ne dirait pas pourquoi.
      execute format('grant select, insert, update, delete on public.%I to authenticated', t);
      -- Et surtout pas au visiteur non connecté. La politique ci-dessus le
      -- bloque déjà ; lui retirer aussi le droit d'atteindre la table, c'est
      -- la deuxième serrure — celle qui tient si quelqu'un ajoute un jour une
      -- politique trop large sans y penser.
      execute format('revoke all on public.%I from anon', t);
    end if;
  end loop;

  if supabase then
    execute 'grant usage on schema public to authenticated';
  end if;
end
$droits$;

-- =====================================================================
--  La réserve des pièces jointes
-- =====================================================================
--
-- Le panier « factures » garde les photos et les PDF des factures. Il n'est
-- PAS public : l'application demande à Supabase une adresse temporaire (une
-- heure) chaque fois qu'on ouvre une pièce. Une facture d'électricité porte le
-- nom et l'adresse de la maison ; une adresse publique et permanente, une fois
-- partagée par erreur, ne se reprend pas.
--
-- Tout le bloc est gardé : sur une base PostgreSQL ordinaire — celle du script
-- de vérification — le schéma « storage » de Supabase n'existe pas, et le
-- fichier doit quand même se rejouer sans broncher.
do $reserve$
declare
  panier text := 'factures';
  regle  text;
begin
  if to_regclass('storage.buckets') is null then
    return;
  end if;

  execute format(
    'insert into storage.buckets (id, name, public) values (%L, %L, false) on conflict (id) do nothing',
    panier, panier
  );

  -- Une règle par geste : Supabase n'accepte pas « for all » sur les objets.
  foreach regle in array array['select', 'insert', 'update', 'delete']
  loop
    execute format('drop policy if exists "factures de la maisonnee %s" on storage.objects', regle);
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      if regle = 'insert' then
        execute format(
          'create policy "factures de la maisonnee %s" on storage.objects for insert to authenticated with check (bucket_id = %L)',
          regle, panier
        );
      else
        execute format(
          'create policy "factures de la maisonnee %s" on storage.objects for %s to authenticated using (bucket_id = %L)',
          regle, regle, panier
        );
      end if;
    end if;
  end loop;
end
$reserve$;
