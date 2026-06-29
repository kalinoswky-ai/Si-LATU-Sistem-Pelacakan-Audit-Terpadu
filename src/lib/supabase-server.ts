import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Client Supabase untuk dipakai di Server Component / Server Action.
 * Wajib mengisi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
 * pada file .env.local (lihat README.md).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Diabaikan saat dipanggil dari Server Component (read-only).
          }
        },
      },
    }
  );
}
