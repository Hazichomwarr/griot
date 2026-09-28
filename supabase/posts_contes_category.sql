-- GRIOT: retire the "moments" category in favour of "contes".
--
-- Finalized against supabase/posts_contes_preflight.sql (2026-09-28):
--   * public.posts had no CHECK constraints and no user-defined triggers;
--   * category is text NOT NULL; duration is integer, nullable;
--   * data: moments = 3 rows (max 8s), around_you = 1 row (max 6s), no NULL
--     durations, no other categories;
--   * no name collisions with the objects created below.
-- This script drops nothing. The guards below re-assert those findings at
-- run time and abort (nothing applied) if the schema or data has drifted.
--
-- Canonical categories after this migration: 'around_you', 'contes'.
-- A Conte may be at most 300 seconds (mirrors MAX_CONTE_DURATION_SECONDS).
--
-- Only posts.category changes, and only on rows whose value is 'moments'.
-- Ids, timestamps, audio URLs, titles, reactions, views, locations and
-- post_reports are untouched.
--
-- NULL semantics are explicit:
--   * category must be non-null and one of the two canonical values;
--   * a Conte must have a known duration (NOT NULL) of at most 300 seconds;
--   * Around You places no constraint on duration (NULL allowed, as today).
--
-- The script runs in a single transaction. Any guard failure aborts it with
-- nothing applied.

begin;

-- 1. Guards: stop instead of guessing about remote schema or data.
do $$
declare
  unexpected text;
begin
  select string_agg(format('%s: %s', con.conname, pg_get_constraintdef(con.oid)), '; ')
  into unexpected
  from pg_constraint con
  join pg_attribute att
    on att.attrelid = con.conrelid
   and att.attnum = any (con.conkey)
  where con.conrelid = 'public.posts'::regclass
    and con.contype = 'c'
    and att.attname = 'category';

  if unexpected is not null then
    raise exception 'posts already has CHECK constraints on category; finalize this migration against them first: %', unexpected;
  end if;

  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.posts'::regclass
      and conname in ('posts_category_check', 'posts_contes_max_duration')
  ) then
    raise exception 'constraint name posts_category_check or posts_contes_max_duration already exists on posts';
  end if;

  if exists (
    select 1 from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'posts_coerce_legacy_category'
  ) then
    raise exception 'function public.posts_coerce_legacy_category already exists';
  end if;

  select string_agg(distinct coalesce(category, '<null>'), ', ')
  into unexpected
  from public.posts
  where category is null
     or category not in ('moments', 'around_you', 'contes');

  if unexpected is not null then
    raise exception 'posts contains categories this migration does not map: %', unexpected;
  end if;

  if exists (
    select 1 from public.posts
    where category in ('moments', 'contes')
      and (duration is null or duration > 300)
  ) then
    raise exception 'legacy moments/contes rows with NULL or >300s duration exist; decide how to handle them before migrating';
  end if;
end
$$;

-- 2. Migrate historical rows.
update public.posts
set category = 'contes'
where category = 'moments';

-- 3. Compatibility for app builds that still send 'moments': coerce to
--    'contes' before constraints are checked. Remove once no pre-Contes
--    build is in use (see the follow-up at the end of this file).
create function public.posts_coerce_legacy_category()
returns trigger
language plpgsql
as $$
begin
  if new.category = 'moments' then
    new.category := 'contes';
  end if;
  return new;
end;
$$;

create trigger posts_coerce_legacy_category
before insert or update of category on public.posts
for each row
execute function public.posts_coerce_legacy_category();

-- 4. Domain constraints (validated against every existing row).
alter table public.posts
add constraint posts_category_check
check (category is not null and category in ('around_you', 'contes'));

alter table public.posts
add constraint posts_contes_max_duration
check (
  category is distinct from 'contes'
  or (duration is not null and duration <= 300)
);

commit;

-- Follow-up (run later, once every installed build sends 'contes'):
--   drop trigger if exists posts_coerce_legacy_category on public.posts;
--   drop function if exists public.posts_coerce_legacy_category();
