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

// Note: The current volunteer schema uses volunteer_opportunities table
// which combines both opportunity and shift concepts into one table.
// These actions work with that existing structure.

const opportunitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Invalid time format (HH:MM:SS)'),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Invalid time format (HH:MM:SS)'),
  location: z.string().min(2, 'Location is required'),
  campus: z.enum(['all', 'preschool', 'elementary', 'middle-high']).default('all'),
  max_volunteers: z.number().int().positive('Must have at least 1 volunteer slot').max(100, 'Maximum 100 volunteers'),
  contact_email: z.string().email('Invalid email address'),
  requirements: z.string().optional().nullable(),
  status: z.enum(['active', 'cancelled', 'completed']).default('active'),
})

const updateOpportunitySchema = opportunitySchema.partial()

const opportunityFiltersSchema = z.object({
  status: z.enum(['active', 'cancelled', 'completed', 'all']).optional(),
  campus: z.enum(['all', 'preschool', 'elementary', 'middle-high']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  availableOnly: z.boolean().optional().default(false),
  limit: z.number().int().positive().max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
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
// SHIFT/OPPORTUNITY ACTIONS
// =====================================================

/**
 * Create a new volunteer opportunity/shift
 * Requires admin role
 */
export async function createShift(data: z.infer<typeof opportunitySchema>): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate input
    const validated = opportunitySchema.parse(data)

    // Require admin authentication
    const { supabase, user } = await requireAdmin()

    // Validate that end_time is after start_time
    if (validated.end_time <= validated.start_time) {
      return {
        success: false,
        error: 'End time must be after start time',
      }
    }

    // Create opportunity
    const { data: opportunity, error } = await supabase
      .from('volunteer_opportunities')
      .insert({
        ...validated,
        created_by: user.id,
        current_signups: 0,
      })
      .select('id')
      .single()

    if (error) {
      return {
        success: false,
        error: `Failed to create volunteer shift: ${error.message}`,
      }
    }

    revalidatePath('/volunteer')
    revalidatePath('/admin/volunteers')

    return {
      success: true,
      message: 'Volunteer shift created successfully',
      data: { id: opportunity.id },
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
      error: error instanceof Error ? error.message : 'Failed to create volunteer shift',
    }
  }
}

/**
 * Update a volunteer opportunity/shift
 * Requires admin role
 */
export async function updateShift(
  id: string,
  data: z.infer<typeof updateOpportunitySchema>
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = updateOpportunitySchema.parse(data)

    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUID
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid shift ID',
      }
    }

    // Validate that end_time is after start_time if both are being updated
    if (validated.start_time && validated.end_time && validated.end_time <= validated.start_time) {
      return {
        success: false,
        error: 'End time must be after start time',
      }
    }

    // Update opportunity
    const { error } = await supabase
      .from('volunteer_opportunities')
      .update(validated)
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: `Failed to update volunteer shift: ${error.message}`,
      }
    }

    revalidatePath('/volunteer')
    revalidatePath(`/volunteer/${id}`)
    revalidatePath('/admin/volunteers')

    return {
      success: true,
      message: 'Volunteer shift updated successfully',
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
      error: error instanceof Error ? error.message : 'Failed to update volunteer shift',
    }
  }
}

/**
 * Delete a volunteer opportunity/shift
 * Requires admin role
 * Checks for existing signups before deletion
 */
export async function deleteShift(id: string, force: boolean = false): Promise<ActionResult> {
  try {
    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUID
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid shift ID',
      }
    }

    // Check for existing signups
    const { data: signups, error: signupsError } = await supabase
      .from('volunteer_signups')
      .select('id, status')
      .eq('opportunity_id', id)
      .eq('status', 'confirmed')

    if (signupsError) {
      return {
        success: false,
        error: `Failed to check signups: ${signupsError.message}`,
      }
    }

    if (signups && signups.length > 0 && !force) {
      return {
        success: false,
        error: `Cannot delete shift with ${signups.length} active signup(s). Cancel the shift instead or use force delete.`,
      }
    }

    // Delete opportunity (cascades to signups)
    const { error } = await supabase
      .from('volunteer_opportunities')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: `Failed to delete volunteer shift: ${error.message}`,
      }
    }

    revalidatePath('/volunteer')
    revalidatePath('/admin/volunteers')

    return {
      success: true,
      message: 'Volunteer shift deleted successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete volunteer shift',
    }
  }
}

/**
 * Get all shifts/opportunities for an event
 * Note: The current schema doesn't have event_id on volunteer_opportunities
 * This is a placeholder for future enhancement
 */
export async function getShiftsByEvent(eventId: string): Promise<ActionResult<any[]>> {
  return {
    success: false,
    error: 'Event-based volunteer shifts not yet implemented in database schema',
  }
}

/**
 * Get available volunteer shifts with capacity
 */
export async function getAvailableShifts(
  filters?: z.infer<typeof opportunityFiltersSchema>
): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    // Validate filters
    const validated = filters ? opportunityFiltersSchema.parse(filters) : opportunityFiltersSchema.parse({})

    let query = supabase
      .from('volunteer_opportunities')
      .select('*', { count: 'exact' })
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    // Apply filters
    if (validated.status && validated.status !== 'all') {
      query = query.eq('status', validated.status)
    } else {
      // Default to active only
      query = query.eq('status', 'active')
    }

    if (validated.campus && validated.campus !== 'all') {
      query = query.eq('campus', validated.campus)
    }

    if (validated.startDate) {
      query = query.gte('date', validated.startDate)
    }

    if (validated.endDate) {
      query = query.lte('date', validated.endDate)
    }

    // Filter by availability (has open spots)
    if (validated.availableOnly) {
      // Use raw SQL to compare current_signups < max_volunteers
      query = query.filter('current_signups', 'lt', 'max_volunteers')
    }

    // Apply pagination
    query = query.range(validated.offset!, validated.offset! + validated.limit! - 1)

    const { data: shifts, error, count } = await query

    if (error) {
      return {
        success: false,
        error: `Failed to fetch volunteer shifts: ${error.message}`,
      }
    }

    return {
      success: true,
      data: shifts || [],
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
      error: error instanceof Error ? error.message : 'Failed to fetch volunteer shifts',
    }
  }
}

/**
 * Get shift/opportunity by ID
 */
export async function getShiftById(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    // Validate UUID
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid shift ID',
      }
    }

    const { data: shift, error } = await supabase
      .from('volunteer_opportunities')
      .select(`
        *,
        volunteer_signups (
          id,
          user_id,
          notes,
          status,
          signup_date,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (error || !shift) {
      return {
        success: false,
        error: 'Volunteer shift not found',
      }
    }

    return {
      success: true,
      data: shift,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch volunteer shift',
    }
  }
}

/**
 * Cancel a volunteer shift (mark as cancelled)
 * Requires admin role
 * Notifies all volunteers signed up
 */
export async function cancelShift(id: string, reason?: string): Promise<ActionResult> {
  try {
    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUID
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid shift ID',
      }
    }

    // Get shift details and signups
    const { data: shift, error: shiftError } = await supabase
      .from('volunteer_opportunities')
      .select(`
        id,
        title,
        date,
        volunteer_signups!inner (
          id,
          user_id,
          status
        )
      `)
      .eq('id', id)
      .single()

    if (shiftError || !shift) {
      return {
        success: false,
        error: 'Volunteer shift not found',
      }
    }

    // Update shift status to cancelled
    const { error: updateError } = await supabase
      .from('volunteer_opportunities')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (updateError) {
      return {
        success: false,
        error: `Failed to cancel shift: ${updateError.message}`,
      }
    }

    // Cancel all confirmed signups
    const confirmedSignups = shift.volunteer_signups?.filter(
      (s: { status: string }) => s.status === 'confirmed'
    ) || []

    if (confirmedSignups.length > 0) {
      const { error: cancelSignupsError } = await supabase
        .from('volunteer_signups')
        .update({ status: 'cancelled' })
        .eq('opportunity_id', id)
        .eq('status', 'confirmed')

      if (cancelSignupsError) {
        console.error('Failed to cancel signups:', cancelSignupsError)
      }
    }

    // TODO: Send cancellation emails to volunteers
    // This would integrate with an email service

    revalidatePath('/volunteer')
    revalidatePath(`/volunteer/${id}`)
    revalidatePath('/admin/volunteers')

    return {
      success: true,
      message: `Volunteer shift cancelled. ${confirmedSignups.length} volunteer(s) should be notified.`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel volunteer shift',
    }
  }
}

/**
 * Complete a volunteer shift (mark as completed)
 * Requires admin role
 */
export async function completeShift(id: string): Promise<ActionResult> {
  try {
    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUID
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid shift ID',
      }
    }

    // Update shift status to completed
    const { error } = await supabase
      .from('volunteer_opportunities')
      .update({ status: 'completed' })
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: `Failed to complete shift: ${error.message}`,
      }
    }

    // Mark all confirmed signups as completed
    const { error: updateSignupsError } = await supabase
      .from('volunteer_signups')
      .update({ status: 'completed' })
      .eq('opportunity_id', id)
      .eq('status', 'confirmed')

    if (updateSignupsError) {
      console.error('Failed to update signups:', updateSignupsError)
    }

    revalidatePath('/volunteer')
    revalidatePath(`/volunteer/${id}`)
    revalidatePath('/admin/volunteers')

    return {
      success: true,
      message: 'Volunteer shift marked as completed',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete volunteer shift',
    }
  }
}
