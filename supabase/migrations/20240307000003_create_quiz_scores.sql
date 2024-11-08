-- Create quiz_scores table
create table quiz_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  assignment_id uuid references assignments on delete cascade not null,
  score integer not null,
  correct_answers integer not null,
  total_questions integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint unique_user_assignment unique (user_id, assignment_id)
);

-- Set up RLS
alter table quiz_scores enable row level security;

-- Create indexes
create index quiz_scores_user_id_idx on quiz_scores(user_id);
create index quiz_scores_assignment_id_idx on quiz_scores(assignment_id);

-- Set up RLS policies
create policy "Users can view their own scores"
  on quiz_scores for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own scores"
  on quiz_scores for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own scores"
  on quiz_scores for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Set up updated_at trigger
create trigger on_quiz_score_updated
  before update on quiz_scores
  for each row
  execute function handle_updated_at();