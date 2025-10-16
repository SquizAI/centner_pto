'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { VolunteerShift } from '@/types/calendar.types';

interface ShiftCardProps {
  shift: VolunteerShift;
  onSignUp?: (shift: VolunteerShift) => void;
  showSignedUpVolunteers?: boolean;
  isUserSignedUp?: boolean;
  className?: string;
}

export function ShiftCard({
  shift,
  onSignUp,
  showSignedUpVolunteers = false,
  isUserSignedUp = false,
  className,
}: ShiftCardProps) {
  // Calculate availability
  const availableSpots = shift.available_spots;
  const isFull = availableSpots <= 0;
  const isAlmostFull = availableSpots > 0 && availableSpots <= 2;
  const capacityPercentage = (shift.current_signups / shift.max_volunteers) * 100;

  // Format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const timeRange = `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}`;

  // Calculate duration
  const calculateDuration = () => {
    const [startHours, startMinutes] = shift.start_time.split(':').map(Number);
    const [endHours, endMinutes] = shift.end_time.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const duration = calculateDuration();

  const handleSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSignUp && !isFull && !isUserSignedUp) {
      onSignUp(shift);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('h-full', className)}
    >
      <Card className={cn(
        'h-full flex flex-col transition-all duration-300',
        isUserSignedUp && 'ring-2 ring-primary',
        !isUserSignedUp && 'hover:shadow-md'
      )}>
        <CardContent className="flex-1 pt-4 space-y-3">
          {/* Shift Title */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-base line-clamp-2">{shift.title}</h4>
            {isUserSignedUp && (
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" aria-label="You are signed up" />
            )}
          </div>

          {/* Time and Duration */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <span className="font-medium">{timeRange}</span>
              <Badge variant="outline" className="text-xs ml-auto">
                {duration}
              </Badge>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                  <span
                    className={cn(
                      'font-medium',
                      isFull && 'text-destructive',
                      isAlmostFull && 'text-amber-600'
                    )}
                  >
                    {isFull
                      ? 'Fully Booked'
                      : `${availableSpots} ${availableSpots === 1 ? 'spot' : 'spots'} left`}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {shift.current_signups}/{shift.max_volunteers}
                </span>
              </div>

              <Progress
                value={capacityPercentage}
                className={cn(
                  'h-2',
                  capacityPercentage >= 100 && '[&>div]:bg-destructive',
                  capacityPercentage >= 75 && capacityPercentage < 100 && '[&>div]:bg-amber-500'
                )}
                aria-label={`${shift.current_signups} of ${shift.max_volunteers} spots filled`}
              />
            </div>
          </div>

          {/* Requirements */}
          {shift.requirements && (
            <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Requirements
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200 line-clamp-2">
                  {shift.requirements}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3">
          {isUserSignedUp ? (
            <div className="w-full text-center py-2 px-4 bg-primary/10 text-primary rounded-md font-semibold text-sm">
              You're signed up for this shift
            </div>
          ) : (
            <Button
              onClick={handleSignUp}
              disabled={isFull}
              className={cn(
                'w-full font-semibold transition-all',
                isFull && 'cursor-not-allowed opacity-50'
              )}
              size="sm"
              aria-label={isFull ? 'Shift is full' : `Sign up for ${shift.title}`}
            >
              {isFull ? 'Shift Full' : 'Sign Up for Shift'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Skeleton loading state
export function ShiftCardSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 pt-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-2 w-full bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <div className="h-9 w-full bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}
