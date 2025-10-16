'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, UserCheck, AlertCircle } from 'lucide-react'
import { Event } from '@/types/events'
import { createClient } from '@/lib/supabase/client'
import { createRSVP } from '@/app/actions/rsvp-actions'
import { toast } from 'sonner'

interface RSVPDialogProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function RSVPDialog({
  event,
  open,
  onOpenChange,
  onSuccess,
}: RSVPDialogProps) {
  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [numAdults, setNumAdults] = useState(1)
  const [numChildren, setNumChildren] = useState(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-fill user data if authenticated
  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single()

        if (profile) {
          setParentName(profile.full_name || '')
          setParentEmail(profile.email || user.email || '')
        } else {
          setParentEmail(user.email || '')
        }
      }
    }

    if (open) {
      loadUserData()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate fields
      if (!parentName || !parentEmail) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      if (numAdults + numChildren < 1) {
        setError('At least one guest is required')
        setLoading(false)
        return
      }

      // Call server action
      const result = await createRSVP({
        event_id: event.id,
        parent_name: parentName,
        parent_email: parentEmail,
        num_adults: numAdults,
        num_children: numChildren,
        notes: notes || null,
      })

      if (result.success) {
        toast.success('RSVP submitted successfully!')
        onOpenChange(false)
        onSuccess?.()

        // Reset form
        setParentName('')
        setParentEmail('')
        setNumAdults(1)
        setNumChildren(0)
        setNotes('')
      } else {
        setError(result.error || 'Failed to submit RSVP')
        toast.error(result.error || 'Failed to submit RSVP')
      }
    } catch (err) {
      console.error('RSVP error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit RSVP')
      toast.error('Failed to submit RSVP')
    } finally {
      setLoading(false)
    }
  }

  const totalGuests = numAdults + numChildren

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            RSVP to Event
          </DialogTitle>
          <DialogDescription>
            {event.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {event.max_attendees && (
            <div className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Event capacity:</span>
              <span className="font-semibold">{event.max_attendees} people</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="parentName">Full Name *</Label>
            <Input
              id="parentName"
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentEmail">Email *</Label>
            <Input
              id="parentEmail"
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              You'll receive a confirmation email
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numAdults">Adults</Label>
              <Input
                id="numAdults"
                type="number"
                min="0"
                value={numAdults}
                onChange={(e) => setNumAdults(parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numChildren">Children</Label>
              <Input
                id="numChildren"
                type="number"
                min="0"
                value={numChildren}
                onChange={(e) => setNumChildren(parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm p-2 bg-primary/5 rounded-lg">
            <span className="text-muted-foreground">Total guests:</span>
            <span className="font-semibold text-primary">{totalGuests}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any dietary restrictions, special needs, or questions..."
              rows={3}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Confirm RSVP
              </>
            )}
          </Button>

          {event.requires_approval && (
            <p className="text-xs text-center text-muted-foreground">
              Your RSVP will be reviewed and you'll receive a confirmation email
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
