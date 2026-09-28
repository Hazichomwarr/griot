-- GRIOT: launch reactions are exactly 😂 and 👍 (🚨 retired).
--
-- Based on supabase/reactions_preflight.sql (2026-09-28):
--   * increment_post_reaction(uuid, text) accepted any reaction_key;
--   * posts.reactions is jsonb, nullable, default {"👍": 0, "😂": 0, "🚨": 0};
--   * no reaction-specific constraints or triggers exist.
--
-- Existing reaction JSON values are left untouched (beta voices are deleted
-- separately before production). posts_coerce_legacy_category is untouched.
--
-- CREATE OR REPLACE keeps the function's OID, owner and EXECUTE grants.
-- It cannot change the return type or parameter names, and it resets any
-- attribute not restated, so SECURITY DEFINER and search_path are restated
-- below. The guard aborts if the live function differs from what this
-- replacement assumes.

begin;

do $$
begin
  if not exists (
    select 1
    from pg_proc p
    where p.oid = 'public.increment_post_reaction(uuid, text)'::regprocedure
      and p.prorettype = 'void'::regtype
      and p.prosecdef
      and p.proargnames = array['post_id', 'reaction_key']
  ) then
    raise exception 'increment_post_reaction(uuid, text) is not the expected void SECURITY DEFINER function with args (post_id, reaction_key); review before applying';
  end if;
end
$$;

alter table public.posts
alter column reactions set default '{"😂": 0, "👍": 0}'::jsonb;

create or replace function public.increment_post_reaction(
  post_id uuid,
  reaction_key text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if reaction_key is null or reaction_key not in ('😂', '👍') then
    raise exception 'invalid reaction key: %', reaction_key
      using errcode = '22023';
  end if;

  update public.posts
  set reactions = jsonb_set(
    coalesce(reactions, '{}'::jsonb),
    array[reaction_key],
    to_jsonb(coalesce((reactions ->> reaction_key)::int, 0) + 1)
  )
  where id = increment_post_reaction.post_id;
end;
$$;

commit;
