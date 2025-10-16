import { getCurrentUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirect authenticated users away from auth pages
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
