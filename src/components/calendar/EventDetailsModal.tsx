'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Download,
  X,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  CalendarEvent,
  EVENT_TYPE_CONFIG,
  EVENT_CAMPUS_CONFIG,
  EventType,
  EventCampus,
  VolunteerShift,
} from '@/types/calendar.types';
import { ShiftCard } from './ShiftCard';

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignUp?: (event: CalendarEvent, shift?: VolunteerShift) => void;
  onShiftSignUp?: (shift: VolunteerShift) => void;
}

export function EventDetailsModal({
  event,
  open,
  onOpenChange,
  onSignUp,
  onShiftSignUp,
}: EventDetailsModalProps) {
  if (!event) return null;

  const eventDate = new Date(event.event_date);
  const eventType = (event.event_type as EventType) || 'other';
  const typeConfig = EVENT_TYPE_CONFIG[eventType];

  // Calculate capacity
  const hasCapacity = event.max_attendees && event.max_attendees > 0;
  const currentAttendees = event.current_attendees || 0;
  const maxAttendees = event.max_attendees || 0;
  const availableSpots = hasCapacity ? maxAttendees - currentAttendees : null;
  const isFull = hasCapacity && currentAttendees >= maxAttendees;
  const capacityPercentage = hasCapacity ? (currentAttendees / maxAttendees) * 100 : 0;

  // Status checks
  const isCancelled = event.status === 'cancelled';
  const isPast = eventDate < new Date();

  // Campus badges
  const campuses = Array.isArray(event.campus) ? event.campus : [];

  // Volunteer shifts
  const hasShifts = event.shifts && event.shifts.length > 0;

  // Share event
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || '',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Generate iCal file
  const handleAddToCalendar = () => {
    const icsContent = generateICSFile(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Google Calendar link
  const getGoogleCalendarLink = () => {
    const startDate = format(eventDate, "yyyyMMdd'T'HHmmss");
    const endDate = event.end_date
      ? format(new Date(event.end_date), "yyyyMMdd'T'HHmmss")
      : format(eventDate, "yyyyMMdd'T'HHmmss");

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description || '',
      location: event.location || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge
                  className={cn(
                    'font-semibold',
                    typeConfig.bgColor,
                    typeConfig.textColor,
                    'border-none'
                  )}
                >
                  {typeConfig.label}
                </Badge>

                {campuses.map((campus) => {
                  const campusConfig = EVENT_CAMPUS_CONFIG[campus as EventCampus];
                  if (!campusConfig) return null;
                  return (
                    <Badge
                      key={campus}
                      variant="outline"
                      className={cn('text-xs', campusConfig.textColor)}
                    >
                      {campusConfig.label}
                    </Badge>
                  );
                })}

                {isCancelled && <Badge variant="destructive">Cancelled</Badge>}

                {isPast && !isCancelled && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Past Event
                  </Badge>
                )}
              </div>

              <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight">
                {event.title}
              </DialogTitle>

              {event.description && (
                <DialogDescription className="text-base mt-2">
                  {event.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Event Image */}
          {event.image_url && (
            <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          )}

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <time dateTime={eventDate.toISOString()} className="font-semibold">
                    {format(eventDate, 'EEEE, MMMM d, yyyy')}
                  </time>
                </div>
              </div>

              {event.end_date && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time</p>
                    <p className="font-semibold">
                      {format(eventDate, 'h:mm a')} - {format(new Date(event.end_date), 'h:mm a')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="font-semibold">{event.location}</p>
                  </div>
                </div>
              )}

              {hasCapacity && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Capacity</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={cn(
                            'font-semibold',
                            isFull && 'text-destructive',
                            capacityPercentage > 75 && capacityPercentage < 100 && 'text-amber-600'
                          )}
                        >
                          {isFull
                            ? 'Event Full'
                            : `${availableSpots} ${availableSpots === 1 ? 'spot' : 'spots'} available`}
                        </span>
                        <span className="text-muted-foreground">
                          {currentAttendees}/{maxAttendees}
                        </span>
                      </div>
                      <Progress
                        value={capacityPercentage}
                        className={cn(
                          'h-2',
                          capacityPercentage >= 100 && '[&>div]:bg-destructive',
                          capacityPercentage >= 75 && capacityPercentage < 100 && '[&>div]:bg-amber-500'
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Volunteer Shifts */}
          {hasShifts && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Available Volunteer Shifts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.shifts!.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    onSignUp={onShiftSignUp}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-1 gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Event
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleAddToCalendar}
                  className="flex-1 gap-2"
                >
                  <Download className="h-4 w-4" />
                  iCal
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="flex-1 gap-2"
                >
                  <a href={getGoogleCalendarLink()} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Google
                  </a>
                </Button>
              </div>
            </div>

            {!isPast && !isCancelled && !hasShifts && (
              <Button
                onClick={() => onSignUp && onSignUp(event)}
                disabled={isFull}
                size="lg"
                className="sm:w-auto font-semibold"
              >
                {isFull ? 'Event Full' : event.user_rsvp ? 'Already Registered' : 'Sign Up for Event'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to generate ICS file content
function generateICSFile(event: CalendarEvent): string {
  const startDate = format(new Date(event.event_date), "yyyyMMdd'T'HHmmss");
  const endDate = event.end_date
    ? format(new Date(event.end_date), "yyyyMMdd'T'HHmmss")
    : format(new Date(event.event_date), "yyyyMMdd'T'HHmmss");

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Centner PTO//Event//EN
BEGIN:VEVENT
UID:${event.id}@centnerpto.org
DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
STATUS:${event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}
END:VEVENT
END:VCALENDAR`;
}
