'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-server';
import type { UserRole } from '@/types/database';

export async function ubahPeran(userId: string, formData: FormData) {
  const supabase = await createClient();
  const role = formData.get('role') as UserRole;

  const { error } = await supabase.from('users').update({ role }).eq('id', userId);
  if (error) {
    // Biasanya berarti akun yang login bukan admin — ditegakkan oleh RLS upd_users_admin.
    throw new Error(error.message);
  }
  revalidatePath('/pengguna');
}
