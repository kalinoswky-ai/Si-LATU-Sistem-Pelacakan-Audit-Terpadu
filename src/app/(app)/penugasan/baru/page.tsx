import { createClient } from '@/lib/supabase-server';
import { AUDIT_CATEGORY_LABEL, FLOW_BY_CATEGORY } from '@/types/database';
import { buatPenugasan } from './actions';

export const dynamic = 'force-dynamic';

export default async function FormPenugasanBaruPage() {
  const supabase = await createClient();

  const [{ data: entities }, { data: users }] = await Promise.all([
    supabase.from('entities').select('id, nama, tipe').order('nama'),
    supabase.from('users').select('id, nama, role').order('nama'),
  ]);

  const ketuaOptions = (users ?? []).filter((u) => u.role !== 'anggota_tim');

  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold">Tambah penugasan audit</h1>
      <p className="mb-6 text-sm text-slate-500">
        Isi detail penugasan untuk mulai memantau progresnya.
      </p>

      <form action={buatPenugasan} className="space-y-5 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Entitas yang diaudit</label>
          <select name="entity_id" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Pilih entitas...</option>
            {(entities ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.nama} ({e.tipe})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Jenis audit</label>
          <select name="jenis_audit" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            {Object.entries(AUDIT_CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label} — alur {FLOW_BY_CATEGORY[value as keyof typeof FLOW_BY_CATEGORY]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tahun anggaran</label>
            <input
              type="number"
              name="tahun"
              defaultValue={new Date().getFullYear()}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ketua tim</label>
            <select name="ketua_tim_id" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Pilih ketua tim...</option>
              {ketuaOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Anggota tim</label>
          <select
            name="anggota_tim_id"
            multiple
            className="h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {(users ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.nama}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">Tahan Ctrl/Cmd untuk memilih lebih dari satu.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal mulai</label>
            <input type="date" name="tanggal_mulai" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Target selesai</label>
            <input type="date" name="target_selesai" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Catatan awal (opsional)</label>
          <textarea
            name="catatan_awal"
            rows={3}
            placeholder="Ruang lingkup, dasar penugasan, dsb."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Simpan penugasan
          </button>
        </div>
      </form>
    </main>
  );
}
