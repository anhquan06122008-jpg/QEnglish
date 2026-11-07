-- ============================================================================
-- QEnglish — Optional Supabase Cloud Sync Schema (PostgreSQL + RLS)
-- Dùng khi muốn đồng bộ dữ liệu đa thiết bị (Phần 9.2).
-- Mặc định hệ thống hoạt động đầy đủ trên Local Browser Storage mà không bắt buộc DB.
-- ============================================================================

create table if not exists public.qenglish_user_snapshots (
    user_id uuid primary key references auth.users(id) on delete cascade,
    deck_v2 jsonb not null default '[]'::jsonb,
    srs_state jsonb not null default '{}'::jsonb,
    notebook jsonb not null default '[]'::jsonb,
    progress_state jsonb not null default '{}'::jsonb,
    cms_items jsonb not null default '[]'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.qenglish_user_snapshots enable row level security;

create policy "Users can read own QEnglish snapshot"
    on public.qenglish_user_snapshots for select
    using (auth.uid() = user_id);

create policy "Users can insert own QEnglish snapshot"
    on public.qenglish_user_snapshots for insert
    with check (auth.uid() = user_id);

create policy "Users can update own QEnglish snapshot"
    on public.qenglish_user_snapshots for update
    using (auth.uid() = user_id);
