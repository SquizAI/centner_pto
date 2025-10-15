import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'member' | 'volunteer' | 'admin' | 'super_admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  campus: string | null
  student_grades: string[] | null
  phone: string | null
  created_at: string
  updated_at: string
}

/**
 * Get the current authenticated user with their profile
 * This is cached per request to avoid multiple database calls
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    ...user,
    profile: profile as Profile,
  }
})

/**
 * Require authentication - throws error if not authenticated
 * Use this in Server Components that require authentication
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Require admin role - throws error if not admin or super_admin
 * Use this in Server Components that require admin access
 */
export async function requireAdmin() {
  const user = await requireAuth()

  if (!user.profile || (user.profile.role !== 'admin' && user.profile.role !== 'super_admin')) {
    redirect('/')
  }

  return user
}

/**
 * Require super admin role - throws error if not super_admin
 * Use this in Server Components that require super admin access
 */
export async function requireSuperAdmin() {
  const user = await requireAuth()

  if (!user.profile || user.profile.role !== 'super_admin') {
    redirect('/')
  }

  return user
}

/**
 * Check if user has a specific role
 */
export async function checkRole(role: UserRole | UserRole[]): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user || !user.profile) {
    return false
  }

  const roles = Array.isArray(role) ? role : [role]
  return roles.includes(user.profile.role)
}

/**
 * Check if user is admin or super_admin
 */
export async function isAdmin(): Promise<boolean> {
  return checkRole(['admin', 'super_admin'])
}

/**
 * Check if user is super_admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return checkRole('super_admin')
}

/**
 * Get user initials for avatar
 * Re-exported from client-safe utility file
 */
export { getUserInitials } from '@/lib/utils/user-helpers'
