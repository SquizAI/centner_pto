'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import type { UserRole } from '@/lib/auth-utils'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: UserRole | UserRole[]
  fallback?: React.ReactNode
}

export default function ProtectedRoute({
  children,
  requireRole,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // If role is required, check user's role
      if (requireRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile) {
          router.push('/login')
          return
        }

        const roles = Array.isArray(requireRole) ? requireRole : [requireRole]
        if (!roles.includes(profile.role)) {
          router.push('/')
          return
        }
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, requireRole])

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
