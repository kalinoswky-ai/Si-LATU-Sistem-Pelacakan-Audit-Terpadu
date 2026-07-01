import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('nama, role')
    .eq('auth_user_id', user.id)
    .single();

  return (
    <div className="app-shell">
      <Sidebar userNama={profile?.nama} userRole={profile?.role} />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
