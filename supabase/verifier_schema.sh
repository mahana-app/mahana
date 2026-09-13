#!/usr/bin/env bash
#
# Vérifie que supabase/schema.sql peut être rejoué plusieurs fois de suite
# sans erreur — c'est exactement ce que fait Maru quand elle recolle le
# fichier entier dans l'éditeur SQL de Supabase.
#
#   ./supabase/verifier_schema.sh
#
# Le script monte une base PostgreSQL jetable, applique le schéma trois fois,
# et sort en erreur dès qu'un passage échoue. Les passages 2 et 3 sont les
# vrais juges : c'est là qu'on voit qu'une fonction est redéfinie sans son
# « drop » ou qu'un seed écrit dans une colonne supprimée plus loin.
#
# Pourquoi : le 15/08/2026, mon_repas_jour a été redéfinie avec un autre type
# de retour sans drop préalable. Le fichier passait la première fois (base
# vierge) et cassait à la deuxième, ligne 1733 — une semaine de modifications
# n'est jamais arrivée dans la base de Maru sans que personne le voie.
#
set -uo pipefail

RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEMA="${1:-$RACINE/supabase/schema.sql}"
PASSAGES="${PASSAGES:-3}"

DOSSIER="${PGFARE_DIR:-/var/tmp/pgfare}"
PORT="${PGFARE_PORT:-55433}"
SOCKET="${PGFARE_SOCKET:-/var/tmp}"
BASE="verif_schema_$$"
JOURNAL="$(mktemp -d)/verif.log"

rouge()  { printf '\033[31m%s\033[0m\n' "$*"; }
vert()   { printf '\033[32m%s\033[0m\n' "$*"; }
gris()   { printf '\033[2m%s\033[0m\n' "$*"; }

[ -f "$SCHEMA" ] || { rouge "✗ Fichier introuvable : $SCHEMA"; exit 2; }

# --- Trouver les binaires PostgreSQL ------------------------------------
BIN=""
for c in /usr/lib/postgresql/*/bin /usr/local/pgsql/bin /opt/homebrew/opt/postgresql*/bin; do
  [ -x "$c/pg_ctl" ] && BIN="$c"
done
if [ -z "$BIN" ] && command -v pg_ctl >/dev/null 2>&1; then
  BIN="$(dirname "$(command -v pg_ctl)")"
fi
[ -n "$BIN" ] || {
  rouge "✗ PostgreSQL introuvable."
  echo "  Installe-le puis relance :  apt-get install -y postgresql-16"
  exit 2
}

# --- Lancer le serveur si besoin ----------------------------------------
# PostgreSQL refuse de tourner en root : on passe par l'utilisateur postgres
# quand on est root, sinon on reste sous l'utilisateur courant.
if [ "$(id -un)" = "root" ] && id postgres >/dev/null 2>&1; then
  COMME="su postgres -c"
  PROPRIO="postgres"
else
  COMME="bash -c"
  PROPRIO="$(id -un)"
fi
lancer() { eval $COMME "\"$1\""; }

mkdir -p "$SOCKET"
chmod 1777 "$SOCKET" 2>/dev/null || true

demarre=0
if ! lancer "$BIN/pg_ctl -D $DOSSIER status" >/dev/null 2>&1; then
  if [ ! -f "$DOSSIER/PG_VERSION" ]; then
    gris "Création d'un cluster PostgreSQL jetable dans $DOSSIER…"
    mkdir -p "$DOSSIER"
    chown -R "$PROPRIO" "$DOSSIER" 2>/dev/null || true
    lancer "$BIN/initdb -D $DOSSIER -U postgres --auth=trust" >/dev/null 2>&1 || {
      rouge "✗ Impossible de créer le cluster PostgreSQL."; exit 2; }
  fi
  gris "Démarrage du serveur sur le port $PORT…"
  lancer "$BIN/pg_ctl -D $DOSSIER -o '-k $SOCKET -p $PORT -c listen_addresses=' -l $DOSSIER/serveur.log start" >/dev/null 2>&1 || {
    rouge "✗ Le serveur PostgreSQL n'a pas démarré. Voir $DOSSIER/serveur.log"; exit 2; }
  demarre=1
  sleep 1
fi

export PGHOST="$SOCKET" PGPORT="$PORT" PGUSER="${PGFARE_USER:-postgres}"

nettoyer() {
  psql -q -d postgres -c "drop database if exists $BASE" >/dev/null 2>&1 || true
  [ "$demarre" = "1" ] && lancer "$BIN/pg_ctl -D $DOSSIER stop -m fast" >/dev/null 2>&1
  return 0
}
trap nettoyer EXIT

# --- Base vierge + décor Supabase ---------------------------------------
psql -q -d postgres -c "drop database if exists $BASE" >/dev/null 2>&1
psql -q -d postgres -c "create database $BASE" >/dev/null 2>&1 || {
  rouge "✗ Impossible de créer la base de test."; exit 2; }

# Ce que Supabase fournit d'office et que schema.sql suppose déjà là.
psql -q -v ON_ERROR_STOP=1 -d "$BASE" >/dev/null 2>>"$JOURNAL" <<'SQL'
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
end $$;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists storage;
create table if not exists storage.buckets (id text primary key, name text, public boolean);
create table if not exists storage.objects (
  id uuid default gen_random_uuid() primary key,
  bucket_id text, name text, owner uuid, created_at timestamptz default now());
SQL
if [ $? -ne 0 ]; then
  rouge "✗ Le décor Supabase (rôles, pgcrypto, storage) n'a pas pu être posé."
  sed -n '1,40p' "$JOURNAL"
  exit 2
fi

lignes=$(wc -l < "$SCHEMA")
echo
echo "Vérification de $(basename "$SCHEMA") — $lignes lignes, $PASSAGES passages"
echo "─────────────────────────────────────────────────────────────"

for n in $(seq 1 "$PASSAGES"); do
  : > "$JOURNAL"
  debut=$SECONDS
  psql -q -v ON_ERROR_STOP=1 -d "$BASE" -f "$SCHEMA" >/dev/null 2>"$JOURNAL"
  code=$?
  duree=$((SECONDS - debut))

  if [ $code -eq 0 ]; then
    vert "  ✓ Passage $n/$PASSAGES — ${duree}s"
  else
    rouge "  ✗ Passage $n/$PASSAGES — ÉCHEC après ${duree}s"
    echo
    rouge "Erreur PostgreSQL :"
    grep -v '^psql:.*NOTICE' "$JOURNAL" | sed -n '1,25p' | sed 's/^/    /'
    echo

    # Retrouver la ligne fautive dans le fichier, psql la donne dans son message.
    faute=$(grep -E '^psql:.*: *ERROR' "$JOURNAL" | grep -oE ":[0-9]+: *ERROR" | head -1 | tr -cd '0-9')
    if [ -n "$faute" ]; then
      echo "    ── contexte, $SCHEMA ligne $faute ──"
      awk -v l="$faute" 'NR>=l-6 && NR<=l+3 {printf "    %6d | %s\n", NR, $0}' "$SCHEMA"
      echo
    fi

    if [ "$n" -gt 1 ]; then
      cat <<'AIDE'
  Le fichier passe sur une base vierge mais casse quand on le rejoue.
  C'est le bug qui ne se voit pas : Maru recolle tout le schéma, Supabase
  s'arrête à cette ligne, et TOUT CE QUI SUIT n'arrive jamais dans sa base.

  Les deux causes connues :

  1. Une fonction redéfinie plus loin avec un autre type de retour, ou un
     autre nom de paramètre. « create or replace » ne sait pas faire ça.
     → ajoute « drop function if exists public.la_fonction(types...); »
       AVANT LA PREMIÈRE des deux définitions, pas seulement la seconde.

  2. Un seed (insert) qui écrit dans une colonne supprimée plus loin par un
     « alter table ... drop column ». Au 2ᵉ passage la colonne n'existe plus.
     → enveloppe le seed :
       do $seed$ begin
         if exists (select 1 from information_schema.columns
                     where table_schema='public' and table_name='ma_table'
                       and column_name='ma_colonne') then
           insert into ... ;
         end if;
       end $seed$;

  Voir la section « Écrire dans schema.sql » du CLAUDE.md à la racine.
AIDE
    else
      echo "  Le schéma ne passe même pas sur une base vierge — c'est une erreur SQL simple."
    fi
    exit 1
  fi
done

echo "─────────────────────────────────────────────────────────────"
vert "✓ Le schéma se rejoue $PASSAGES fois sans erreur. On peut pousser."
echo
