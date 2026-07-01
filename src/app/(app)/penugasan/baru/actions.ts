'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { FLOW_BY_CATEGORY, type AuditCategory } from '@/types/database';

export async function buatPenugasan(formData: FormData) {
  const supabase = await createClient();

  const jenis_audit = formData.get('jenis_audit') as AuditCategory;
  const flow = FLOW_BY_CATEGORY[jenis_audit];
  const statusAwal = flow === 'INVESTIGATIF' ? 'informasi_awal' : 'perencanaan';

  const payload = {
    entity_id: formData.get('entity_id') as string,
    ketua_tim_id: formData.get('ketua_tim_id') as string,
    jenis_audit,
    tahun: Number(formData.get('tahun')),
    tanggal_mulai: (formData.get('tanggal_mulai') as string) || null,
    target_selesai: (formData.get('target_selesai') as string) || null,
    catatan_awal: (formData.get('catatan_awal') as string) || null,
    status_saat_ini: statusAwal,
  };

  const { data, error } = await supabase
    .from('audit_assignments')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Gagal menyimpan penugasan: ${error.message}`);
  }

  // Tambahkan anggota tim yang dipilih (selain ketua)
  const anggotaIds = formData.getAll('anggota_tim_id') as string[];
  if (anggotaIds.length > 0 && data) {
    await supabase.from('assignment_members').insert(
      anggotaIds.map((userId) => ({
        assignment_id: data.id,
        user_id: userId,
        peran: 'anggota',
      }))
    );
  }

  redirect(`/penugasan/${data.id}`);
}
