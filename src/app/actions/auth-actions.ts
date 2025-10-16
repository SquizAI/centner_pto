'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Validation schemas
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  campus: z.enum(['preschool', 'elementary', 'middle_high']).optional().nullable(),
  studentGrades: z.array(z.string()).optional(),
})

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export interface ActionResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(
  provider: 'google' | 'facebook' | 'github' | 'twitter',
  redirectTo?: string
): Promise<void> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${redirectTo || '/dashboard'}`,
    },
  })

  if (error) {
    throw error
  }

  if (data.url) {
    redirect(data.url)
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string,
  redirectTo?: string
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = signInSchema.parse({ email, password })

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Get user profile to check role
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      revalidatePath('/', 'layout')

      // Redirect based on role if no specific redirect is provided
      if (!redirectTo) {
        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          redirect('/admin')
        } else {
          redirect('/dashboard')
        }
      } else {
        redirect(redirectTo)
      }
    }

    revalidatePath('/', 'layout')
    redirect(redirectTo || '/dashboard')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    // Re-throw redirect errors
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = signUpSchema.parse({ email, password, fullName })

    const supabase = await createClient()

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          full_name: validated.fullName,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Profile should be created automatically by database trigger
    // If not, create it manually
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: validated.email,
        full_name: validated.fullName,
        role: 'member', // Default role
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }

    revalidatePath('/', 'layout')

    return {
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    // Re-throw redirect errors
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: {
  fullName: string
  phone?: string
  campus?: 'preschool' | 'elementary' | 'middle_high' | null
  studentGrades?: string[]
}): Promise<ActionResult> {
  try {
    // Validate input
    const validated = updateProfileSchema.parse({
      fullName: data.fullName,
      phone: data.phone,
      campus: data.campus,
      studentGrades: data.studentGrades,
    })

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: validated.fullName,
        phone: validated.phone,
        campus: validated.campus,
        student_grades: validated.studentGrades,
      })
      .eq('id', user.id)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Profile updated successfully!',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<ActionResult> {
  try {
    // Validate input
    const validated = resetPasswordSchema.parse({ email })

    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: 'Password reset email sent! Please check your inbox.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Update password (after reset)
 */
export async function updatePassword(password: string): Promise<ActionResult> {
  try {
    // Validate input
    const validated = updatePasswordSchema.parse({ password })

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: validated.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: 'Password updated successfully!',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}
