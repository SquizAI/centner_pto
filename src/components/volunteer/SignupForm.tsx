'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, AlertCircle, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  OpportunityWithAvailability,
  VOLUNTEER_CAMPUS_CONFIG,
  VolunteerCampus,
} from '@/types/volunteer.types';

interface SignupFormProps {
  opportunity: OpportunityWithAvailability | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (opportunityId: string, notes: string) => Promise<void>;
}

export function SignupForm({
  opportunity,
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
}: SignupFormProps) {
  const [notes, setNotes] = React.useState('');
  const [agreed, setAgreed] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when dialog closes or opportunity changes
  React.useEffect(() => {
    if (!isOpen) {
      setNotes('');
      setAgreed(false);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!opportunity) {
    return null;
  }

  const campusConfig = VOLUNTEER_CAMPUS_CONFIG[opportunity.campus as VolunteerCampus];
  const opportunityDate = new Date(opportunity.date);
  const availableSpots = opportunity.max_volunteers - opportunity.current_signups;

  // Format time range
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const timeRange = `${formatTime(opportunity.start_time)} - ${formatTime(opportunity.end_time)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      setError('You must agree to commit to this volunteer shift.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(opportunity.id, notes);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sign Up to Volunteer</DialogTitle>
          <DialogDescription>
            Review the details below and confirm your commitment to this volunteer opportunity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Opportunity Details */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold leading-tight pr-2">
                {opportunity.title}
              </h3>
              <Badge
                className={cn(
                  'font-semibold flex-shrink-0',
                  campusConfig.bgColor,
                  campusConfig.textColor,
                  'border-none'
                )}
              >
                {campusConfig.label}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {opportunity.description}
            </p>

            <div className="space-y-2 pt-2">
              {/* Date */}
              <div className="flex items-start gap-2 text-sm">
                <Calendar
                  className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <div className="font-medium">Date</div>
                  <time dateTime={opportunityDate.toISOString()}>
                    {format(opportunityDate, 'EEEE, MMMM d, yyyy')}
                  </time>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-2 text-sm">
                <Clock
                  className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <div className="font-medium">Time</div>
                  <span>{timeRange}</span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin
                  className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <div className="font-medium">Location</div>
                  <span>{opportunity.location}</span>
                </div>
              </div>

              {/* Available Spots */}
              <div className="flex items-start gap-2 text-sm">
                <Users
                  className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <div className="font-medium">Available Spots</div>
                  <span className={cn(availableSpots <= 3 && 'text-amber-600 font-semibold')}>
                    {availableSpots} of {opportunity.max_volunteers} spots remaining
                  </span>
                </div>
              </div>

              {/* Requirements */}
              {opportunity.requirements && (
                <div className="flex items-start gap-2 text-sm pt-2">
                  <AlertCircle
                    className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="font-medium text-amber-600">Special Requirements</div>
                    <span className="text-muted-foreground">{opportunity.requirements}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or questions for the volunteer coordinator..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Let us know if you have any special considerations or questions.
            </p>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              disabled={isSubmitting}
              aria-required="true"
            />
            <div className="flex-1">
              <Label
                htmlFor="agreement"
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I agree to commit to this volunteer shift and understand that the volunteer
                coordinator is counting on my participation. I will notify them as soon as
                possible if I need to cancel.
              </Label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Footer Buttons */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!agreed || isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Up...
                </>
              ) : (
                'Confirm Signup'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
