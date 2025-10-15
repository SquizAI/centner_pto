import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import type { DateFilter } from '@/types/volunteer.types';

/**
 * Get date range based on filter selection
 */
export function getDateRange(filter: DateFilter): { start: Date; end: Date | null } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filter) {
    case 'upcoming':
      return { start: today, end: null };

    case 'this-week': {
      const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
      return { start: weekStart, end: weekEnd };
    }

    case 'this-month': {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      return { start: monthStart, end: monthEnd };
    }

    case 'all':
      // Return a date far in the past for "all"
      return { start: new Date('2000-01-01'), end: null };

    default:
      return { start: today, end: null };
  }
}

/**
 * Format time string (HH:MM:SS) to readable format (h:mm AM/PM)
 */
export function formatTimeString(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format time range
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`;
}

/**
 * Calculate available spots for an opportunity
 */
export function calculateAvailableSpots(
  maxVolunteers: number,
  currentSignups: number
): number {
  return Math.max(0, maxVolunteers - currentSignups);
}

/**
 * Check if opportunity is full
 */
export function isOpportunityFull(
  maxVolunteers: number,
  currentSignups: number
): boolean {
  return currentSignups >= maxVolunteers;
}

/**
 * Check if opportunity is almost full (3 or fewer spots)
 */
export function isOpportunityAlmostFull(
  maxVolunteers: number,
  currentSignups: number
): boolean {
  const available = calculateAvailableSpots(maxVolunteers, currentSignups);
  return available > 0 && available <= 3;
}

/**
 * Sort opportunities by date (ascending)
 */
export function sortOpportunitiesByDate<T extends { date: string }>(
  opportunities: T[]
): T[] {
  return [...opportunities].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

/**
 * Filter opportunities by date range
 */
export function filterOpportunitiesByDateRange<T extends { date: string }>(
  opportunities: T[],
  dateFilter: DateFilter
): T[] {
  const { start, end } = getDateRange(dateFilter);

  return opportunities.filter((opp) => {
    const oppDate = new Date(opp.date);
    oppDate.setHours(0, 0, 0, 0);

    if (end) {
      return oppDate >= start && oppDate <= end;
    }

    return oppDate >= start;
  });
}

/**
 * Get status badge variant and text for signup status
 */
export function getSignupStatusInfo(status: string): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  label: string;
} {
  switch (status) {
    case 'confirmed':
      return { variant: 'default', label: 'Confirmed' };
    case 'cancelled':
      return { variant: 'destructive', label: 'Cancelled' };
    case 'completed':
      return { variant: 'secondary', label: 'Completed' };
    default:
      return { variant: 'outline', label: status };
  }
}

/**
 * Validate if user can sign up for an opportunity
 */
export function canSignUpForOpportunity(
  opportunityDate: string,
  maxVolunteers: number,
  currentSignups: number
): { canSignUp: boolean; reason?: string } {
  // Check if past date
  const oppDate = new Date(opportunityDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (oppDate < today) {
    return { canSignUp: false, reason: 'This opportunity has passed' };
  }

  // Check if full
  if (isOpportunityFull(maxVolunteers, currentSignups)) {
    return { canSignUp: false, reason: 'This opportunity is fully booked' };
  }

  return { canSignUp: true };
}

/**
 * Get spots remaining text
 */
export function getSpotsRemainingText(
  maxVolunteers: number,
  currentSignups: number
): string {
  const available = calculateAvailableSpots(maxVolunteers, currentSignups);

  if (available === 0) {
    return 'Fully Booked';
  }

  if (available === 1) {
    return '1 spot remaining';
  }

  return `${available} of ${maxVolunteers} spots available`;
}

/**
 * Check if date is in the past
 */
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Check if date is upcoming (future)
 */
export function isUpcoming(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}
