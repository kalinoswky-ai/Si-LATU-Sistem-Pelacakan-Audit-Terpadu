'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-server';

export async function ubahStatus(assignmentId: string, formData: FormData) {
  const supabase = await createClient();
  const statusBaru = formData.get('status_baru') as string;
  const catatan = (formData.get('catatan_transisi') as string) || null;

  const { error } = await supabase
    .from('audit_assignments')
    .update({ status_saat_ini: statusBaru, catatan_transisi: catatan })
    .eq('id', assignmentId);

  if (error) {
    // Pesan ini biasanya berasal dari trigger fn_validate_status_transition
    // (mis. peran tidak memenuhi syarat, atau catatan wajib belum diisi).
    throw new Error(error.message);
  }

  revalidatePath(`/penugasan/${assignmentId}`);
}

export async function catatIsu(assignmentId: string, formData: FormData) {
  const supabase = await createClient();
  const deskripsi = formData.get('deskripsi') as string;

  const { error } = await supabase.from('issues').insert({
    assignment_id: assignmentId,
    deskripsi,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/penugasan/${assignmentId}`);
}

export async function catatSolusi(issueId: string, assignmentId: string, formData: FormData) {
  const supabase = await createClient();
  const solusi = formData.get('solusi') as string;

  const { error: errSolusi } = await supabase.from('problem_solving').insert({
    issue_id: issueId,
    solusi,
  });
  if (errSolusi) throw new Error(errSolusi.message);

  const { error: errIsu } = await supabase.from('issues').update({ status: 'resolved' }).eq('id', issueId);
  if (errIsu) throw new Error(errIsu.message);

  revalidatePath(`/penugasan/${assignmentId}`);
}
