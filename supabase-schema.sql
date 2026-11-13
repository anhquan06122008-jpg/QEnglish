-- ==========================================================================
-- QEnglish Cloud Database Schema & Row Level Security (Supabase PostgreSQL)
-- Migration-safe: preserves existing qenglish_user_snapshots while adding
-- normalized user-scoped tables & storage bucket isolation.
-- ==========================================================================

-- 1. Preserve legacy snapshot table & harden with revision + delete RLS
create table if not exists public.qenglish_user_snapshots (
    user_id uuid primary key references auth.users(id) on delete cascade,
    deck_v2 jsonb not null default '[]'::jsonb,
    srs_state jsonb not null default '{}'::jsonb,
    notebook jsonb not null default '[]'::jsonb,
    progress_state jsonb not null default '{}'::jsonb,
    cms_items jsonb not null default '[]'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.qenglish_user_snapshots
    add column if not exists revision bigint not null default 1,
    add column if not exists device_id text not null default '';

alter table public.qenglish_user_snapshots enable row level security;

drop policy if exists "Users can view own snapshot" on public.qenglish_user_snapshots;
create policy "Users can view own snapshot"
on public.qenglish_user_snapshots for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own snapshot" on public.qenglish_user_snapshots;
create policy "Users can insert own snapshot"
on public.qenglish_user_snapshots for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own snapshot" on public.qenglish_user_snapshots;
create policy "Users can update own snapshot"
on public.qenglish_user_snapshots for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own snapshot" on public.qenglish_user_snapshots;
create policy "Users can delete own snapshot"
on public.qenglish_user_snapshots for delete
using (auth.uid() = user_id);

-- 2. User profiles (authenticated individual accounts)
create table if not exists public.user_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null default 'QEnglish Learner',
    email text not null default '',
    avatar text not null default '🚀',
    goal text not null default 'Chinh phục 5 kỹ năng Tiếng Anh',
    target_level text not null default 'all',
    terms_accepted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users select own profile" on public.user_profiles;
create policy "Users select own profile"
on public.user_profiles for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own profile" on public.user_profiles;
create policy "Users insert own profile"
on public.user_profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "Users update own profile" on public.user_profiles;
create policy "Users update own profile"
on public.user_profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own profile" on public.user_profiles;
create policy "Users delete own profile"
on public.user_profiles for delete
using (auth.uid() = user_id);

-- 3. Complete isolated study workspace snapshots (syncs all modules + settings)
create table if not exists public.user_study_snapshots (
    user_id uuid primary key references auth.users(id) on delete cascade,
    revision bigint not null default 1,
    device_id text not null default '',
    settings jsonb not null default '{}'::jsonb,
    deck_v2 jsonb not null default '[]'::jsonb,
    srs_state jsonb not null default '{}'::jsonb,
    progress_state jsonb not null default '{}'::jsonb,
    dashboard_state jsonb not null default '{}'::jsonb,
    grammar_state jsonb not null default '{}'::jsonb,
    listening_state jsonb not null default '{}'::jsonb,
    speaking_state jsonb not null default '{}'::jsonb,
    reading_state jsonb not null default '{}'::jsonb,
    writing_state jsonb not null default '{}'::jsonb,
    notebook jsonb not null default '[]'::jsonb,
    cms_items jsonb not null default '[]'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.user_study_snapshots enable row level security;

drop policy if exists "Users select own study snapshot" on public.user_study_snapshots;
create policy "Users select own study snapshot"
on public.user_study_snapshots for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own study snapshot" on public.user_study_snapshots;
create policy "Users insert own study snapshot"
on public.user_study_snapshots for insert
with check (auth.uid() = user_id);

drop policy if exists "Users update own study snapshot" on public.user_study_snapshots;
create policy "Users update own study snapshot"
on public.user_study_snapshots for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own study snapshot" on public.user_study_snapshots;
create policy "Users delete own study snapshot"
on public.user_study_snapshots for delete
using (auth.uid() = user_id);

-- 4. Normalized Writing submissions & AI evaluation history
create table if not exists public.user_writing_submissions (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    topic_id text not null default '',
    title text not null,
    grading_mode text not null default 'internal_10',
    target_level text not null default 'B1',
    prompt text not null default '',
    essay_text text not null,
    word_count integer not null default 0,
    total_score_10 numeric(4,2),
    score_pct integer,
    criteria_scores jsonb not null default '{}'::jsonb,
    ai_report jsonb not null default '{}'::jsonb,
    eval_mode text not null default 'local',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, id)
);

create index if not exists idx_writing_subs_user_created
    on public.user_writing_submissions (user_id, created_at desc);

alter table public.user_writing_submissions enable row level security;

drop policy if exists "Users manage own writing submissions" on public.user_writing_submissions;
create policy "Users manage own writing submissions"
on public.user_writing_submissions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 5. Normalized Personal Learning Materials metadata
create table if not exists public.user_materials (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    skill text not null default 'reading',
    level text not null default 'B1',
    topic text not null default 'Personal',
    content_text text not null default '',
    storage_path text not null default '',
    mime_type text not null default '',
    file_size bigint not null default 0,
    study_status text not null default 'not_started',
    source text not null default 'user-imported',
    source_url text not null default '',
    payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, id)
);

create index if not exists idx_user_materials_user_updated
    on public.user_materials (user_id, updated_at desc);

alter table public.user_materials enable row level security;

drop policy if exists "Users manage own materials" on public.user_materials;
create policy "Users manage own materials"
on public.user_materials for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 6. Private per-user file storage bucket & folder RLS policies (max 10MB/file)
insert into storage.buckets (id, name, public, file_size_limit)
values ('qenglish-materials', 'qenglish-materials', false, 10485760)
on conflict (id) do nothing;

drop policy if exists "Users read own storage files" on storage.objects;
create policy "Users read own storage files"
on storage.objects for select
using (
    bucket_id = 'qenglish-materials'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users upload own storage files" on storage.objects;
create policy "Users upload own storage files"
on storage.objects for insert
with check (
    bucket_id = 'qenglish-materials'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own storage files" on storage.objects;
create policy "Users update own storage files"
on storage.objects for update
using (
    bucket_id = 'qenglish-materials'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own storage files" on storage.objects;
create policy "Users delete own storage files"
on storage.objects for delete
using (
    bucket_id = 'qenglish-materials'
    and (storage.foldername(name))[1] = auth.uid()::text
);
