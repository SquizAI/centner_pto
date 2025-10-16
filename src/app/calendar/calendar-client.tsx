'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type Event = Tables<'events'>

interface CalendarClientProps {
  initialEvents: Event[]
}

const campusLabels: Record<string, string> = {
  all: 'All Campuses',
  preschool: 'Preschool',
  elementary: 'Elementary',
  'middle-high': 'Middle & High School',
}

const campusColors: Record<string, string> = {
  all: 'bg-primary/10 text-primary border-primary/20',
  preschool: 'bg-blue-100 text-blue-700 border-blue-200',
  elementary: 'bg-green-100 text-green-700 border-green-200',
  'middle-high': 'bg-purple-100 text-purple-700 border-purple-200',
}

export function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [campusFilter, setCampusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Filter events
  const filteredEvents = initialEvents.filter((event) => {
    const campusMatch =
      campusFilter === 'all' ||
      event.campus?.includes(campusFilter) ||
      event.campus?.includes('all')

    const typeMatch = typeFilter === 'all' || event.event_type === typeFilter

    return campusMatch && typeMatch
  })

  // Get unique event types
  const eventTypes = Array.from(
    new Set(initialEvents.map((e) => e.event_type).filter(Boolean))
  )

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Events</CardTitle>
          <CardDescription>
            Narrow down events by campus and type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campus</label>
              <Select value={campusFilter} onValueChange={setCampusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  <SelectItem value="preschool">Preschool</SelectItem>
                  <SelectItem value="elementary">Elementary</SelectItem>
                  <SelectItem value="middle-high">Middle & High School</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type!}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No events found matching your filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                {event.image_url && (
                  <div className="md:w-64 h-48 md:h-auto relative bg-muted">
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-2xl">{event.title}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          {event.campus?.map((campus) => (
                            <Badge
                              key={campus}
                              variant="outline"
                              className={campusColors[campus] || campusColors.all}
                            >
                              {campusLabels[campus] || campus}
                            </Badge>
                          ))}
                          {event.event_type && (
                            <Badge variant="secondary">{event.event_type}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.description && (
                      <p className="text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {event.max_attendees && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.current_attendees || 0} / {event.max_attendees} attendees
                          </span>
                        </div>
                      )}

                      {event.end_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Until {formatDate(event.end_date)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button asChild>
                        <Link href={`/calendar/${event.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
