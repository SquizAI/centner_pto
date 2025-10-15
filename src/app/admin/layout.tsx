import { requireAdmin } from '@/lib/auth-utils'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Require admin or super_admin role for all admin routes
  await requireAdmin()

  return <>{children}</>
}
