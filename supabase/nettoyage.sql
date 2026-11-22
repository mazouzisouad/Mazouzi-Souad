-- ============================================================
--  Suppression automatique des comptes inactifs depuis 3 ans
--  (durée annoncée dans la politique de confidentialité).
--  1) Supabase > Database > Extensions : activer « pg_cron »
--  2) Exécuter ce script dans le SQL Editor.
-- ============================================================
create extension if not exists pg_cron;

select cron.unschedule('purge-comptes-inactifs')
  where exists (select 1 from cron.job where jobname = 'purge-comptes-inactifs');

-- Tous les jours à 3 h 17 (UTC). Progression et accès sont supprimés en cascade ;
-- les paiements sont conservés (user_id passe à NULL) pour la comptabilité.
select cron.schedule('purge-comptes-inactifs', '17 3 * * *', $$
  delete from auth.users
  where coalesce(last_sign_in_at, created_at) < now() - interval '3 years';
$$);
