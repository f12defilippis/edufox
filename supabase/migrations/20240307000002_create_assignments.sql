-- Create assignments table
create table assignments (
  id uuid primary key default uuid_generate_v4(),
  subject text not null,
  due_date date not null,
  teacher_id uuid references auth.users on delete cascade not null,
  questions jsonb not null default '[]',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Set up RLS
alter table assignments enable row level security;

-- Create indexes
create index assignments_teacher_id_idx on assignments(teacher_id);
create index assignments_due_date_idx on assignments(due_date);

-- Set up RLS policies
create policy "Assignments are viewable by authenticated users"
  on assignments for select
  to authenticated
  using (true);

create policy "Teachers can insert their own assignments"
  on assignments for insert
  to authenticated
  with check (auth.uid() = teacher_id);

create policy "Teachers can update their own assignments"
  on assignments for update
  to authenticated
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

create policy "Teachers can delete their own assignments"
  on assignments for delete
  to authenticated
  using (auth.uid() = teacher_id);

-- Set up updated_at trigger
create trigger on_assignment_updated
  before update on assignments
  for each row
  execute function handle_updated_at();