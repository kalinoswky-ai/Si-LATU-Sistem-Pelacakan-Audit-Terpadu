import { login } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-sm pt-24">
      <h1 className="mb-1 text-xl font-semibold">Masuk ke Si-LATU</h1>
      <p className="mb-6 text-sm text-slate-500">Sistem Pelacakan Audit Terpadu</p>

      {error && (
        <p className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>
      )}

      <form action={login} className="space-y-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Kata sandi</label>
          <input
            type="password"
            name="password"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Masuk
        </button>
      </form>
      <p className="mt-4 text-xs text-slate-400">
        Akun dibuat oleh admin melalui Supabase Auth — lihat README.md bagian &ldquo;Membuat pengguna pertama&rdquo;.
      </p>
    </main>
  );
}
