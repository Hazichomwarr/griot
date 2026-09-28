-- GRIOT: READ-ONLY preflight for posts_contes_category.sql.
-- Every statement is a SELECT. Run each and share the full output before the
-- migration is finalized.

-- 1. All CHECK constraints on public.posts, with their exact definitions.
select
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition,
  con.convalidated as validated,
  array(
    select att.attname
    from pg_attribute att
    where att.attrelid = con.conrelid
      and att.attnum = any (con.conkey)
    order by att.attnum
  ) as columns
from pg_constraint con
where con.conrelid = 'public.posts'::regclass
  and con.contype = 'c'
order by con.conname;

-- 2. Type, nullability and default of the columns the migration relies on.
select column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'posts'
  and column_name in ('category', 'duration')
order by column_name;

-- 3. Current data shape per category, including NULLs.
select
  category,
  count(*) as row_count,
  count(*) filter (where duration is null) as null_duration_count,
  max(duration) as max_duration,
  count(*) filter (where duration > 300) as over_300s_count
from public.posts
group by category
order by category nulls first;

-- 4. Existing triggers on public.posts (user-defined only).
select tgname as trigger_name, pg_get_triggerdef(oid) as trigger_definition
from pg_trigger
where tgrelid = 'public.posts'::regclass
  and not tgisinternal
order by tgname;

-- 5. Name collisions with objects the migration will create.
select 'constraint' as kind, conname as name
from pg_constraint
where conrelid = 'public.posts'::regclass
  and conname in ('posts_category_check', 'posts_contes_max_duration')
union all
select 'function', proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname = 'posts_coerce_legacy_category';
