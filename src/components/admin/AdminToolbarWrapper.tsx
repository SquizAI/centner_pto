import { createClient } from '@/lib/supabase/server';
import { AdminToolbar } from './AdminToolbar';

export async function AdminToolbarWrapper() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Only show toolbar for admins
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return null;
  }

  return <AdminToolbar userRole={profile.role as 'admin' | 'super_admin'} />;
}
