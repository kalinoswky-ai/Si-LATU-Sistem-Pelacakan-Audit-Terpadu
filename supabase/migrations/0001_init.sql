-- ============================================================
-- Si-LATU (Sistem Pelacakan Audit Terpadu)
-- Migrasi awal: skema, alur status, RLS, dan trigger validasi
-- ============================================================

create extension if not exists "pgcrypto";

-- ===================== ENUM & TIPE =====================

create type user_role as enum ('admin', 'ketua_tim', 'anggota_tim', 'pimpinan');
create type entity_type as enum ('PD_UK', 'DESA');
create type audit_category as enum (
  'AUDIT_KEUANGAN', 'AUDIT_KINERJA', 'AUDIT_KETAATAN', 'AUDIT_INVESTIGATIF'
);

-- ===================== TABEL MASTER =====================

create table users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique, -- relasi ke auth.users milik Supabase
  nama varchar(150) not null,
  nip varchar(30) unique,
  role user_role not null default 'anggota_tim',
  email varchar(150) unique not null,
  created_at timestamptz default now()
);

create table entities (
  id uuid primary key default gen_random_uuid(),
  nama varchar(150) not null,
  tipe entity_type not null,
  kecamatan varchar(100),
  latitude decimal(10,6),
  longitude decimal(10,6),
  created_at timestamptz default now()
);

create table audit_category_flow (
  audit_category audit_category primary key,
  flow_key varchar(20) not null
);

insert into audit_category_flow (audit_category, flow_key) values
  ('AUDIT_KEUANGAN', 'REGULATIF'),
  ('AUDIT_KINERJA', 'REGULATIF'),
  ('AUDIT_KETAATAN', 'REGULATIF'),
  ('AUDIT_INVESTIGATIF', 'INVESTIGATIF');

create table status_master (
  id uuid primary key default gen_random_uuid(),
  flow_key varchar(20) not null,
  kode varchar(40) not null,
  nama varchar(100) not null,
  urutan int not null,
  is_terminal boolean default false,
  unique (flow_key, kode)
);

insert into status_master (flow_key, kode, nama, urutan, is_terminal) values
  ('REGULATIF', 'perencanaan', 'Perencanaan', 1, false),
  ('REGULATIF', 'entry_meeting', 'Entry meeting', 2, false),
  ('REGULATIF', 'proses_lapangan', 'Proses lapangan', 3, false),
  ('REGULATIF', 'draft_laporan', 'Draft laporan', 4, false),
  ('REGULATIF', 'exit_meeting', 'Exit meeting', 5, false),
  ('REGULATIF', 'keberatan', 'Keberatan', 6, false),
  ('REGULATIF', 'final', 'Final', 7, true),
  ('REGULATIF', 'tidak_dilanjutkan', 'Tidak dilanjutkan', 8, true),
  ('INVESTIGATIF', 'informasi_awal', 'Informasi awal', 1, false),
  ('INVESTIGATIF', 'verifikasi', 'Verifikasi', 2, false),
  ('INVESTIGATIF', 'audit_lapangan', 'Audit lapangan', 3, false),
  ('INVESTIGATIF', 'gelar_perkara', 'Gelar perkara internal', 4, false),
  ('INVESTIGATIF', 'laporan_hasil', 'Laporan hasil', 5, false),
  ('INVESTIGATIF', 'rekomendasi_tl', 'Rekomendasi tindak lanjut', 6, false),
  ('INVESTIGATIF', 'final', 'Final', 7, true),
  ('INVESTIGATIF', 'dihentikan', 'Dihentikan', 8, true);

create table transition_rules (
  id uuid primary key default gen_random_uuid(),
  flow_key varchar(20) not null,
  dari_status varchar(40) not null,
  ke_status varchar(40) not null,
  role_minimal user_role not null,
  wajib_catatan boolean default false,
  keterangan text
);

insert into transition_rules (flow_key, dari_status, ke_status, role_minimal, wajib_catatan, keterangan) values
  ('REGULATIF', 'perencanaan', 'entry_meeting', 'ketua_tim', false, 'Program audit & KKA disetujui'),
  ('REGULATIF', 'entry_meeting', 'proses_lapangan', 'ketua_tim', false, null),
  ('REGULATIF', 'proses_lapangan', 'draft_laporan', 'ketua_tim', false, 'Bukti audit cukup'),
  ('REGULATIF', 'draft_laporan', 'exit_meeting', 'pimpinan', false, 'Quality gate Pengendali Teknis'),
  ('REGULATIF', 'exit_meeting', 'keberatan', 'ketua_tim', true, 'Entitas mengajukan keberatan'),
  ('REGULATIF', 'keberatan', 'exit_meeting', 'ketua_tim', true, 'Setelah klarifikasi'),
  ('REGULATIF', 'exit_meeting', 'final', 'pimpinan', false, null),
  ('REGULATIF', 'perencanaan', 'tidak_dilanjutkan', 'pimpinan', true, null),
  ('REGULATIF', 'entry_meeting', 'tidak_dilanjutkan', 'pimpinan', true, null),
  ('REGULATIF', 'proses_lapangan', 'tidak_dilanjutkan', 'pimpinan', true, null),
  ('REGULATIF', 'draft_laporan', 'tidak_dilanjutkan', 'pimpinan', true, null),
  ('REGULATIF', 'exit_meeting', 'tidak_dilanjutkan', 'pimpinan', true, null),
  ('INVESTIGATIF', 'informasi_awal', 'verifikasi', 'ketua_tim', false, null),
  ('INVESTIGATIF', 'verifikasi', 'audit_lapangan', 'pimpinan', false, 'Persetujuan karena dugaan pelanggaran'),
  ('INVESTIGATIF', 'verifikasi', 'dihentikan', 'pimpinan', true, 'Bukti awal tidak cukup'),
  ('INVESTIGATIF', 'audit_lapangan', 'gelar_perkara', 'ketua_tim', false, null),
  ('INVESTIGATIF', 'gelar_perkara', 'audit_lapangan', 'ketua_tim', true, 'Perlu pendalaman tambahan'),
  ('INVESTIGATIF', 'gelar_perkara', 'laporan_hasil', 'pimpinan', false, null),
  ('INVESTIGATIF', 'gelar_perkara', 'dihentikan', 'pimpinan', true, null),
  ('INVESTIGATIF', 'laporan_hasil', 'rekomendasi_tl', 'pimpinan', false, null),
  ('INVESTIGATIF', 'rekomendasi_tl', 'final', 'pimpinan', true, 'Termasuk keputusan limpah ke APH'),
  ('INVESTIGATIF', 'rekomendasi_tl', 'dihentikan', 'pimpinan', true, null);

-- ===================== TABEL TRANSAKSI =====================

create table audit_assignments (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references entities(id),
  ketua_tim_id uuid not null references users(id),
  jenis_audit audit_category not null,
  tahun int not null default extract(year from now()),
  tanggal_mulai date,
  target_selesai date,
  status_saat_ini varchar(40) not null default 'perencanaan',
  catatan_awal text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table assignment_members (
  assignment_id uuid references audit_assignments(id) on delete cascade,
  user_id uuid references users(id),
  peran varchar(50) default 'anggota',
  primary key (assignment_id, user_id)
);

create table status_history (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references audit_assignments(id) on delete cascade,
  status varchar(40) not null,
  changed_by uuid references users(id),
  changed_at timestamptz default now(),
  catatan text
);

create table issues (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references audit_assignments(id) on delete cascade,
  deskripsi text not null,
  dilaporkan_oleh uuid references users(id),
  dilaporkan_pada timestamptz default now(),
  status varchar(20) default 'open'
);

create table problem_solving (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  solusi text not null,
  diselesaikan_oleh uuid references users(id),
  diselesaikan_pada timestamptz default now()
);

create table pdca_meetings (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null,
  tempat varchar(150),
  waktu varchar(50),
  notulen_oleh uuid references users(id)
);

create table meeting_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references pdca_meetings(id) on delete cascade,
  assignment_id uuid references audit_assignments(id),
  issue_id uuid references issues(id),
  catatan_diskusi text
);

create table notifikasi (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  assignment_id uuid references audit_assignments(id),
  jenis varchar(30),
  pesan text,
  dibaca boolean default false,
  dibuat_pada timestamptz default now()
);

-- ===================== FUNGSI BANTUAN =====================

create or replace function fn_user_role() returns user_role
language sql security definer stable as $$
  select role from users where auth_user_id = auth.uid();
$$;

create or replace function fn_current_user_id() returns uuid
language sql security definer stable as $$
  select id from users where auth_user_id = auth.uid();
$$;

create or replace function fn_can_access_assignment(p_assignment_id uuid) returns boolean
language plpgsql security definer stable as $$
declare
  v_category audit_category;
  v_ketua uuid;
  v_role user_role;
  v_uid uuid;
begin
  select jenis_audit, ketua_tim_id into v_category, v_ketua
  from audit_assignments where id = p_assignment_id;

  if v_category is distinct from 'AUDIT_INVESTIGATIF' then
    return true;
  end if;

  v_role := fn_user_role();
  if v_role in ('pimpinan', 'admin') then
    return true;
  end if;

  v_uid := fn_current_user_id();
  if v_ketua = v_uid then
    return true;
  end if;

  return exists (
    select 1 from assignment_members
    where assignment_id = p_assignment_id and user_id = v_uid
  );
end;
$$;

create or replace function fn_role_meets_minimum(actor user_role, minimal user_role) returns boolean
language sql immutable as $$
  select case minimal
    when 'anggota_tim' then actor in ('anggota_tim','ketua_tim','pimpinan','admin')
    when 'ketua_tim'   then actor in ('ketua_tim','pimpinan','admin')
    when 'pimpinan'    then actor in ('pimpinan','admin')
    when 'admin'       then actor = 'admin'
  end;
$$;

-- ===================== TRIGGER VALIDASI TRANSISI STATUS =====================

create or replace function fn_validate_status_transition()
returns trigger language plpgsql security definer as $$
declare
  v_flow varchar(20);
  v_role_minimal user_role;
  v_wajib_catatan boolean;
  v_actor_role user_role;
begin
  if new.status_saat_ini = old.status_saat_ini then
    return new;
  end if;

  select flow_key into v_flow from audit_category_flow where audit_category = new.jenis_audit;

  select role_minimal, wajib_catatan into v_role_minimal, v_wajib_catatan
  from transition_rules
  where flow_key = v_flow and dari_status = old.status_saat_ini and ke_status = new.status_saat_ini;

  if v_role_minimal is null then
    raise exception 'Transisi % -> % tidak terdaftar untuk alur %', old.status_saat_ini, new.status_saat_ini, v_flow;
  end if;

  v_actor_role := fn_user_role();

  if not fn_role_meets_minimum(v_actor_role, v_role_minimal) then
    raise exception 'Peran % belum memenuhi syarat minimal % untuk transisi ini', v_actor_role, v_role_minimal;
  end if;

  if v_wajib_catatan and (new.catatan_transisi is null or length(trim(new.catatan_transisi)) = 0) then
    raise exception 'Transisi ini wajib disertai catatan alasan';
  end if;

  insert into status_history (assignment_id, status, changed_by, catatan)
  values (new.id, new.status_saat_ini, fn_current_user_id(), new.catatan_transisi);

  return new;
end;
$$;

alter table audit_assignments add column catatan_transisi text;

create trigger trg_validate_status_transition
  before update of status_saat_ini on audit_assignments
  for each row execute function fn_validate_status_transition();

-- Catat status_history awal saat penugasan baru dibuat
create or replace function fn_log_initial_status()
returns trigger language plpgsql security definer as $$
begin
  insert into status_history (assignment_id, status, changed_by, catatan)
  values (new.id, new.status_saat_ini, fn_current_user_id(), 'Penugasan dibuat');
  return new;
end;
$$;

create trigger trg_log_initial_status
  after insert on audit_assignments
  for each row execute function fn_log_initial_status();

-- ===================== ROW LEVEL SECURITY =====================

alter table users enable row level security;
alter table entities enable row level security;
alter table audit_assignments enable row level security;
alter table assignment_members enable row level security;
alter table status_history enable row level security;
alter table issues enable row level security;
alter table problem_solving enable row level security;
alter table pdca_meetings enable row level security;
alter table meeting_items enable row level security;
alter table status_master enable row level security;
alter table transition_rules enable row level security;
alter table audit_category_flow enable row level security;
alter table notifikasi enable row level security;

create policy sel_users on users for select using ( true );
create policy upd_users_self on users for update
  using ( auth_user_id = auth.uid() )
  with check ( auth_user_id = auth.uid() and role = (select role from users where auth_user_id = auth.uid()) );
create policy upd_users_admin on users for update using ( fn_user_role() = 'admin' );

create policy sel_entities on entities for select using ( true );
create policy mod_entities on entities for all using ( fn_user_role() in ('admin','ketua_tim') );

create policy sel_audit_assignments on audit_assignments for select using ( fn_can_access_assignment(id) );
create policy ins_audit_assignments on audit_assignments for insert with check ( fn_user_role() in ('ketua_tim','pimpinan','admin') );
create policy upd_audit_assignments on audit_assignments for update using ( fn_can_access_assignment(id) ) with check ( fn_can_access_assignment(id) );
create policy del_audit_assignments on audit_assignments for delete using ( fn_user_role() = 'admin' );

create policy sel_assignment_members on assignment_members for select using ( fn_can_access_assignment(assignment_id) );
create policy mod_assignment_members on assignment_members for all using (
  fn_user_role() = 'admin' or exists (
    select 1 from audit_assignments a where a.id = assignment_id and a.ketua_tim_id = fn_current_user_id()
  )
);

create policy sel_status_history on status_history for select using ( fn_can_access_assignment(assignment_id) );
create policy ins_status_history on status_history for insert with check ( fn_can_access_assignment(assignment_id) );

create policy sel_issues on issues for select using ( fn_can_access_assignment(assignment_id) );
create policy ins_issues on issues for insert with check ( fn_can_access_assignment(assignment_id) );
create policy upd_issues on issues for update using (
  fn_can_access_assignment(assignment_id) and (
    dilaporkan_oleh = fn_current_user_id() or fn_user_role() in ('ketua_tim','pimpinan','admin')
  )
);

create policy sel_problem_solving on problem_solving for select using (
  fn_can_access_assignment( (select assignment_id from issues where id = issue_id) )
);
create policy ins_problem_solving on problem_solving for insert with check ( fn_user_role() in ('ketua_tim','pimpinan','admin') );

create policy sel_pdca_meetings on pdca_meetings for select using ( true );
create policy ins_pdca_meetings on pdca_meetings for insert with check ( fn_user_role() in ('ketua_tim','pimpinan','admin') );

create policy sel_meeting_items on meeting_items for select using ( assignment_id is null or fn_can_access_assignment(assignment_id) );
create policy ins_meeting_items on meeting_items for insert with check ( fn_user_role() in ('ketua_tim','pimpinan','admin') );

create policy sel_status_master on status_master for select using ( true );
create policy mod_status_master on status_master for all using ( fn_user_role() = 'admin' ) with check ( fn_user_role() = 'admin' );

create policy sel_transition_rules on transition_rules for select using ( true );
create policy mod_transition_rules on transition_rules for all using ( fn_user_role() = 'admin' ) with check ( fn_user_role() = 'admin' );

create policy sel_audit_category_flow on audit_category_flow for select using ( true );

create policy sel_notifikasi on notifikasi for select using ( user_id = fn_current_user_id() or fn_user_role() in ('pimpinan','admin') );
create policy ins_notifikasi on notifikasi for insert with check ( true );
create policy upd_notifikasi on notifikasi for update using ( user_id = fn_current_user_id() );

-- ===================== VIEW PERINGATAN DINI =====================

create or replace view v_peringatan_dini as
select
  a.id as assignment_id,
  e.nama as entitas,
  a.jenis_audit,
  a.status_saat_ini,
  a.target_selesai,
  case
    when a.target_selesai < current_date and a.status_saat_ini not in ('final','tidak_dilanjutkan','dihentikan')
      then 'lewat_target'
    when (select max(changed_at) from status_history where assignment_id = a.id) < now() - interval '14 days'
      then 'macet'
  end as tipe_peringatan
from audit_assignments a
join entities e on e.id = a.entity_id
where a.status_saat_ini not in ('final', 'tidak_dilanjutkan', 'dihentikan');
