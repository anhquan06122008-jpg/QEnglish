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

-- 7. Multi-Device Active Sessions Registry (concurrent logins + remote device sign-out)
create table if not exists public.user_devices (
    user_id uuid not null references auth.users(id) on delete cascade,
    device_id text not null,
    device_name text not null default 'Web Browser',
    platform text not null default 'web',
    user_agent text not null default '',
    is_revoked boolean not null default false,
    last_seen_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    primary key (user_id, device_id)
);

create index if not exists idx_user_devices_user_last_seen
    on public.user_devices (user_id, last_seen_at desc);

alter table public.user_devices enable row level security;

drop policy if exists "Users manage own devices" on public.user_devices;
create policy "Users manage own devices"
on public.user_devices for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 8. Normalized Writing Drafts with Conflict Backup & Revision Tracking
create table if not exists public.user_writing_drafts (
    user_id uuid not null references auth.users(id) on delete cascade,
    lesson_key text not null,
    draft_text text not null default '',
    previous_text text not null default '',
    conflict_backup text not null default '',
    revision bigint not null default 1,
    device_id text not null default '',
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    primary key (user_id, lesson_key)
);

create index if not exists idx_writing_drafts_user_updated
    on public.user_writing_drafts (user_id, updated_at desc);

alter table public.user_writing_drafts enable row level security;

drop policy if exists "Users manage own writing drafts" on public.user_writing_drafts;
create policy "Users manage own writing drafts"
on public.user_writing_drafts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 9. Enable Supabase Realtime (CDC Push) ONLY on multi-device sync tables
alter table public.user_study_snapshots replica identity full;
alter table public.user_devices replica identity full;
alter table public.user_writing_drafts replica identity full;

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_study_snapshots'
    ) then
        alter publication supabase_realtime add table public.user_study_snapshots;
    end if;

    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_devices'
    ) then
        alter publication supabase_realtime add table public.user_devices;
    end if;

    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_writing_drafts'
    ) then
        alter publication supabase_realtime add table public.user_writing_drafts;
    end if;
end $$;

-- 10. AI PDF Learning Studio — Uploaded PDF Documents & Generated Interactive Courses
create table if not exists public.user_pdf_documents (
    user_id uuid not null references auth.users(id) on delete cascade,
    doc_id text not null,
    file_name text not null,
    file_size bigint not null default 0,
    page_count integer not null default 0,
    sha256_hash text not null default '',
    storage_path text not null default '',
    status text not null default 'uploaded',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, doc_id)
);

create index if not exists idx_user_pdf_docs_user_updated
    on public.user_pdf_documents (user_id, updated_at desc);

alter table public.user_pdf_documents enable row level security;

drop policy if exists "Users manage own pdf documents" on public.user_pdf_documents;
create policy "Users manage own pdf documents"
on public.user_pdf_documents for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.user_pdf_courses (
    user_id uuid not null references auth.users(id) on delete cascade,
    course_id text not null,
    doc_id text not null default '',
    title text not null,
    published boolean not null default false,
    knowledge_map jsonb not null default '{}'::jsonb,
    course_payload jsonb not null default '{}'::jsonb,
    progress_payload jsonb not null default '{}'::jsonb,
    mindmap_payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, course_id)
);

create index if not exists idx_user_pdf_courses_user_updated
    on public.user_pdf_courses (user_id, updated_at desc);

alter table public.user_pdf_courses enable row level security;

drop policy if exists "Users manage own pdf courses" on public.user_pdf_courses;
create policy "Users manage own pdf courses"
on public.user_pdf_courses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

alter table public.user_pdf_courses replica identity full;

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_pdf_courses'
    ) then
        alter publication supabase_realtime add table public.user_pdf_courses;
    end if;
end $$;

-- 11. Normalized Unit-Based LMS Schema (Course -> Unit -> Skill -> Lesson -> Exercise -> Question -> Attempt -> AI Practice)
-- Migration-safe: adds full relational LMS tables with strict RLS (auth.uid() = user_id) without deleting any legacy tables.

create table if not exists public.courses (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    doc_id text not null default '',
    folder_id text not null default '',
    title text not null,
    description_vi text not null default '',
    difficulty text not null default 'B1',
    published boolean not null default false,
    display_order integer not null default 0,
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, id)
);

create table if not exists public.course_units (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    course_id text not null,
    title text not null,
    summary_vi text not null default '',
    source_page integer not null default 1,
    page_end integer not null default 1,
    difficulty text not null default 'B1',
    content_origin text not null default 'PDF_ORIGINAL' check (content_origin in ('PDF_ORIGINAL', 'AI_GENERATED')),
    display_order integer not null default 0,
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, id),
    foreign key (user_id, course_id) references public.courses (user_id, id) on delete cascade
);

create table if not exists public.unit_skills (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    unit_id text not null,
    skill_key text not null check (skill_key in ('reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar')),
    display_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, id),
    foreign key (user_id, unit_id) references public.course_units (user_id, id) on delete cascade
);

create table if not exists public.lessons (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    unit_id text not null,
    primary_skill text not null check (primary_skill in ('reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar')),
    extra_skills jsonb not null default '[]'::jsonb,
    title text not null,
    source_page integer not null default 1,
    content_origin text not null default 'PDF_ORIGINAL' check (content_origin in ('PDF_ORIGINAL', 'AI_GENERATED')),
    difficulty text not null default 'B1',
    display_order integer not null default 0,
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, id),
    foreign key (user_id, unit_id) references public.course_units (user_id, id) on delete cascade
);

create table if not exists public.lesson_contents (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    lesson_id text not null,
    content_type text not null default 'passage',
    body_text text not null default '',
    media_storage_path text not null default '',
    metadata jsonb not null default '{}'::jsonb,
    source_page integer not null default 1,
    content_origin text not null default 'PDF_ORIGINAL',
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, id),
    foreign key (user_id, lesson_id) references public.lessons (user_id, id) on delete cascade
);

create table if not exists public.exercises (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    lesson_id text not null,
    parent_exercise_id text,
    title text not null,
    difficulty text not null default 'same',
    focus_mode text not null default 'mixed',
    content_origin text not null default 'PDF_ORIGINAL' check (content_origin in ('PDF_ORIGINAL', 'AI_GENERATED')),
    source_page integer not null default 1,
    display_order integer not null default 0,
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, id),
    foreign key (user_id, lesson_id) references public.lessons (user_id, id) on delete cascade
);

create table if not exists public.exercise_questions (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    exercise_id text not null,
    question_type text not null default 'mcq',
    prompt_text text not null,
    correct_answer text not null default '',
    acceptable_answers jsonb not null default '[]'::jsonb,
    explanation_vi text not null default '',
    evidence_quote text not null default '',
    topic_tag text not null default '',
    source_page integer not null default 1,
    content_origin text not null default 'PDF_ORIGINAL' check (content_origin in ('PDF_ORIGINAL', 'AI_GENERATED')),
    difficulty text not null default 'B1',
    display_order integer not null default 0,
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, id),
    foreign key (user_id, exercise_id) references public.exercises (user_id, id) on delete cascade
);

create table if not exists public.answer_options (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    question_id text not null,
    option_text text not null,
    is_correct boolean not null default false,
    display_order integer not null default 0,
    created_at timestamptz not null default now(),
    primary key (user_id, id),
    foreign key (user_id, question_id) references public.exercise_questions (user_id, id) on delete cascade
);

create table if not exists public.exercise_attempts (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    course_id text not null,
    unit_id text not null,
    lesson_id text not null,
    exercise_id text not null,
    attempt_no integer not null default 1,
    score_pct integer not null default 0,
    score_10 numeric(4,2),
    correct_count integer not null default 0,
    total_count integer not null default 0,
    duration_sec integer not null default 0,
    summary_payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    primary key (user_id, id)
);

create table if not exists public.user_answers (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    attempt_id text not null,
    question_id text not null,
    user_answer text not null default '',
    is_correct boolean not null default false,
    ai_feedback jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    primary key (user_id, id),
    foreign key (user_id, attempt_id) references public.exercise_attempts (user_id, id) on delete cascade
);

create table if not exists public.ai_generated_practice (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    parent_lesson_id text not null,
    unit_id text not null,
    skill_key text not null,
    title text not null,
    difficulty text not null default 'same',
    focus_mode text not null default 'mixed',
    payload jsonb not null default '{}'::jsonb,
    source_page integer not null default 1,
    content_origin text not null default 'AI_GENERATED',
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, id),
    foreign key (user_id, parent_lesson_id) references public.lessons (user_id, id) on delete cascade
);

create table if not exists public.learning_progress (
    user_id uuid not null references auth.users(id) on delete cascade,
    lesson_id text not null,
    course_id text not null,
    unit_id text not null,
    skill_key text not null,
    status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
    best_score_pct integer not null default 0,
    attempts_count integer not null default 0,
    last_position jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    primary key (user_id, lesson_id)
);

create table if not exists public.source_references (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    doc_id text not null,
    lesson_id text not null,
    source_page integer not null default 1,
    excerpt text not null default '',
    created_at timestamptz not null default now(),
    primary key (user_id, id)
);

create index if not exists idx_course_units_course on public.course_units (user_id, course_id, display_order);
create index if not exists idx_lessons_unit_skill on public.lessons (user_id, unit_id, primary_skill, display_order);
create index if not exists idx_attempts_lesson on public.exercise_attempts (user_id, lesson_id, created_at desc);
create index if not exists idx_ai_practice_parent on public.ai_generated_practice (user_id, parent_lesson_id, created_at desc);
create index if not exists idx_learning_progress_course on public.learning_progress (user_id, course_id, unit_id);

do $$
declare
    tbl text;
begin
    foreach tbl in array array[
        'courses','course_units','unit_skills','lessons','lesson_contents',
        'exercises','exercise_questions','answer_options','exercise_attempts',
        'user_answers','ai_generated_practice','learning_progress','source_references'
    ] loop
        execute format('alter table public.%I enable row level security', tbl);
        execute format('drop policy if exists "Users manage own %s" on public.%I', tbl, tbl);
        execute format('create policy "Users manage own %s" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', tbl, tbl);
    end loop;
end $$;

-- 12. Unified Learning History, AI Generated Exercises & Unlimited Question Sets (All 6 Skills)
create table if not exists public.ai_generated_exercises (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    skill text not null check (skill in ('reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar')),
    cefr_level text not null default 'B1' check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    difficulty text not null default 'medium',
    topic text not null default '',
    exercise_type text not null default 'mixed',
    title text not null,
    content jsonb not null default '{}'::jsonb,
    answer_key jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, id)
);

create table if not exists public.question_sets (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    lesson_id text not null,
    skill text not null check (skill in ('reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar')),
    set_number integer not null default 1,
    source_type text not null default 'ai_generated' check (source_type in ('original', 'ai_generated')),
    cefr_level text not null default 'B1',
    difficulty_mode text not null default 'same',
    question_count integer not null default 0,
    questions jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    primary key (user_id, id)
);

create table if not exists public.learning_history (
    id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    skill text not null check (skill in ('reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar')),
    source_scope text not null default 'standalone',
    lesson_id text not null,
    lesson_title text not null default '',
    question_set_id text not null default 'set-1',
    question_set_label text not null default 'Bộ câu hỏi 1',
    attempt_number integer not null default 1,
    exercise_type text not null default '',
    cefr_level text not null default 'B1',
    score_10 numeric(4,2) not null default 0,
    score_pct integer not null default 0,
    correct_count integer not null default 0,
    total_count integer not null default 0,
    duration_sec integer not null default 0,
    answers jsonb not null default '[]'::jsonb,
    wrong_items jsonb not null default '[]'::jsonb,
    ai_feedback jsonb not null default '{}'::jsonb,
    completed_at timestamptz not null default now(),
    primary key (user_id, id)
);

create index if not exists idx_ai_gen_ex_user_skill on public.ai_generated_exercises (user_id, skill, created_at desc);
create index if not exists idx_question_sets_lesson on public.question_sets (user_id, skill, lesson_id, set_number);
create index if not exists idx_learning_history_user_skill on public.learning_history (user_id, skill, completed_at desc);
create index if not exists idx_learning_history_qset on public.learning_history (user_id, lesson_id, question_set_id, attempt_number desc);

do $$
declare
    tbl text;
begin
    foreach tbl in array array['ai_generated_exercises', 'question_sets', 'learning_history'] loop
        execute format('alter table public.%I enable row level security', tbl);
        execute format('drop policy if exists "Users manage own %s" on public.%I', tbl, tbl);
        execute format('create policy "Users manage own %s" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', tbl, tbl);
    end loop;
end $$;

-- 13. Explicit least-privilege table grants for authenticated users (RLS still isolates by auth.uid())
grant usage on schema public to authenticated;
grant select, insert, update, delete on table
    public.qenglish_user_snapshots,
    public.user_profiles,
    public.user_study_snapshots,
    public.user_writing_submissions,
    public.user_materials,
    public.user_devices,
    public.user_writing_drafts,
    public.user_pdf_documents,
    public.user_pdf_courses,
    public.courses,
    public.course_units,
    public.unit_skills,
    public.lessons,
    public.lesson_contents,
    public.exercises,
    public.exercise_questions,
    public.answer_options,
    public.exercise_attempts,
    public.user_answers,
    public.ai_generated_practice,
    public.learning_progress,
    public.source_references,
    public.ai_generated_exercises,
    public.question_sets,
    public.learning_history
to authenticated;
