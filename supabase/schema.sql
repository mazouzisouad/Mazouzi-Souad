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

-- ---------- Codes d'accès remis par l'auto-école ----------
-- Chaque code (identifié par son empreinte) ne peut être utilisé qu'une seule fois.
create table if not exists public.codes_utilises (
  empreinte   bigint primary key,
  user_id     uuid references auth.users (id) on delete set null,
  utilise_le  timestamptz not null default now()
);
alter table public.codes_utilises enable row level security;
-- aucune règle : seul le serveur (service_role) y accède

create or replace function public.activer_code(p_empreinte bigint, p_user_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fin timestamptz;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));
  insert into codes_utilises (empreinte, user_id) values (p_empreinte, p_user_id)
  on conflict (empreinte) do nothing;
  if not found then
    raise exception 'deja_utilise';
  end if;

  select greatest(coalesce(max(expire_le), now()), now()) + interval '3 months' into v_fin
    from acces where user_id = p_user_id;
  insert into acces (user_id, expire_le, mis_a_jour) values (p_user_id, v_fin, now())
  on conflict (user_id) do update set expire_le = excluded.expire_le, mis_a_jour = now();
  return v_fin;
end;
$$;

revoke all on function public.activer_code(bigint, uuid) from public, anon, authenticated;
grant execute on function public.activer_code(bigint, uuid) to service_role;

-- ============================================================
--  Rappels par e-mail
-- ============================================================
-- Préférences de chaque élève. Les rappels d'entraînement demandent un accord
-- (case cochée à l'inscription ou dans « Mon compte ») ; les rappels de fin d'accès
-- concernent les clients et peuvent être désactivés à tout moment.
create table if not exists public.preferences (
  user_id               uuid primary key references auth.users (id) on delete cascade,
  rappels_entrainement  boolean not null default false,
  rappels_acces         boolean not null default true,
  jeton_desinscription  uuid not null default gen_random_uuid() unique,
  mis_a_jour            timestamptz not null default now()
);
alter table public.preferences enable row level security;
drop policy if exists "preferences: lecture" on public.preferences;
create policy "preferences: lecture" on public.preferences
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "preferences: mise à jour" on public.preferences;
create policy "preferences: mise à jour" on public.preferences
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- l'élève ne peut modifier que ses deux choix (pas son jeton)
revoke update on public.preferences from authenticated, anon;
grant update (rappels_entrainement, rappels_acces, mis_a_jour) on public.preferences to authenticated;

-- Création automatique à l'inscription (choix « rappels » coché ou non)
create or replace function public.creer_preferences() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into preferences (user_id, rappels_entrainement)
  values (new.id, coalesce((new.raw_user_meta_data ->> 'rappels')::boolean, false))
  on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists apres_inscription_preferences on auth.users;
create trigger apres_inscription_preferences after insert on auth.users
  for each row execute function public.creer_preferences();
-- comptes déjà créés avant ce script
insert into public.preferences (user_id) select id from auth.users on conflict do nothing;

-- Journal des rappels envoyés : un même rappel n'est jamais envoyé deux fois
create table if not exists public.rappels_envoyes (
  user_id    uuid not null references auth.users (id) on delete cascade,
  type       text not null,
  cle        text not null,
  envoye_le  timestamptz not null default now(),
  primary key (user_id, type, cle)
);
alter table public.rappels_envoyes enable row level security;

-- Rappels à envoyer aujourd'hui (appelée chaque jour par le serveur)
create or replace function public.rappels_a_envoyer()
returns table (user_id uuid, email text, type text, cle text, jeton uuid, date_ref timestamptz)
language sql security definer set search_path = public as $$
  -- pas d'entraînement depuis 3 jours (une fois par période d'inactivité, pas au-delà de 30 jours)
  select u.id, u.email::text, 'inactivite', to_char(p.mis_a_jour, 'YYYY-MM-DD'), pr.jeton_desinscription, p.mis_a_jour
  from progression p
  join auth.users u on u.id = p.user_id
  join preferences pr on pr.user_id = p.user_id
  where pr.rappels_entrainement
    and p.mis_a_jour < now() - interval '3 days'
    and p.mis_a_jour > now() - interval '30 days'
  union all
  -- l'accès complet se termine dans 7 jours ou moins
  select u.id, u.email::text, 'fin_acces', to_char(a.expire_le, 'YYYY-MM-DD'), pr.jeton_desinscription, a.expire_le
  from acces a
  join auth.users u on u.id = a.user_id
  join preferences pr on pr.user_id = a.user_id
  where pr.rappels_acces
    and a.expire_le > now() and a.expire_le <= now() + interval '7 days'
  union all
  -- l'accès complet vient de se terminer (dans les 3 derniers jours)
  select u.id, u.email::text, 'acces_termine', to_char(a.expire_le, 'YYYY-MM-DD'), pr.jeton_desinscription, a.expire_le
  from acces a
  join auth.users u on u.id = a.user_id
  join preferences pr on pr.user_id = a.user_id
  where pr.rappels_acces
    and a.expire_le <= now() and a.expire_le > now() - interval '3 days'
$$;
revoke all on function public.rappels_a_envoyer() from public, anon, authenticated;
grant execute on function public.rappels_a_envoyer() to service_role;

-- Désinscription en un clic (lien dans chaque e-mail)
create or replace function public.desinscrire(p_jeton uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update preferences set rappels_entrainement = false, rappels_acces = false, mis_a_jour = now()
  where jeton_desinscription = p_jeton;
  return found;
end;
$$;
revoke all on function public.desinscrire(uuid) from public, anon, authenticated;
grant execute on function public.desinscrire(uuid) to service_role;

-- ============================================================
--  Remboursements (webhook Stripe charge.refunded)
-- ============================================================
alter table public.paiements add column if not exists payment_intent text;
alter table public.paiements add column if not exists rembourse_le timestamptz;
create index if not exists paiements_payment_intent on public.paiements (payment_intent);

-- Remboursement total : le paiement est marqué remboursé et les 3 mois sont retirés de l'accès.
create or replace function public.rembourser(p_payment_intent text) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid;
begin
  update paiements set rembourse_le = now()
  where payment_intent = p_payment_intent and rembourse_le is null
  returning user_id into v_user;
  if not found then return false; end if;
  if v_user is not null then
    update acces set expire_le = expire_le - interval '3 months', mis_a_jour = now() where user_id = v_user;
  end if;
  return true;
end;
$$;
revoke all on function public.rembourser(text) from public, anon, authenticated;
grant execute on function public.rembourser(text) to service_role;



-- Lie le paiement Stripe (payment_intent) à la ligne de paiement, pour retrouver un remboursement
create or replace function public.lier_payment_intent(p_session_id text, p_payment_intent text) returns void
language sql security definer set search_path = public as $$
  update paiements set payment_intent = p_payment_intent
  where stripe_session_id = p_session_id and payment_intent is null;
$$;
revoke all on function public.lier_payment_intent(text, text) from public, anon, authenticated;
grant execute on function public.lier_payment_intent(text, text) to service_role;

-- ============================================================
--  Parrainage : un élève qui fait acheter un ami gagne 1 mois
-- ============================================================
create table if not exists public.parrainage_codes (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  code     text not null unique,
  cree_le  timestamptz not null default now()
);
create table if not exists public.parrainages (
  id          bigserial primary key,
  parrain_id  uuid references auth.users (id) on delete set null,
  filleul_id  uuid unique references auth.users (id) on delete set null,
  session_id  text unique,
  cree_le     timestamptz not null default now(),
  annule_le   timestamptz
);
alter table public.parrainage_codes enable row level security;
alter table public.parrainages enable row level security;
drop policy if exists "parrainage: mon code" on public.parrainage_codes;
create policy "parrainage: mon code" on public.parrainage_codes
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "parrainage: mes filleuls" on public.parrainages;
create policy "parrainage: mes filleuls" on public.parrainages
  for select to authenticated using (auth.uid() = parrain_id);

-- Code personnel de l'élève connecté (créé à la première demande). 6 caractères sans 0/O/1/I.
create or replace function public.obtenir_code_parrainage() returns text
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if v_uid is null then raise exception 'non_connecte'; end if;
  select code into v_code from parrainage_codes where user_id = v_uid;
  if v_code is not null then return v_code; end if;
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    begin
      insert into parrainage_codes (user_id, code) values (v_uid, v_code);
      return v_code;
    exception when unique_violation then
      select code into v_code from parrainage_codes where user_id = v_uid; -- appel simultané
      if v_code is not null then return v_code; end if;
    end;
  end loop;
end;
$$;
revoke all on function public.obtenir_code_parrainage() from public, anon;
grant execute on function public.obtenir_code_parrainage() to authenticated;

-- Récompense après le premier paiement d'un filleul (appelée par le serveur, sans effet si déjà faite).
-- Renvoie l'identifiant du parrain récompensé, ou NULL.
create or replace function public.recompenser_parrain(p_session_id text, p_filleul uuid, p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_parrain uuid;
begin
  select user_id into v_parrain from parrainage_codes where code = upper(p_code);
  if v_parrain is null or v_parrain = p_filleul then return null; end if;
  perform pg_advisory_xact_lock(hashtext(v_parrain::text));
  if exists (select 1 from parrainages where filleul_id = p_filleul or session_id = p_session_id) then return null; end if;
  -- seulement le tout premier achat du filleul
  if exists (select 1 from paiements where user_id = p_filleul and stripe_session_id <> p_session_id) then return null; end if;
  -- au plus 12 mois offerts par période de 12 mois
  if (select count(*) from parrainages where parrain_id = v_parrain and annule_le is null
        and cree_le > now() - interval '1 year') >= 12 then return null; end if;
  insert into parrainages (parrain_id, filleul_id, session_id) values (v_parrain, p_filleul, p_session_id);
  insert into acces (user_id, expire_le, mis_a_jour) values (v_parrain, now() + interval '1 month', now())
  on conflict (user_id) do update set expire_le = greatest(acces.expire_le, now()) + interval '1 month', mis_a_jour = now();
  return v_parrain;
end;
$$;
revoke all on function public.recompenser_parrain(text, uuid, text) from public, anon, authenticated;
grant execute on function public.recompenser_parrain(text, uuid, text) to service_role;

-- Remboursement : le mois offert au parrain est aussi retiré
create or replace function public.rembourser(p_payment_intent text) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid;
  v_session text;
  v_parrain uuid;
begin
  update paiements set rembourse_le = now()
  where payment_intent = p_payment_intent and rembourse_le is null
  returning user_id, stripe_session_id into v_user, v_session;
  if not found then return false; end if;
  if v_user is not null then
    update acces set expire_le = expire_le - interval '3 months', mis_a_jour = now() where user_id = v_user;
  end if;
  update parrainages set annule_le = now() where session_id = v_session and annule_le is null
  returning parrain_id into v_parrain;
  if v_parrain is not null then
    update acces set expire_le = expire_le - interval '1 month', mis_a_jour = now() where user_id = v_parrain;
  end if;
  return true;
end;
$$;
revoke all on function public.rembourser(text) from public, anon, authenticated;
grant execute on function public.rembourser(text) to service_role;

-- ============================================================
--  Tableau de bord interne (ventes)
-- ============================================================
create or replace function public.stats_admin() returns jsonb
language sql security definer set search_path = public as $$
  with p as (select * from paiements where rembourse_le is null)
  select jsonb_build_object(
    'total_centimes',      coalesce((select sum(montant_centimes) from p), 0),
    'nb_paiements',        (select count(*) from p),
    'nb_payeurs',          (select count(distinct coalesce(user_id::text, email)) from p),
    'nb_rembourses',       (select count(*) from paiements where rembourse_le is not null),
    'total_rembourse_centimes', coalesce((select sum(montant_centimes) from paiements where rembourse_le is not null), 0),
    'mois_centimes',       coalesce((select sum(montant_centimes) from p where cree_le >= date_trunc('month', now())), 0),
    'mois_paiements',      (select count(*) from p where cree_le >= date_trunc('month', now())),
    'nb_comptes',          (select count(*) from auth.users),
    'comptes_30j',         (select count(*) from auth.users where created_at > now() - interval '30 days'),
    'acces_actifs',        (select count(*) from acces where expire_le > now()),
    'codes_utilises',      (select count(*) from codes_utilises),
    'actifs_7j',           (select count(*) from progression where mis_a_jour > now() - interval '7 days'),
    'parrainages',         (select count(*) from parrainages where annule_le is null),
    'parrainages_mois',    (select count(*) from parrainages where annule_le is null and cree_le >= date_trunc('month', now())),
    'par_mois', coalesce((
      select jsonb_agg(jsonb_build_object('mois', to_char(m, 'YYYY-MM'), 'centimes', coalesce(s.c, 0), 'paiements', coalesce(s.n, 0)) order by m)
      from generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month') m
      left join (select date_trunc('month', cree_le) mo, sum(montant_centimes) c, count(*) n from p group by 1) s on s.mo = m
    ), '[]'::jsonb),
    'derniers', coalesce((
      select jsonb_agg(x order by x->>'date' desc) from (
        select jsonb_build_object('date', cree_le, 'email', email, 'centimes', montant_centimes,
                                  'rembourse', rembourse_le is not null) x
        from paiements order by cree_le desc limit 20) d
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.stats_admin() from public, anon, authenticated;
grant execute on function public.stats_admin() to service_role;
