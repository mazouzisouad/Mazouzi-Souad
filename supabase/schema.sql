-- ============================================================
--  Code de la route en ligne : schéma Supabase
--  À exécuter une fois dans Supabase > SQL Editor > New query.
--  Le script peut être relancé sans risque (idempotent).
-- ============================================================

-- 1) Accès payant : une ligne par élève, date de fin de l'accès complet.
create table if not exists public.acces (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  expire_le   timestamptz not null,
  mis_a_jour  timestamptz not null default now()
);

-- 2) Paiements : une ligne par session Stripe Checkout payée.
--    Conservés 10 ans (obligation comptable, art. L123-22 du Code de commerce),
--    même si l'élève supprime son compte (user_id passe alors à NULL).
create table if not exists public.paiements (
  stripe_session_id  text primary key,
  user_id            uuid references auth.users (id) on delete set null,
  email              text,
  montant_centimes   integer not null,
  devise             text not null default 'eur',
  debut_periode      timestamptz not null,
  fin_periode        timestamptz not null,
  renonciation_retractation_le timestamptz,
  cree_le            timestamptz not null default now()
);

-- 3) Progression : un document JSON par élève (contenu libre, écrit par l'appli).
create table if not exists public.progression (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  donnees     jsonb not null default '{}'::jsonb,
  mis_a_jour  timestamptz not null default now()
);

-- ---------- Sécurité : Row Level Security ----------
alter table public.acces       enable row level security;
alter table public.paiements   enable row level security;
alter table public.progression enable row level security;

-- L'élève peut LIRE son accès et ses paiements, jamais les modifier
-- (seul le serveur, avec la clé service_role, écrit dans ces tables).
drop policy if exists "acces: lecture de son accès" on public.acces;
create policy "acces: lecture de son accès" on public.acces
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "paiements: lecture de ses paiements" on public.paiements;
create policy "paiements: lecture de ses paiements" on public.paiements
  for select to authenticated using (auth.uid() = user_id);

-- L'élève lit et écrit SA progression uniquement.
drop policy if exists "progression: lecture" on public.progression;
create policy "progression: lecture" on public.progression
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "progression: création" on public.progression;
create policy "progression: création" on public.progression
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "progression: mise à jour" on public.progression;
create policy "progression: mise à jour" on public.progression
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Limite de taille de la progression (évite qu'un compte remplisse la base).
alter table public.progression drop constraint if exists progression_taille_max;
alter table public.progression add constraint progression_taille_max
  check (pg_column_size(donnees) < 1000000);

-- ---------- Déblocage après paiement ----------
-- Appelée uniquement par le serveur (webhook Stripe ou page « merci »).
-- Idempotente : une même session Stripe ne prolonge l'accès qu'une seule fois.
-- Si l'élève a encore un accès en cours, les 3 mois s'ajoutent à la fin de celui-ci.
create or replace function public.accorder_acces(
  p_session_id   text,
  p_user_id      uuid,
  p_email        text,
  p_montant      integer,
  p_devise       text,
  p_renonciation timestamptz
) returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_debut timestamptz;
  v_fin   timestamptz;
begin
  -- verrou par élève : deux appels simultanés ne se marchent pas dessus
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  if exists (select 1 from paiements where stripe_session_id = p_session_id) then
    select expire_le into v_fin from acces where user_id = p_user_id;
    return v_fin;
  end if;

  select greatest(coalesce(max(expire_le), now()), now()) into v_debut
    from acces where user_id = p_user_id;
  v_fin := v_debut + interval '3 months';

  insert into paiements (stripe_session_id, user_id, email, montant_centimes, devise,
                         debut_periode, fin_periode, renonciation_retractation_le)
  values (p_session_id, p_user_id, p_email, p_montant, p_devise,
          v_debut, v_fin, p_renonciation);

  insert into acces (user_id, expire_le, mis_a_jour) values (p_user_id, v_fin, now())
  on conflict (user_id) do update set expire_le = excluded.expire_le, mis_a_jour = now();

  return v_fin;
end;
$$;

revoke all on function public.accorder_acces(text, uuid, text, integer, text, timestamptz) from public, anon, authenticated;
grant execute on function public.accorder_acces(text, uuid, text, integer, text, timestamptz) to service_role;
