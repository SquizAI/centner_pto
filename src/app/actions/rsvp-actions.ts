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

const rsvpCreateSchema = z.object({
  event_id: z.string().uuid('Invalid event ID'),
  parent_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  parent_email: z.string().email('Invalid email address'),
  num_adults: z.number().int().min(0, 'Adults count cannot be negative').default(1),
  num_children: z.number().int().min(0, 'Children count cannot be negative').default(0),
  notes: z.string().max(500, 'Notes too long').optional().nullable(),
})

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// =====================================================
// RSVP ACTIONS
// =====================================================

/**
 * Create an RSVP for an event
 * Works for both authenticated and guest users
 */
export async function createRSVP(
  data: z.infer<typeof rsvpCreateSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate input
    const validated = rsvpCreateSchema.parse(data)

    const supabase = await createClient()
    const user = await getUser()

    // Check if event exists and is published
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, status, max_attendees, ticket_enabled')
      .eq('id', validated.event_id)
      .single()

    if (eventError || !event) {
      return {
        success: false,
        error: 'Event not found',
      }
    }

    if (event.status !== 'published') {
      return {
        success: false,
        error: 'This event is not available for RSVP',
      }
    }

    if (event.ticket_enabled) {
      return {
        success: false,
        error: 'This is a ticketed event. Please purchase tickets instead.',
      }
    }

    // Check for existing RSVP
    let existingRSVP
    if (user) {
      const { data } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('event_id', validated.event_id)
        .eq('user_id', user.id)
        .single()
      existingRSVP = data
    } else {
      // For guest users, check by email
      const { data } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('event_id', validated.event_id)
        .eq('parent_email', validated.parent_email)
        .single()
      existingRSVP = data
    }

    if (existingRSVP) {
      return {
        success: false,
        error: 'You have already RSVP\'d to this event',
      }
    }

    // Check capacity
    if (event.max_attendees) {
      const { count } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', validated.event_id)

      const totalGuests = validated.num_adults + validated.num_children
      const currentAttendees = count || 0

      if (currentAttendees + totalGuests > event.max_attendees) {
        return {
          success: false,
          error: 'This event has reached maximum capacity',
        }
      }
    }

    // Create RSVP
    const { data: rsvp, error: insertError } = await supabase
      .from('event_rsvps')
      .insert({
        event_id: validated.event_id,
        user_id: user?.id || null,
        parent_name: validated.parent_name,
        parent_email: validated.parent_email,
        num_adults: validated.num_adults,
        num_children: validated.num_children,
        notes: validated.notes,
      })
      .select('id')
      .single()

    if (insertError) {
      return {
        success: false,
        error: `Failed to create RSVP: ${insertError.message}`,
      }
    }

    revalidatePath('/events')
    revalidatePath(`/events/${validated.event_id}`)

    return {
      success: true,
      message: 'RSVP created successfully',
      data: { id: rsvp.id },
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
      error: error instanceof Error ? error.message : 'Failed to create RSVP',
    }
  }
}

/**
 * Delete an RSVP
 * Users can only delete their own RSVPs
 */
export async function deleteRSVP(rsvpId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()

    // Validate UUID
    if (!rsvpId || !rsvpId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid RSVP ID',
      }
    }

    // Get RSVP to verify ownership and get event_id
    const { data: rsvp, error: fetchError } = await supabase
      .from('event_rsvps')
      .select('user_id, event_id, parent_email')
      .eq('id', rsvpId)
      .single()

    if (fetchError || !rsvp) {
      return {
        success: false,
        error: 'RSVP not found',
      }
    }

    // Verify ownership
    if (user) {
      if (rsvp.user_id !== user.id) {
        return {
          success: false,
          error: 'You can only cancel your own RSVPs',
        }
      }
    } else {
      return {
        success: false,
        error: 'You must be logged in to cancel your RSVP',
      }
    }

    // Delete RSVP
    const { error: deleteError } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('id', rsvpId)

    if (deleteError) {
      return {
        success: false,
        error: `Failed to cancel RSVP: ${deleteError.message}`,
      }
    }

    revalidatePath('/events')
    revalidatePath(`/events/${rsvp.event_id}`)

    return {
      success: true,
      message: 'RSVP cancelled successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel RSVP',
    }
  }
}

/**
 * Get RSVPs for an event
 * Public for viewing count, admins can see details
 */
export async function getEventRSVPs(eventId: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    // Validate UUID
    if (!eventId || !eventId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid event ID',
      }
    }

    const { data: rsvps, error } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: `Failed to fetch RSVPs: ${error.message}`,
      }
    }

    return {
      success: true,
      data: rsvps || [],
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch RSVPs',
    }
  }
}

/**
 * Get user's RSVP for an event
 */
export async function getUserEventRSVP(eventId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const user = await getUser()

    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    // Validate UUID
    if (!eventId || !eventId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid event ID',
      }
    }

    const { data: rsvp, error } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      return {
        success: false,
        error: `Failed to fetch RSVP: ${error.message}`,
      }
    }

    return {
      success: true,
      data: rsvp || null,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch RSVP',
    }
  }
}

/**
 * Update RSVP details
 */
export async function updateRSVP(
  rsvpId: string,
  data: Partial<z.infer<typeof rsvpCreateSchema>>
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()

    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    // Validate UUID
    if (!rsvpId || !rsvpId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid RSVP ID',
      }
    }

    // Verify ownership
    const { data: rsvp, error: fetchError } = await supabase
      .from('event_rsvps')
      .select('user_id, event_id')
      .eq('id', rsvpId)
      .single()

    if (fetchError || !rsvp) {
      return {
        success: false,
        error: 'RSVP not found',
      }
    }

    if (rsvp.user_id !== user.id) {
      return {
        success: false,
        error: 'You can only update your own RSVPs',
      }
    }

    // Update RSVP
    const { error: updateError } = await supabase
      .from('event_rsvps')
      .update({
        parent_name: data.parent_name,
        parent_email: data.parent_email,
        num_adults: data.num_adults,
        num_children: data.num_children,
        notes: data.notes,
      })
      .eq('id', rsvpId)

    if (updateError) {
      return {
        success: false,
        error: `Failed to update RSVP: ${updateError.message}`,
      }
    }

    revalidatePath('/events')
    revalidatePath(`/events/${rsvp.event_id}`)

    return {
      success: true,
      message: 'RSVP updated successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update RSVP',
    }
  }
}
