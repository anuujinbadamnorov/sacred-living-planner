-- Habit completions table (for D3: tracking which habits are done on which days)
create table if not exists habit_completions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  habit_id uuid references habits(id) on delete cascade not null,
  completed_date date not null,
  created_at timestamp with time zone default now(),
  unique(user_id, habit_id, completed_date)
);

alter table habit_completions enable row level security;

create policy "Users can only see their own habit completions"
  on habit_completions for all
  using (auth.uid() = user_id);
