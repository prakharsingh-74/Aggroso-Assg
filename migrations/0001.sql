CREATE TABLE IF NOT EXISTS projects (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS documents (
  id text primary key default gen_random_uuid()::text,
  project_id text references projects(id) on delete cascade,
  type text not null,
  filename text not null,
  file_hash text not null,
  created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS requirements (
  id text primary key default gen_random_uuid()::text,
  project_id text references projects(id) on delete cascade,
  source_document_id text references documents(id) on delete set null,
  text text not null,
  category text not null,
  importance text not null,
  evidence_expected text,
  source_page_number integer,
  source_quote text
);

CREATE TABLE IF NOT EXISTS assessments (
  id text primary key default gen_random_uuid()::text,
  project_id text references projects(id) on delete cascade,
  guideline_id text references documents(id) on delete set null,
  application_id text references documents(id) on delete set null,
  status text not null,
  completion_percentage numeric default 0,
  created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS evidence_mappings (
  id text primary key default gen_random_uuid()::text,
  assessment_id text references assessments(id) on delete cascade,
  requirement_id text references requirements(id) on delete cascade,
  status text not null,
  explanation text not null,
  missing_evidence text,
  confidence text not null default 'medium'
);

CREATE TABLE IF NOT EXISTS evidences (
  id text primary key default gen_random_uuid()::text,
  mapping_id text references evidence_mappings(id) on delete cascade,
  document_id text not null,
  page_number integer not null default 1,
  quote text not null
);

CREATE TABLE IF NOT EXISTS unsupported_claims (
  id text primary key default gen_random_uuid()::text,
  assessment_id text references assessments(id) on delete cascade,
  claim text not null,
  document_id text not null,
  page_number integer not null default 1,
  quote text not null,
  explanation text not null,
  supporting_evidence_found boolean not null default false,
  suggested_evidence text
);

CREATE TABLE IF NOT EXISTS clarification_questions (
  id text primary key default gen_random_uuid()::text,
  assessment_id text references assessments(id) on delete cascade,
  question text not null,
  context text
);

CREATE TABLE IF NOT EXISTS review_actions (
  id text primary key default gen_random_uuid()::text,
  mapping_id text references evidence_mappings(id) on delete cascade,
  user_id text,
  old_status text,
  new_status text not null,
  reason text,
  timestamp timestamp with time zone default now()
);
