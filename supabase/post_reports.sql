create table if not exists post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists post_reports_post_id_idx
on post_reports(post_id);

create index if not exists post_reports_created_at_idx
on post_reports(created_at desc);

alter table post_reports enable row level security;

drop policy if exists "anonymous users can create reports" on post_reports;

create policy "anonymous users can create reports"
on post_reports
for insert
to anon
with check (true);
