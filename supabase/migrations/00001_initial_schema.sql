-- Form creators
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz default now()
);

-- Uploaded forms and their generated structure
create table forms (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references profiles(id) not null,
  title text not null,
  description text,
  original_file_url text,
  share_token text unique not null,
  status text default 'draft',
  respondent_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Individual fields in a form
create table form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references forms(id) on delete cascade not null,
  label text not null,
  type text not null,
  placeholder text,
  required boolean default false,
  options jsonb,
  sort_order integer not null,
  created_at timestamptz default now()
);

-- Completed form submissions
create table submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references forms(id) not null,
  respondent_email text not null,
  respondent_name text,
  pdf_url text,
  submitted_at timestamptz default now()
);

-- Individual field values in a submission
create table submission_values (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id) on delete cascade not null,
  field_id uuid references form_fields(id) not null,
  value text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_forms_creator on forms(creator_id);
create index idx_forms_share_token on forms(share_token);
create index idx_form_fields_form on form_fields(form_id);
create index idx_submissions_form on submissions(form_id);
create index idx_submission_values_submission on submission_values(submission_id);

-- RLS policies
alter table profiles enable row level security;
alter table forms enable row level security;
alter table form_fields enable row level security;
alter table submissions enable row level security;
alter table submission_values enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Forms: creators can CRUD their own forms
create policy "Users can view own forms" on forms for select using (auth.uid() = creator_id);
create policy "Users can insert own forms" on forms for insert with check (auth.uid() = creator_id);
create policy "Users can update own forms" on forms for update using (auth.uid() = creator_id);
create policy "Users can delete own forms" on forms for delete using (auth.uid() = creator_id);
-- Published forms can be read by anyone (for public form filling)
create policy "Anyone can view published forms" on forms for select using (status = 'published');

-- Form fields: accessible if you can access the form
create policy "Users can view own form fields" on form_fields for select
  using (exists (select 1 from forms where forms.id = form_fields.form_id and forms.creator_id = auth.uid()));
create policy "Users can insert own form fields" on form_fields for insert
  with check (exists (select 1 from forms where forms.id = form_fields.form_id and forms.creator_id = auth.uid()));
create policy "Users can update own form fields" on form_fields for update
  using (exists (select 1 from forms where forms.id = form_fields.form_id and forms.creator_id = auth.uid()));
create policy "Users can delete own form fields" on form_fields for delete
  using (exists (select 1 from forms where forms.id = form_fields.form_id and forms.creator_id = auth.uid()));
-- Public: anyone can read fields of published forms
create policy "Anyone can view published form fields" on form_fields for select
  using (exists (select 1 from forms where forms.id = form_fields.form_id and forms.status = 'published'));

-- Submissions: creators can view submissions for their forms
create policy "Creators can view submissions" on submissions for select
  using (exists (select 1 from forms where forms.id = submissions.form_id and forms.creator_id = auth.uid()));
-- Anyone can insert submissions (for public form filling, uses service role for the actual insert)
create policy "Anyone can insert submissions" on submissions for insert with check (true);

-- Submission values: accessible if you can access the submission
create policy "Creators can view submission values" on submission_values for select
  using (exists (
    select 1 from submissions s
    join forms f on f.id = s.form_id
    where s.id = submission_values.submission_id and f.creator_id = auth.uid()
  ));
create policy "Anyone can insert submission values" on submission_values for insert with check (true);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage bucket for form uploads and PDFs
insert into storage.buckets (id, name, public) values ('forms', 'forms', true);
insert into storage.buckets (id, name, public) values ('submissions', 'submissions', true);
