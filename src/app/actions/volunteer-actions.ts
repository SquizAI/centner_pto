'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface ActionResult<T = void> {
  success: boolean
  error?: string
  message?: string
  data?: T
}

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const signupSchema = z.object({
  opportunity_id: z.string().uuid('Invalid opportunity ID'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable(),
})

const volunteerHoursSchema = z.object({
  opportunity_id: z.string().uuid('Invalid opportunity ID').optional().nullable(),
  hours: z.number().min(0.5, 'Minimum 0.5 hours').max(24, 'Maximum 24 hours per entry'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(500),
  approved: z.boolean().default(false),
})

const approveHoursSchema = z.object({
  hours_id: z.string().uuid('Invalid hours ID'),
  approved_by: z.string().uuid('Invalid approver ID'),
})

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return { supabase, user }
}

async function requireAdmin() {
  const { supabase, user } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('Admin access required')
  }

  return { supabase, user, profile }
}

// =====================================================
// VOLUNTEER SIGNUP ACTIONS
// =====================================================

/**
 * Sign up for a volunteer opportunity
 * Requires authentication
 */
export async function signupForShift(
  shiftId: string,
  notes?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate input
    const validated = signupSchema.parse({
      opportunity_id: shiftId,
      notes,
    })

    // Require authentication
    const { supabase, user } = await requireAuth()

    // Check if user already signed up
    const { data: existingSignup } = await supabase
      .from('volunteer_signups')
      .select('id, status')
      .eq('opportunity_id', shiftId)
      .eq('user_id', user.id)
      .single()

    if (existingSignup) {
      if (existingSignup.status === 'confirmed') {
        return {
          success: false,
          error: 'You have already signed up for this volunteer opportunity',
        }
      }
    }

    // Check opportunity availability using database function
    const { data: availableSpots, error: availError } = await supabase
      .rpc('get_available_spots', { opportunity_uuid: shiftId })

    if (availError) {
      return {
        success: false,
        error: `Failed to check availability: ${availError.message}`,
      }
    }

    if (availableSpots <= 0) {
      return {
        success: false,
        error: 'This volunteer opportunity is full',
      }
    }

    // Create signup
    const { data: signup, error } = await supabase
      .from('volunteer_signups')
      .insert({
        opportunity_id: validated.opportunity_id,
        user_id: user.id,
        notes: validated.notes,
        status: 'confirmed',
        signup_date: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      // Check if it's a capacity error from trigger
      if (error.message.includes('full')) {
        return {
          success: false,
          error: 'This volunteer opportunity is full',
        }
      }

      return {
        success: false,
        error: `Failed to sign up: ${error.message}`,
      }
    }

    // The trigger automatically updates current_signups

    revalidatePath('/volunteer')
    revalidatePath(`/volunteer/${shiftId}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Successfully signed up for volunteer opportunity!',
      data: { id: signup.id },
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
      error: error instanceof Error ? error.message : 'Failed to sign up',
    }
  }
}

/**
 * Cancel a volunteer signup
 * Requires authentication
 */
export async function cancelSignup(signupId: string): Promise<ActionResult> {
  try {
    // Require authentication
    const { supabase, user } = await requireAuth()

    // Validate UUID
    if (!signupId || !signupId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid signup ID',
      }
    }

    // Get signup to verify ownership
    const { data: signup, error: fetchError } = await supabase
      .from('volunteer_signups')
      .select('id, user_id, opportunity_id, status')
      .eq('id', signupId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !signup) {
      return {
        success: false,
        error: 'Signup not found or you do not have permission to cancel it',
      }
    }

    if (signup.status !== 'confirmed') {
      return {
        success: false,
        error: 'This signup is not in confirmed status',
      }
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from('volunteer_signups')
      .update({ status: 'cancelled' })
      .eq('id', signupId)

    if (updateError) {
      return {
        success: false,
        error: `Failed to cancel signup: ${updateError.message}`,
      }
    }

    // The trigger automatically updates current_signups

    revalidatePath('/volunteer')
    revalidatePath(`/volunteer/${signup.opportunity_id}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Volunteer signup cancelled successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel signup',
    }
  }
}

/**
 * Admin check-in a volunteer
 * Requires admin role
 */
export async function checkInVolunteer(
  signupId: string,
  checkInBy: string
): Promise<ActionResult> {
  try {
    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUIDs
    if (!signupId || !signupId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid signup ID',
      }
    }

    // Note: The current schema doesn't have check-in fields
    // This would require schema enhancement
    // For now, we'll just mark as confirmed and log

    const { error } = await supabase
      .from('volunteer_signups')
      .update({
        status: 'confirmed',
        // checked_in_at: new Date().toISOString(), // Future field
        // checked_in_by: checkInBy, // Future field
      })
      .eq('id', signupId)

    if (error) {
      return {
        success: false,
        error: `Failed to check in volunteer: ${error.message}`,
      }
    }

    revalidatePath('/admin/volunteers')

    return {
      success: true,
      message: 'Volunteer checked in successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check in volunteer',
    }
  }
}

/**
 * Mark a volunteer shift as completed
 * Requires admin role
 */
export async function completeShift(
  signupId: string,
  hours: number
): Promise<ActionResult> {
  try {
    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUID
    if (!signupId || !signupId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid signup ID',
      }
    }

    // Validate hours
    if (hours < 0 || hours > 24) {
      return {
        success: false,
        error: 'Hours must be between 0 and 24',
      }
    }

    // Update signup to completed
    const { error } = await supabase
      .from('volunteer_signups')
      .update({
        status: 'completed',
        // hours_completed: hours, // Future field if added to schema
      })
      .eq('id', signupId)

    if (error) {
      return {
        success: false,
        error: `Failed to complete shift: ${error.message}`,
      }
    }

    revalidatePath('/admin/volunteers')

    return {
      success: true,
      message: 'Volunteer shift marked as completed',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete shift',
    }
  }
}

/**
 * Get current user's volunteer signups
 * Requires authentication
 */
export async function getMySignups(userId?: string): Promise<ActionResult<any[]>> {
  try {
    // Require authentication
    const { supabase, user } = await requireAuth()

    const targetUserId = userId || user.id

    const { data: signups, error } = await supabase
      .from('volunteer_signups')
      .select(`
        id,
        notes,
        status,
        signup_date,
        created_at,
        volunteer_opportunities (
          id,
          title,
          description,
          date,
          start_time,
          end_time,
          location,
          campus,
          status
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: `Failed to fetch signups: ${error.message}`,
      }
    }

    return {
      success: true,
      data: signups || [],
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch signups',
    }
  }
}

/**
 * Get all signups for a specific shift/opportunity
 * Requires admin role
 */
export async function getSignupsByShift(shiftId: string): Promise<ActionResult<any[]>> {
  try {
    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUID
    if (!shiftId || !shiftId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid shift ID',
      }
    }

    const { data: signups, error } = await supabase
      .from('volunteer_signups')
      .select(`
        id,
        user_id,
        notes,
        status,
        signup_date,
        created_at,
        profiles (
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('opportunity_id', shiftId)
      .order('signup_date', { ascending: true })

    if (error) {
      return {
        success: false,
        error: `Failed to fetch signups: ${error.message}`,
      }
    }

    return {
      success: true,
      data: signups || [],
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch signups',
    }
  }
}

/**
 * Manually add volunteer hours
 * Requires admin role
 * Note: This requires a volunteer_hours table which isn't in the current schema
 */
export async function addVolunteerHours(
  userId: string,
  data: z.infer<typeof volunteerHoursSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate input
    const validated = volunteerHoursSchema.parse(data)

    // Require admin authentication
    const { supabase, user: adminUser } = await requireAdmin()

    // Validate UUID
    if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid user ID',
      }
    }

    // Note: This would require a volunteer_hours table
    // For now, return a placeholder response
    return {
      success: false,
      error: 'Volunteer hours tracking table not yet implemented in database schema',
    }

    // Future implementation would be:
    // const { data: hours, error } = await supabase
    //   .from('volunteer_hours')
    //   .insert({
    //     user_id: userId,
    //     opportunity_id: validated.opportunity_id,
    //     hours: validated.hours,
    //     date: validated.date,
    //     description: validated.description,
    //     approved: validated.approved,
    //     created_by: adminUser.id,
    //   })
    //   .select('id')
    //   .single()

    // if (error) {
    //   return {
    //     success: false,
    //     error: `Failed to add volunteer hours: ${error.message}`,
    //   }
    // }

    // revalidatePath('/admin/volunteers')
    // revalidatePath('/dashboard')

    // return {
    //   success: true,
    //   message: 'Volunteer hours added successfully',
    //   data: { id: hours.id },
    // }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add volunteer hours',
    }
  }
}

/**
 * Approve volunteer hours
 * Requires admin role
 */
export async function approveVolunteerHours(
  hoursId: string,
  approvedBy: string
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = approveHoursSchema.parse({
      hours_id: hoursId,
      approved_by: approvedBy,
    })

    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Note: This would require a volunteer_hours table
    return {
      success: false,
      error: 'Volunteer hours tracking table not yet implemented in database schema',
    }

    // Future implementation would be:
    // const { error } = await supabase
    //   .from('volunteer_hours')
    //   .update({
    //     approved: true,
    //     approved_by: validated.approved_by,
    //     approved_at: new Date().toISOString(),
    //   })
    //   .eq('id', validated.hours_id)

    // if (error) {
    //   return {
    //     success: false,
    //     error: `Failed to approve hours: ${error.message}`,
    //   }
    // }

    // revalidatePath('/admin/volunteers')

    // return {
    //   success: true,
    //   message: 'Volunteer hours approved successfully',
    // }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve volunteer hours',
    }
  }
}

/**
 * Update signup status
 * Requires admin role
 */
export async function updateSignupStatus(
  signupId: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<ActionResult> {
  try {
    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUID
    if (!signupId || !signupId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid signup ID',
      }
    }

    // Validate status
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return {
        success: false,
        error: 'Invalid status',
      }
    }

    const { error } = await supabase
      .from('volunteer_signups')
      .update({ status })
      .eq('id', signupId)

    if (error) {
      return {
        success: false,
        error: `Failed to update signup status: ${error.message}`,
      }
    }

    revalidatePath('/admin/volunteers')
    revalidatePath('/volunteer')

    return {
      success: true,
      message: 'Signup status updated successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update signup status',
    }
  }
}
