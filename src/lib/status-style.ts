export type StatusTone = 'neutral' | 'warning' | 'danger' | 'success' | 'info';

const TONE_BY_STATUS: Record<string, StatusTone> = {
  perencanaan: 'neutral',
  entry_meeting: 'neutral',
  proses_lapangan: 'warning',
  draft_laporan: 'danger',
  exit_meeting: 'neutral',
  keberatan: 'warning',
  final: 'success',
  tidak_dilanjutkan: 'danger',
  informasi_awal: 'neutral',
  verifikasi: 'warning',
  audit_lapangan: 'warning',
  gelar_perkara: 'warning',
  laporan_hasil: 'danger',
  rekomendasi_tl: 'warning',
  dihentikan: 'danger',
};

const CLASSES_BY_TONE: Record<StatusTone, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  success: 'bg-emerald-100 text-emerald-700',
  info: 'bg-blue-100 text-blue-700',
};

export function statusBadgeClass(kode: string): string {
  const tone = TONE_BY_STATUS[kode] ?? 'neutral';
  return `inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${CLASSES_BY_TONE[tone]}`;
}
