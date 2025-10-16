'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CalendarEvent, EVENT_TYPE_CONFIG, EVENT_CAMPUS_CONFIG, EventType, EventCampus } from '@/types/calendar.types';

interface EventCardProps {
  event: CalendarEvent;
  className?: string;
  onSignUp?: (event: CalendarEvent) => void;
  onViewDetails?: (event: CalendarEvent) => void;
  showImage?: boolean;
  compact?: boolean;
}

export function EventCard({
  event,
  className,
  onSignUp,
  onViewDetails,
  showImage = true,
  compact = false,
}: EventCardProps) {
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

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSignUp && !isFull && !isCancelled) {
      onSignUp(event);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(event);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={cn('h-full', className)}
    >
      <Card
        className={cn(
          'h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg cursor-pointer',
          isCancelled && 'opacity-60'
        )}
        onClick={handleViewDetails}
      >
        {/* Event Image */}
        {showImage && event.image_url && !compact && (
          <div className="relative w-full h-48 bg-muted">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {isCancelled && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  CANCELLED
                </Badge>
              </div>
            )}
          </div>
        )}

        {!event.image_url && showImage && !compact && (
          <div className="relative w-full h-48 bg-muted flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
          </div>
        )}

        <CardHeader className="space-y-3">
          {/* Type and Campus Badges */}
          <div className="flex flex-wrap items-start gap-2">
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

            {campuses.length > 0 && campuses.map((campus) => {
              const campusConfig = EVENT_CAMPUS_CONFIG[campus as EventCampus];
              if (!campusConfig) return null;
              return (
                <Badge
                  key={campus}
                  variant="outline"
                  className={cn(
                    'text-xs',
                    campusConfig.textColor,
                    campusConfig.borderColor
                  )}
                >
                  {campusConfig.label}
                </Badge>
              );
            })}

            {isCancelled && (
              <Badge variant="destructive">Cancelled</Badge>
            )}

            {isPast && !isCancelled && (
              <Badge variant="outline" className="text-muted-foreground">
                Past Event
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className={cn(
            'font-bold leading-tight tracking-tight',
            compact ? 'text-lg line-clamp-1' : 'text-xl line-clamp-2'
          )}>
            {event.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          {/* Description */}
          {event.description && !compact && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Event Details */}
          <div className="space-y-2">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <time dateTime={eventDate.toISOString()}>
                {format(eventDate, 'EEEE, MMMM d, yyyy')}
              </time>
            </div>

            {/* Time */}
            {event.end_date && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                <span>
                  {format(eventDate, 'h:mm a')}
                  {event.end_date && ` - ${format(new Date(event.end_date), 'h:mm a')}`}
                </span>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}

            {/* Capacity */}
            {hasCapacity && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                    <span
                      className={cn(
                        'font-medium',
                        isFull && 'text-destructive',
                        capacityPercentage > 75 && capacityPercentage < 100 && 'text-amber-600'
                      )}
                    >
                      {isFull
                        ? 'Event Full'
                        : `${availableSpots} ${availableSpots === 1 ? 'spot' : 'spots'} available`}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
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
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-4 flex gap-2">
          <Button
            onClick={handleViewDetails}
            variant="outline"
            className="flex-1"
            aria-label={`View details for ${event.title}`}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>

          {!isPast && !isCancelled && (
            <Button
              onClick={handleSignUpClick}
              disabled={!!isFull}
              className={cn(
                'flex-1 font-semibold transition-all',
                isFull && 'cursor-not-allowed opacity-50'
              )}
              aria-label={isFull ? 'Event is full' : `Sign up for ${event.title}`}
            >
              {isFull ? 'Full' : event.user_rsvp ? 'Registered' : 'Sign Up'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Compact version for lists
export function EventCardCompact({
  event,
  className,
  onViewDetails,
}: Omit<EventCardProps, 'compact' | 'showImage'>) {
  return (
    <EventCard
      event={event}
      className={className}
      onViewDetails={onViewDetails}
      compact
      showImage={false}
    />
  );
}

// Export a skeleton loading state
export function EventCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {!compact && <div className="w-full h-48 bg-muted animate-pulse" />}

      <CardHeader className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-full bg-muted animate-pulse rounded" />
          <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {!compact && (
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
          </div>
        )}
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}
