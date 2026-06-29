import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { statusBadgeClass } from '@/lib/status-style';
import { AUDIT_CATEGORY_LABEL, type AuditAssignment } from '@/types/database';
import { logout } from '@/app/login/actions';

export const dynamic = 'force-dynamic';

async function getAssignments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('audit_assignments')
    .select(
      `id, jenis_audit, status_saat_ini, target_selesai,
       entities ( nama, tipe ),
       ketua:users!audit_assignments_ketua_tim_id_fkey ( nama )`
    )
    .order('created_at', { ascending: false });

  if (error) {
    return { rows: [] as AuditAssignment[], error: error.message };
  }
  return { rows: (data ?? []) as unknown as AuditAssignment[], error: null };
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone ?? ''}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const { rows, error } = await getAssignments();

  const total = rows.length;
  const final = rows.filter((r) => r.status_saat_ini === 'final').length;
  const isuTerbuka = 0; // diisi setelah modul isu terhubung penuh di iterasi berikutnya

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Penugasan Audit</h1>
          <p className="text-sm text-slate-500">Si-LATU — Inspektorat Kabupaten Sumba Barat</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/penugasan/baru"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Tambah penugasan
          </Link>
          <form action={logout}>
            <button type="submit" className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100">
              Keluar
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
          Belum bisa memuat data dari Supabase: {error}. Pastikan{' '}
          <code className="font-mono">.env.local</code> sudah diisi dan migrasi sudah dijalankan
          (lihat README.md).
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Penugasan aktif" value={total} />
        <Metric label="Final bulan ini" value={final} />
        <Metric label="Isu terbuka" value={isuTerbuka} tone="text-rose-600" />
        <Metric label="Menunggu Pimpinan" value="—" tone="text-amber-600" />
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2">Entitas</th>
              <th className="px-4 py-2">Objek</th>
              <th className="px-4 py-2">Jenis audit</th>
              <th className="px-4 py-2">Ketua tim</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Target</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Belum ada penugasan. Klik &ldquo;Tambah penugasan&rdquo; untuk mulai.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/penugasan/${row.id}`} className="font-medium text-slate-900 hover:underline">
                    {row.entities?.nama ?? '—'}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{row.entities?.tipe ?? '—'}</td>
                <td className="px-4 py-3">{AUDIT_CATEGORY_LABEL[row.jenis_audit]}</td>
                <td className="px-4 py-3 text-slate-500">{row.ketua?.nama ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={statusBadgeClass(row.status_saat_ini)}>{row.status_saat_ini}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{row.target_selesai ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
