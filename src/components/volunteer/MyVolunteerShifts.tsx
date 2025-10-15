'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  VOLUNTEER_CAMPUS_CONFIG,
  VolunteerCampus,
} from '@/types/volunteer.types';

interface VolunteerShift {
  id: string;
  opportunity_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  campus: string;
  notes: string | null;
  status: string;
}

interface MyVolunteerShiftsProps {
  shifts: VolunteerShift[];
  isLoading?: boolean;
  onCancelSignup: (signupId: string) => Promise<void>;
  className?: string;
}

export function MyVolunteerShifts({
  shifts,
  isLoading = false,
  onCancelSignup,
  className,
}: MyVolunteerShiftsProps) {
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = React.useState<string | null>(null);

  // Filter to only show confirmed upcoming shifts
  const upcomingShifts = shifts
    .filter((shift) => {
      const shiftDate = new Date(shift.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return shift.status === 'confirmed' && shiftDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleCancelClick = (shiftId: string) => {
    setConfirmCancelId(shiftId);
  };

  const handleConfirmCancel = async () => {
    if (!confirmCancelId) return;

    setCancellingId(confirmCancelId);

    try {
      await onCancelSignup(confirmCancelId);
      setConfirmCancelId(null);
    } catch (error) {
      console.error('Failed to cancel signup:', error);
    } finally {
      setCancellingId(null);
    }
  };

  // Format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(3)].map((_, index) => (
          <MyVolunteerShiftSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (upcomingShifts.length === 0) {
    return (
      <Card className={cn('text-center py-12', className)}>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Upcoming Volunteer Shifts</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              You haven&apos;t signed up for any volunteer opportunities yet. Browse available
              opportunities and sign up to help support our school community!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <AnimatePresence mode="popLayout">
        {upcomingShifts.map((shift) => {
          const campusConfig = VOLUNTEER_CAMPUS_CONFIG[shift.campus as VolunteerCampus];
          const shiftDate = new Date(shift.date);
          const timeRange = `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}`;
          const isCancelling = cancellingId === shift.id;

          return (
            <motion.div
              key={shift.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
                        {shift.title}
                      </h3>
                      <Badge
                        className={cn(
                          'font-semibold',
                          campusConfig.bgColor,
                          campusConfig.textColor,
                          'border-none'
                        )}
                      >
                        {campusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar
                      className="h-4 w-4 text-muted-foreground flex-shrink-0"
                      aria-hidden="true"
                    />
                    <time dateTime={shiftDate.toISOString()} className="font-medium">
                      {format(shiftDate, 'EEEE, MMMM d, yyyy')}
                    </time>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock
                      className="h-4 w-4 text-muted-foreground flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>{timeRange}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin
                      className="h-4 w-4 text-muted-foreground flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="line-clamp-1">{shift.location}</span>
                  </div>

                  {/* User Notes */}
                  {shift.notes && (
                    <div className="flex items-start gap-2 text-sm pt-2 mt-2 border-t border-border">
                      <MessageSquare
                        className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-xs text-muted-foreground mb-1">
                          Your Notes
                        </div>
                        <p className="text-sm">{shift.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelClick(shift.id)}
                    disabled={isCancelling}
                    className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Signup'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmCancelId !== null}
        onOpenChange={(open) => !open && setConfirmCancelId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Volunteer Signup?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your signup for this volunteer opportunity? The
              volunteer coordinator is counting on your participation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-200">
                Please only cancel if absolutely necessary. Frequent cancellations may affect
                future volunteer opportunities.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmCancelId(null)}
              disabled={cancellingId !== null}
            >
              Keep Signup
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancellingId !== null}
            >
              {cancellingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Signup'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Skeleton loading state
export function MyVolunteerShiftSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
      </CardContent>
      <CardFooter className="pt-3">
        <div className="h-9 w-full bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}
