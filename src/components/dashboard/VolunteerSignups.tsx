'use client'

import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface VolunteerSignup {
  id: string
  status: 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  opportunity: {
    id: string
    title: string
    description: string | null
    date: string
    location: string | null
    status: string
  }
}

interface VolunteerSignupsProps {
  signups: VolunteerSignup[]
}

export default function VolunteerSignups({ signups }: VolunteerSignupsProps) {
  if (!signups || signups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          You haven&apos;t signed up for any volunteer opportunities yet.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Visit the <a href="/volunteer" className="text-primary hover:underline">volunteer page</a> to get started!
        </p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {signups.map((signup) => (
        <div
          key={signup.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{signup.opportunity.title}</h3>
            {getStatusBadge(signup.status)}
          </div>

          {signup.opportunity.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {signup.opportunity.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(signup.opportunity.date), 'MMMM d, yyyy \'at\' h:mm a')}
              </span>
            </div>

            {signup.opportunity.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{signup.opportunity.location}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Signed up {format(new Date(signup.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {signup.notes && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <p className="text-sm">
                <span className="font-medium">Your note:</span> {signup.notes}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
