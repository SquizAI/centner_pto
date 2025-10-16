'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Calendar,
  Plus,
  MoreVertical,
  Edit,
  Trash,
  Copy,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { deleteEvent, publishEvent, duplicateEvent } from '@/app/actions/event-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Event = Tables<'events'> & {
  event_rsvps?: { count: number }[]
}

interface AdminEventsClientProps {
  initialEvents: Event[]
  eventCounts: {
    all: number
    published: number
    draft: number
    cancelled: number
  }
}

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-700 border-green-200',
  draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

const statusIcons: Record<string, any> = {
  published: CheckCircle,
  draft: FileText,
  cancelled: XCircle,
}

export function AdminEventsClient({
  initialEvents,
  eventCounts,
}: AdminEventsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [campusFilter, setCampusFilter] = useState<string>('all')

  // Filter events
  const filteredEvents = initialEvents.filter((event) => {
    const searchMatch =
      !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const statusMatch = statusFilter === 'all' || event.status === statusFilter

    const campusMatch =
      campusFilter === 'all' ||
      event.campus?.includes(campusFilter) ||
      event.campus?.includes('all')

    return searchMatch && statusMatch && campusMatch
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      return
    }

    const result = await deleteEvent(eventId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Event deleted successfully')
      router.refresh()
    }
  }

  const handlePublish = async (eventId: string) => {
    const result = await publishEvent(eventId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Event published successfully')
      router.refresh()
    }
  }

  const handleDuplicate = async (eventId: string) => {
    const result = await duplicateEvent(eventId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Event duplicated successfully')
      router.push(`/admin/events/${result.data?.id}/edit`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="text-3xl">{eventCounts.all}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {eventCounts.published}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {eventCounts.draft}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cancelled</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {eventCounts.cancelled}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Actions and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Events</CardTitle>
              <CardDescription>
                Manage and organize your events
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/events/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={campusFilter} onValueChange={setCampusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campuses</SelectItem>
                <SelectItem value="preschool">Preschool</SelectItem>
                <SelectItem value="elementary">Elementary</SelectItem>
                <SelectItem value="middle-high">Middle & High School</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
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
          filteredEvents.map((event) => {
            const StatusIcon = statusIcons[event.status || 'draft']
            const rsvpCount = event.event_rsvps?.[0]?.count || 0

            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={statusColors[event.status || 'draft']}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {event.status}
                            </Badge>
                            {event.campus?.map((campus) => (
                              <Badge key={campus} variant="secondary">
                                {campus}
                              </Badge>
                            ))}
                            {event.event_type && (
                              <Badge variant="outline">{event.event_type}</Badge>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/calendar/${event.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/events/${event.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(event.id)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            {event.status === 'draft' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handlePublish(event.id)}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Publish
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(event.id, event.title)}
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.event_date)}</span>
                        </div>
                        {event.max_attendees && (
                          <div>
                            {event.current_attendees || 0} / {event.max_attendees} attendees
                          </div>
                        )}
                        {rsvpCount > 0 && (
                          <div className="text-green-600 font-medium">
                            {rsvpCount} RSVPs
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
