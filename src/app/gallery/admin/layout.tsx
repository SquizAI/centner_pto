import { requireAdmin } from '@/lib/auth-utils'

export default async function GalleryAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Require admin or super_admin role for gallery admin routes
  await requireAdmin()

  return <>{children}</>
}
