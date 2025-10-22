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

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  event_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional().nullable(),
  location: z.string().min(2, 'Location is required').optional(),
  campus: z.enum(['preschool', 'elementary', 'middle-high', 'all']).default('all'),
  image_url: z.string().url('Invalid image URL').optional().nullable(),
  max_attendees: z.number().int().positive('Max attendees must be positive').optional().nullable(),
  rsvp_required: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'cancelled']).default('published'),

  // Ticketing fields (optional)
  ticket_enabled: z.boolean().default(false).optional(),
  ticket_price: z.number().min(0, 'Price cannot be negative').optional().nullable(),
  ticket_quantity: z.number().int().positive('Quantity must be positive').optional().nullable(),
  ticket_sales_start: z.string().optional().nullable(),
  ticket_sales_end: z.string().optional().nullable(),
  requires_approval: z.boolean().default(false).optional(),

  // External ticket sales link (e.g., Eventbrite, Ticketmaster)
  external_ticket_url: z.string().url('Invalid URL').optional().nullable(),
})

const updateEventSchema = eventSchema.partial()

const eventFiltersSchema = z.object({
  status: z.enum(['draft', 'published', 'cancelled', 'all']).optional(),
  campus: z.enum(['preschool', 'elementary', 'middle-high', 'all']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().int().positive().max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
})

const recurringEventSchema = z.object({
  baseEvent: eventSchema,
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
    count: z.number().int().positive().max(52, 'Cannot create more than 52 recurring events'),
    startDate: z.string(),
  }),
})

const rsvpSchema = z.object({
  guests_count: z.number().int().min(1, 'At least 1 guest required').default(1),
  notes: z.string().optional(),
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
// EVENT ACTIONS
// =====================================================

/**
 * Create a new event
 * Requires admin role
 */
export async function createEvent(data: z.infer<typeof eventSchema>): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate input
    const validated = eventSchema.parse(data)

    // Require admin authentication
    const { supabase, user } = await requireAdmin()

    // Create event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...validated,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (error) {
      return {
        success: false,
        error: `Failed to create event: ${error.message}`,
      }
    }

    revalidatePath('/events')
    revalidatePath('/calendar')
    revalidatePath('/admin/events')

    return {
      success: true,
      message: 'Event created successfully',
      data: { id: event.id },
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
      error: error instanceof Error ? error.message : 'Failed to create event',
    }
  }
}

/**
 * Update an existing event
 * Requires admin role
 */
export async function updateEvent(
  id: string,
  data: z.infer<typeof updateEventSchema>
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = updateEventSchema.parse(data)

    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUID
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid event ID',
      }
    }

    // Update event
    const { error } = await supabase
      .from('events')
      .update(validated)
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: `Failed to update event: ${error.message}`,
      }
    }

    revalidatePath('/events')
    revalidatePath('/calendar')
    revalidatePath(`/events/${id}`)
    revalidatePath(`/calendar/${id}`)
    revalidatePath('/admin/events')

    return {
      success: true,
      message: 'Event updated successfully',
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
      error: error instanceof Error ? error.message : 'Failed to update event',
    }
  }
}

/**
 * Delete an event
 * Requires admin role
 */
export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUID
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid event ID',
      }
    }

    // Delete event (cascades to RSVPs, tickets, etc.)
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: `Failed to delete event: ${error.message}`,
      }
    }

    revalidatePath('/events')
    revalidatePath('/calendar')
    revalidatePath('/admin/events')

    return {
      success: true,
      message: 'Event deleted successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete event',
    }
  }
}

/**
 * Publish an event (change status to published)
 * Requires admin role
 */
export async function publishEvent(id: string): Promise<ActionResult> {
  try {
    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUID
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid event ID',
      }
    }

    // Update status to published
    const { error } = await supabase
      .from('events')
      .update({ status: 'published' })
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: `Failed to publish event: ${error.message}`,
      }
    }

    revalidatePath('/events')
    revalidatePath('/calendar')
    revalidatePath(`/events/${id}`)
    revalidatePath(`/calendar/${id}`)
    revalidatePath('/admin/events')

    return {
      success: true,
      message: 'Event published successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish event',
    }
  }
}

/**
 * Cancel an event and notify attendees
 * Requires admin role
 */
export async function cancelEvent(id: string, reason?: string): Promise<ActionResult> {
  try {
    // Require admin authentication
    const { supabase } = await requireAdmin()

    // Validate UUID
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid event ID',
      }
    }

    // Get event details and attendees
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        event_rsvps (
          id,
          parent_email,
          parent_name
        ),
        event_tickets (
          id,
          buyer_email,
          buyer_name,
          status
        )
      `)
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return {
        success: false,
        error: 'Event not found',
      }
    }

    // Update event status
    const { error: updateError } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (updateError) {
      return {
        success: false,
        error: `Failed to cancel event: ${updateError.message}`,
      }
    }

    // TODO: Send cancellation emails to attendees
    // This would integrate with an email service
    // For now, we'll just log the notification need
    const rsvpCount = event.event_rsvps?.length || 0
    const ticketCount = event.event_tickets?.filter((t: { status: string }) => t.status === 'paid').length || 0

    revalidatePath('/events')
    revalidatePath('/calendar')
    revalidatePath(`/events/${id}`)
    revalidatePath(`/calendar/${id}`)
    revalidatePath('/admin/events')

    return {
      success: true,
      message: `Event cancelled. ${rsvpCount + ticketCount} attendee(s) should be notified.`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel event',
    }
  }
}

/**
 * Duplicate an event
 * Requires admin role
 */
export async function duplicateEvent(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    // Require admin authentication
    const { supabase, user } = await requireAdmin()

    // Validate UUID
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid event ID',
      }
    }

    // Get original event
    const { data: originalEvent, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !originalEvent) {
      return {
        success: false,
        error: 'Event not found',
      }
    }

    // Create duplicate with modified data
    const { id: _id, created_at, updated_at, tickets_sold, ...eventData } = originalEvent

    const { data: newEvent, error: createError } = await supabase
      .from('events')
      .insert({
        ...eventData,
        title: `${eventData.title} (Copy)`,
        status: 'draft',
        tickets_sold: 0,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (createError || !newEvent) {
      return {
        success: false,
        error: `Failed to duplicate event: ${createError?.message}`,
      }
    }

    revalidatePath('/events')
    revalidatePath('/calendar')
    revalidatePath('/admin/events')

    return {
      success: true,
      message: 'Event duplicated successfully',
      data: { id: newEvent.id },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate event',
    }
  }
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    // Validate UUID
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        success: false,
        error: 'Invalid event ID',
      }
    }

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !event) {
      return {
        success: false,
        error: 'Event not found',
      }
    }

    return {
      success: true,
      data: event,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch event',
    }
  }
}

/**
 * Get events with filtering
 */
export async function getEvents(filters?: z.infer<typeof eventFiltersSchema>): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    // Validate filters
    const validated = filters ? eventFiltersSchema.parse(filters) : eventFiltersSchema.parse({})

    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .order('event_date', { ascending: true })

    // Apply filters
    if (validated.status && validated.status !== 'all') {
      query = query.eq('status', validated.status)
    }

    if (validated.campus && validated.campus !== 'all') {
      query = query.eq('campus', validated.campus)
    }

    if (validated.startDate) {
      query = query.gte('event_date', validated.startDate)
    }

    if (validated.endDate) {
      query = query.lte('event_date', validated.endDate)
    }

    // Apply pagination
    query = query.range(validated.offset!, validated.offset! + validated.limit! - 1)

    const { data: events, error, count } = await query

    if (error) {
      return {
        success: false,
        error: `Failed to fetch events: ${error.message}`,
      }
    }

    return {
      success: true,
      data: events || [],
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
      error: error instanceof Error ? error.message : 'Failed to fetch events',
    }
  }
}

/**
 * Create recurring events
 * Requires admin role
 */
export async function createRecurringEvents(
  data: z.infer<typeof recurringEventSchema>
): Promise<ActionResult<{ created: number; ids: string[] }>> {
  try {
    // Validate input
    const validated = recurringEventSchema.parse(data)

    // Require admin authentication
    const { supabase, user } = await requireAdmin()

    // Calculate event dates based on recurrence
    const eventDates: Date[] = []
    const startDate = new Date(validated.recurrence.startDate)

    for (let i = 0; i < validated.recurrence.count; i++) {
      const eventDate = new Date(startDate)

      switch (validated.recurrence.frequency) {
        case 'daily':
          eventDate.setDate(startDate.getDate() + i)
          break
        case 'weekly':
          eventDate.setDate(startDate.getDate() + (i * 7))
          break
        case 'biweekly':
          eventDate.setDate(startDate.getDate() + (i * 14))
          break
        case 'monthly':
          eventDate.setMonth(startDate.getMonth() + i)
          break
      }

      eventDates.push(eventDate)
    }

    // Create events
    const eventsToCreate = eventDates.map((date, index) => ({
      ...validated.baseEvent,
      title: `${validated.baseEvent.title} (${index + 1}/${validated.recurrence.count})`,
      event_date: date.toISOString(),
      created_by: user.id,
    }))

    const { data: createdEvents, error } = await supabase
      .from('events')
      .insert(eventsToCreate)
      .select('id')

    if (error) {
      return {
        success: false,
        error: `Failed to create recurring events: ${error.message}`,
      }
    }

    revalidatePath('/events')
    revalidatePath('/calendar')
    revalidatePath('/admin/events')

    return {
      success: true,
      message: `Successfully created ${createdEvents.length} recurring events`,
      data: {
        created: createdEvents.length,
        ids: createdEvents.map((e: { id: string }) => e.id),
      },
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
      error: error instanceof Error ? error.message : 'Failed to create recurring events',
    }
  }
}

// =====================================================
// NOTE: RSVP ACTIONS MOVED TO /app/actions/rsvp-actions.ts
// Import from there instead
// =====================================================
