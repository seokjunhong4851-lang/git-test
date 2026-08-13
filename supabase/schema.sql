-- 슬기로운 TSV 생활 공동 저장소
-- 현재는 로그인 없이 사용하는 초기 버전이므로 anon 역할에도 CRUD를 허용합니다.
create table if not exists public.shared_items (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (collection in ('tsv-notices', 'tsv-members', 'tsv-schedules', 'tsv-dining-places')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shared_items_collection_created_at_idx
  on public.shared_items (collection, created_at desc);

alter table public.shared_items enable row level security;
alter table public.shared_items replica identity full;

revoke all on table public.shared_items from anon, authenticated;
grant select, insert, update, delete on table public.shared_items to anon, authenticated;

create policy "shared_items_select_no_login" on public.shared_items for select to anon, authenticated using (true);
create policy "shared_items_insert_no_login" on public.shared_items for insert to anon, authenticated with check (true);
create policy "shared_items_update_no_login" on public.shared_items for update to anon, authenticated using (true) with check (true);
create policy "shared_items_delete_no_login" on public.shared_items for delete to anon, authenticated using (true);

alter publication supabase_realtime add table public.shared_items;
