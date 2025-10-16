'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, UserCheck, XCircle } from 'lucide-react'
import { Event, EventRSVP } from '@/types/events'
import { createRSVP, deleteRSVP } from '@/app/actions/rsvp-actions'
import { toast } from 'sonner'
import RSVPDialog from './RSVPDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface RSVPButtonProps {
  event: Event
  userRSVP: EventRSVP | null
  rsvpCount: number
  onRSVPSuccess?: () => void
  onRSVPCancel?: () => void
}

export default function RSVPButton({
  event,
  userRSVP: initialUserRSVP,
  rsvpCount,
  onRSVPSuccess,
  onRSVPCancel,
}: RSVPButtonProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userRSVP, setUserRSVP] = useState(initialUserRSVP)

  const isAtCapacity = event.max_attendees ? rsvpCount >= event.max_attendees : false
  const hasRSVPd = !!userRSVP

  const handleCancelRSVP = async () => {
    if (!userRSVP) return

    setLoading(true)
    try {
      const result = await deleteRSVP(userRSVP.id)

      if (result.success) {
        toast.success('RSVP cancelled successfully')
        setUserRSVP(null)
        setCancelDialogOpen(false)
        onRSVPCancel?.()
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to cancel RSVP')
      }
    } catch (error) {
      console.error('Cancel RSVP error:', error)
      toast.error('Failed to cancel RSVP')
    } finally {
      setLoading(false)
    }
  }

  const handleRSVPSuccess = () => {
    onRSVPSuccess?.()
    router.refresh()
  }

  if (hasRSVPd) {
    return (
      <>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-green-500 text-green-600 hover:bg-green-50"
            disabled
          >
            <UserCheck className="w-4 h-4 mr-2" />
            You're Attending
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setCancelDialogOpen(true)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Cancel RSVP
              </>
            )}
          </Button>
        </div>

        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel RSVP?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your RSVP for {event.title}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Keep RSVP</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelRSVP}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel RSVP'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <>
      <Button
        className="w-full"
        size="lg"
        onClick={() => setDialogOpen(true)}
        disabled={isAtCapacity}
      >
        <UserCheck className="w-4 h-4 mr-2" />
        {isAtCapacity ? 'Event Full' : 'RSVP Now'}
      </Button>

      <RSVPDialog
        event={event}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleRSVPSuccess}
      />
    </>
  )
}
