# Si-LATU — Sistem Pelacakan Audit Terpadu

Audit Progress Tracker berbasis PDCA untuk Inspektorat Kabupaten Sumba Barat.
Dibangun dengan Next.js 14 (App Router) + Supabase (PostgreSQL + Auth) + Tailwind CSS.

Ini adalah **Iterasi 1** dari rancangan aktualisasi: skema inti, alur status (state
machine) untuk 4 jenis audit, Row Level Security, serta tiga halaman utama
(Dashboard, Form Penugasan Baru, Detail Penugasan dengan linimasa & isu).

## 1. Buat project Supabase

1. Buka [supabase.com](https://supabase.com) → New Project (gratis).
2. Setelah project siap, buka **Project Settings → API** dan catat:
   - `Project URL` https://ehuirfiletraulpfyobu.supabase.co/rest/v1/
   - `anon public key`

## 2. Jalankan migrasi database

1. Buka **SQL Editor** di dashboard Supabase.
2. Tempel seluruh isi `supabase/migrations/0001_init.sql`, lalu jalankan (Run).
   File ini berisi: tabel, enum, dua alur status (Regulatif & Investigatif),
   aturan transisi, trigger validasi, dan seluruh kebijakan RLS yang sudah
   kita rancang.

## 3. Buat pengguna pertama

RLS pada sistem ini bergantung pada akun Supabase Auth yang terhubung ke
tabel `users`. Lakukan untuk setiap auditor:

1. Buka **Authentication → Users → Add user** di dashboard Supabase, isi
   email & password (misalnya untuk diri sendiri sebagai `pimpinan` dulu agar
   bisa mengakses semua data saat uji coba).
2. Salin `User UID` yang muncul.
3. Di **SQL Editor**, jalankan (sesuaikan nilai):

   ```sql
   insert into users (auth_user_id, nama, email, role)
   values ('TEMPEL-USER-UID-DI-SINI', 'Nama Anda', 'email@anda.com', 'pimpinan');
   ```

4. Ulangi untuk peran lain yang ingin diuji: `ketua_tim`, `anggota_tim`, `admin`.

## 4. (Opsional) Tambahkan data entitas contoh

```sql
insert into entities (nama, tipe, kecamatan) values
  ('Dinas Kesehatan', 'PD_UK', null),
  ('Dinas Sosial', 'PD_UK', null),
  ('Desa Tana Mbanas', 'DESA', 'Loli');
```

## 5. Konfigurasi environment

```bash
cp .env.local.example .env.local
```

Isi `.env.local` dengan `Project URL` dan `anon public key` dari Langkah 1.

## 6. Jalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) → akan diarahkan ke `/login`.
Masuk dengan akun yang dibuat pada Langkah 3.

## 7. Deploy ke Vercel

1. Push folder ini ke repository GitHub baru.
2. Di [vercel.com](https://vercel.com) → New Project → import repo tersebut.
3. Tambahkan dua environment variable yang sama seperti `.env.local`.
4. Deploy.

## Struktur proyek

```
supabase/migrations/0001_init.sql   Skema, alur status, RLS, trigger (Langkah 2)
src/types/database.ts               Tipe TypeScript sesuai skema
src/lib/supabase-server.ts          Client Supabase untuk Server Component
src/lib/supabase-browser.ts         Client Supabase untuk Client Component
src/middleware.ts                   Pengelolaan sesi login + redirect ke /login
src/app/login/                      Halaman & aksi masuk/keluar
src/app/page.tsx                    Dashboard (daftar penugasan + metrik)
src/app/penugasan/baru/             Form tambah penugasan
src/app/penugasan/[id]/             Detail penugasan: ubah status, linimasa, isu
```

## Yang BELUM termasuk di Iterasi 1 (lihat roadmap aktualisasi)

Sesuai matriks rancangan kegiatan, fitur berikut menyusul di iterasi
berikutnya: modul Rapat PDCA, Panel Peringatan Dini, Cetak LHP/LHAI, Impor
Excel PKPT, dan Peta Sebaran Audit. Tabel pendukungnya (`pdca_meetings`,
`notifikasi`, `v_peringatan_dini`, dst.) sudah dibuat oleh migrasi ini agar
siap dipakai tanpa migrasi tambahan.

## Catatan keamanan

- Penugasan dengan `jenis_audit = AUDIT_INVESTIGATIF` otomatis tidak akan
  muncul di query siapa pun selain Pimpinan, Admin, Ketua Tim penugasan
  tersebut, dan Anggota Tim yang ditugaskan — ini ditegakkan oleh RLS di
  level database, bukan di frontend, sehingga tidak bisa "dilewati" dari sisi
  klien.
- Riwayat status (`status_history`) dan solusi (`problem_solving`) bersifat
  **immutable** — tidak ada kebijakan UPDATE/DELETE pada tabel tersebut,
  termasuk untuk role admin, demi menjaga integritas jejak audit.
