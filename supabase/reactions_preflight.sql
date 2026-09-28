-- GRIOT: READ-ONLY preflight for retiring the 🚨 reaction.
-- Every statement is a SELECT. Run each and share the full output; any SQL
-- change to the reaction RPC is finalized against it.

-- 1. Definition of the reaction RPC (and any overloads). This decides
--    whether the database currently accepts arbitrary keys such as 🚨.
select
  p.oid::regprocedure as signature,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname = 'increment_post_reaction';

-- 2. Type, nullability and default of posts.reactions.
select column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'posts'
  and column_name = 'reactions';

-- 3. Anything else on public.posts that references reactions
--    (CHECK constraints; triggers are listed for completeness).
select con.conname, pg_get_constraintdef(con.oid)
from pg_constraint con
where con.conrelid = 'public.posts'::regclass
  and pg_get_constraintdef(con.oid) ilike '%reaction%';

select tgname, pg_get_triggerdef(oid)
from pg_trigger
where tgrelid = 'public.posts'::regclass
  and not tgisinternal;

-- 4. How much beta data still carries a 🚨 key (informational only).
select
  count(*) filter (where reactions::jsonb ? '🚨') as rows_with_alert_key,
  coalesce(sum((reactions::jsonb ->> '🚨')::int), 0) as total_alert_count
from public.posts;
