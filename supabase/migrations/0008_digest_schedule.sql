-- FollowUp daily digest schedule.
--
-- Vercel Hobby rejects crons more frequent than daily, and the digest needs an
-- hourly trigger so each user's local 7am is caught. pg_cron runs the trigger
-- inside Postgres and pg_net makes the HTTP call to the deployed app.
--
-- Nothing secret lives in this file. The endpoint URL and bearer token are read
-- from Supabase Vault at run time and must be created out of band -- never in a
-- migration, which is recorded in history and committed:
--
--   select vault.create_secret('<https://your-app>/api/cron/digest', 'followup_digest_url');
--   select vault.create_secret('<CRON_SECRET from Vercel>',          'followup_cron_secret');
--
-- Until both exist the job is a harmless no-op: net.http_get is STRICT, so a
-- null url returns null without making a request.
--
-- pg_cron schedules run in UTC. Firing at minute 0 means half-hour-offset zones
-- (e.g. Asia/Kolkata, UTC+5:30) get their digest at 7:30 local -- still inside
-- their 7am hour -- and claim_digest() prevents any repeat.

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create extension if not exists pg_net with schema extensions;

-- Re-runnable: remove any earlier definition of these jobs first.
select cron.unschedule(jobid)
from cron.job
where jobname in ('followup-digest-hourly', 'followup-cron-history-cleanup');

select cron.schedule(
  'followup-digest-hourly',
  '0 * * * *',
  $job$
    select net.http_get(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'followup_digest_url'),
      headers := jsonb_build_object(
        'Authorization',
        'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'followup_cron_secret')
      ),
      -- pg_net's installed default timeout is 5s; the endpoint checks the
      -- session, claims recipients and calls Resend, so allow a full minute.
      timeout_milliseconds := 60000
    );
  $job$
);

-- pg_cron never prunes its own run history, and Supabase warns that an
-- oversized cron.job_run_details can fail a Postgres upgrade.
select cron.schedule(
  'followup-cron-history-cleanup',
  '30 3 * * *',
  $job$ delete from cron.job_run_details where end_time < now() - interval '14 days' $job$
);
