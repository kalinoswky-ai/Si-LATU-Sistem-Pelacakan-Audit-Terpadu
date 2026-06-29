export type UserRole = 'admin' | 'ketua_tim' | 'anggota_tim' | 'pimpinan';
export type EntityType = 'PD_UK' | 'DESA';
export type AuditCategory =
  | 'AUDIT_KEUANGAN'
  | 'AUDIT_KINERJA'
  | 'AUDIT_KETAATAN'
  | 'AUDIT_INVESTIGATIF';

export const AUDIT_CATEGORY_LABEL: Record<AuditCategory, string> = {
  AUDIT_KEUANGAN: 'Audit Keuangan',
  AUDIT_KINERJA: 'Audit Kinerja',
  AUDIT_KETAATAN: 'Audit Ketaatan',
  AUDIT_INVESTIGATIF: 'Audit Investigatif',
};

export interface AppUser {
  id: string;
  auth_user_id: string | null;
  nama: string;
  nip: string | null;
  role: UserRole;
  email: string;
}

export interface Entity {
  id: string;
  nama: string;
  tipe: EntityType;
  kecamatan: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface AuditAssignment {
  id: string;
  entity_id: string;
  ketua_tim_id: string;
  jenis_audit: AuditCategory;
  tahun: number;
  tanggal_mulai: string | null;
  target_selesai: string | null;
  status_saat_ini: string;
  catatan_awal: string | null;
  created_at: string;
  // hasil join, diisi oleh query
  entities?: Entity;
  ketua?: AppUser;
}

export interface StatusHistoryRow {
  id: string;
  assignment_id: string;
  status: string;
  changed_by: string | null;
  changed_at: string;
  catatan: string | null;
  users?: AppUser;
}

export interface IssueRow {
  id: string;
  assignment_id: string;
  deskripsi: string;
  dilaporkan_oleh: string | null;
  dilaporkan_pada: string;
  status: 'open' | 'resolved';
  problem_solving?: ProblemSolvingRow[];
}

export interface ProblemSolvingRow {
  id: string;
  issue_id: string;
  solusi: string;
  diselesaikan_oleh: string | null;
  diselesaikan_pada: string;
}

export interface StatusMasterRow {
  flow_key: 'REGULATIF' | 'INVESTIGATIF';
  kode: string;
  nama: string;
  urutan: number;
  is_terminal: boolean;
}

export const FLOW_BY_CATEGORY: Record<AuditCategory, 'REGULATIF' | 'INVESTIGATIF'> = {
  AUDIT_KEUANGAN: 'REGULATIF',
  AUDIT_KINERJA: 'REGULATIF',
  AUDIT_KETAATAN: 'REGULATIF',
  AUDIT_INVESTIGATIF: 'INVESTIGATIF',
};
