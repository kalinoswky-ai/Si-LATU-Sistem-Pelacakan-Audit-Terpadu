import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { statusBadgeClass } from '@/lib/status-style';
import { AUDIT_CATEGORY_LABEL, FLOW_BY_CATEGORY, type AuditAssignment, type IssueRow, type StatusHistoryRow, type StatusMasterRow } from '@/types/database';
import { ubahStatus, catatIsu, catatSolusi } from './actions';

export const dynamic = 'force-dynamic';

export default async function DetailPenugasanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assignment, error } = await supabase
    .from('audit_assignments')
    .select(
      `*, entities ( nama, tipe ), ketua:users!audit_assignments_ketua_tim_id_fkey ( nama )`
    )
    .eq('id', id)
    .single();

  if (error || !assignment) {
    return (
      <main className="mx-auto max-w-2xl">
        <p className="rounded-md bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">
          Penugasan tidak ditemukan atau Anda tidak memiliki akses untuk melihatnya.
          {error?.message ? ` (${error.message})` : ''}
        </p>
        <Link href="/" className="mt-4 inline-block text-sm text-slate-500 hover:underline">
          &larr; Kembali ke dashboard
        </Link>
      </main>
    );
  }

  const row = assignment as unknown as AuditAssignment;
  const flow = FLOW_BY_CATEGORY[row.jenis_audit];

  const [{ data: statusOptions }, { data: history }, { data: issues }] = await Promise.all([
    supabase
      .from('status_master')
      .select('flow_key, kode, nama, urutan, is_terminal')
      .eq('flow_key', flow)
      .order('urutan'),
    supabase
      .from('status_history')
      .select(`id, status, changed_at, catatan, users ( nama )`)
      .eq('assignment_id', id)
      .order('changed_at', { ascending: true }),
    supabase
      .from('issues')
      .select(`id, deskripsi, status, dilaporkan_pada, problem_solving ( id, solusi, diselesaikan_pada )`)
      .eq('assignment_id', id)
      .order('dilaporkan_pada', { ascending: false }),
  ]);

  const statusList = (statusOptions ?? []) as StatusMasterRow[];
  const historyList = (history ?? []) as unknown as StatusHistoryRow[];
  const issueList = (issues ?? []) as unknown as IssueRow[];

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <Link href="/" className="text-sm text-slate-500 hover:underline">
        &larr; Kembali ke dashboard
      </Link>

      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">{row.entities?.nama}</h1>
            <p className="text-sm text-slate-500">
              {AUDIT_CATEGORY_LABEL[row.jenis_audit]} &middot; Tahun {row.tahun} &middot; Ketua tim: {row.ketua?.nama ?? '—'}
            </p>
          </div>
          <span className={statusBadgeClass(row.status_saat_ini)}>{row.status_saat_ini}</span>
        </div>
        <div className="mt-4 flex gap-6 border-t border-slate-100 pt-4 text-sm">
          <div>
            <p className="text-slate-500">Mulai</p>
            <p>{row.tanggal_mulai ?? '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Target selesai</p>
            <p>{row.target_selesai ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Ubah status */}
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-3 font-medium">Ubah status</h2>
        <form action={ubahStatus.bind(null, row.id)} className="flex flex-wrap items-end gap-3">
          <select name="status_baru" required className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Pilih status tujuan...</option>
            {statusList.map((s) => (
              <option key={s.kode} value={s.kode}>
                {s.nama}
              </option>
            ))}
          </select>
          <input
            name="catatan_transisi"
            placeholder="Catatan (wajib untuk transisi tertentu)"
            className="min-w-[16rem] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Simpan
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-400">
          Transisi divalidasi oleh trigger basis data sesuai peran Anda — penolakan akan muncul sebagai pesan error.
        </p>
      </div>

      {/* Linimasa status */}
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 font-medium">Linimasa status</h2>
        <ol className="space-y-4 border-l border-slate-200 pl-4">
          {historyList.length === 0 && <p className="text-sm text-slate-400">Belum ada riwayat status.</p>}
          {historyList.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-slate-400" />
              <p className="text-sm font-medium">{h.status}</p>
              <p className="text-xs text-slate-400">
                {new Date(h.changed_at).toLocaleString('id-ID')} &middot; oleh {h.users?.nama ?? 'sistem'}
              </p>
              {h.catatan && <p className="mt-1 text-sm text-slate-600">{h.catatan}</p>}
            </li>
          ))}
        </ol>
      </div>

      {/* Isu & tindak lanjut */}
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 font-medium">Isu &amp; tindak lanjut</h2>

        <form action={catatIsu.bind(null, row.id)} className="mb-5 flex gap-3">
          <input
            name="deskripsi"
            required
            placeholder="Catat isu/kendala baru..."
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
            Catat isu
          </button>
        </form>

        <div className="space-y-3">
          {issueList.length === 0 && <p className="text-sm text-slate-400">Belum ada isu tercatat.</p>}
          {issueList.map((issue) => (
            <div
              key={issue.id}
              className={`rounded-md border p-3 ${issue.status === 'open' ? 'border-rose-200' : 'border-slate-200'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{issue.deskripsi}</p>
                <span
                  className={`whitespace-nowrap rounded-md px-2 py-0.5 text-xs ${
                    issue.status === 'open' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {issue.status === 'open' ? 'Terbuka' : 'Selesai'}
                </span>
              </div>

              {issue.problem_solving && issue.problem_solving.length > 0 && (
                <div className="mt-2 border-t border-slate-100 pt-2 text-sm text-slate-600">
                  {issue.problem_solving.map((sol) => (
                    <p key={sol.id}>&#8627; {sol.solusi}</p>
                  ))}
                </div>
              )}

              {issue.status === 'open' && (
                <form action={catatSolusi.bind(null, issue.id, row.id)} className="mt-2 flex gap-2">
                  <input
                    name="solusi"
                    required
                    placeholder="Tulis solusi/tindak lanjut..."
                    className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                  <button type="submit" className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700">
                    Selesaikan
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
