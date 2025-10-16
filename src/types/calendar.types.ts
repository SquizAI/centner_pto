import { Tables } from './database.types';

// Base event types from database
export type Event = Tables<'events'>;
export type EventRSVP = Tables<'event_rsvps'>;
export type VolunteerOpportunity = Tables<'volunteer_opportunities'>;

// Event type categories
export type EventType =
  | 'fundraiser'
  | 'volunteer'
  | 'social'
  | 'meeting'
  | 'educational'
  | 'community'
  | 'sports'
  | 'arts'
  | 'other';

// Campus type for events
export type EventCampus = 'all' | 'preschool' | 'elementary' | 'middle_high';

// Event status types
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

// Calendar view types
export type CalendarView = 'month' | 'week' | 'day';

// Extended event with additional metadata
export interface CalendarEvent extends Event {
  shifts?: VolunteerShift[];
  rsvp_count?: number;
  user_rsvp?: EventRSVP | null;
  user_volunteer_signup?: boolean;
}

// Volunteer shift within an event
export interface VolunteerShift {
  id: string;
  event_id: string;
  title: string;
  start_time: string;
  end_time: string;
  max_volunteers: number;
  current_signups: number;
  requirements?: string;
  available_spots: number;
}

// Calendar date with events
export interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
  eventCount: number;
}

// Calendar filter options
export interface CalendarFilters {
  campus: EventCampus[];
  eventType: EventType[];
  myEvents: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Event type configuration for styling
export const EVENT_TYPE_CONFIG: Record<EventType, {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}> = {
  fundraiser: {
    label: 'Fundraiser',
    color: 'hsl(var(--accent))',
    bgColor: 'bg-[hsl(var(--accent))]/10',
    textColor: 'text-[hsl(var(--accent))]',
    icon: 'DollarSign',
  },
  volunteer: {
    label: 'Volunteer',
    color: 'hsl(var(--bright-green))',
    bgColor: 'bg-[hsl(82_80%_44%)]/10',
    textColor: 'text-[hsl(82_80%_44%)]',
    icon: 'Heart',
  },
  social: {
    label: 'Social',
    color: 'hsl(var(--secondary))',
    bgColor: 'bg-[hsl(var(--secondary))]/10',
    textColor: 'text-[hsl(var(--secondary))]',
    icon: 'Users',
  },
  meeting: {
    label: 'Meeting',
    color: 'hsl(var(--primary))',
    bgColor: 'bg-[hsl(var(--primary))]/10',
    textColor: 'text-[hsl(var(--primary))]',
    icon: 'Calendar',
  },
  educational: {
    label: 'Educational',
    color: 'hsl(var(--teal-blue))',
    bgColor: 'bg-[hsl(196_73%_53%)]/10',
    textColor: 'text-[hsl(196_73%_53%)]',
    icon: 'BookOpen',
  },
  community: {
    label: 'Community',
    color: 'hsl(var(--light-blue))',
    bgColor: 'bg-[hsl(197_79%_63%)]/10',
    textColor: 'text-[hsl(197_79%_63%)]',
    icon: 'Home',
  },
  sports: {
    label: 'Sports',
    color: 'hsl(20 98% 57%)',
    bgColor: 'bg-[hsl(20_98%_57%)]/10',
    textColor: 'text-[hsl(20_98%_57%)]',
    icon: 'Trophy',
  },
  arts: {
    label: 'Arts',
    color: 'hsl(280 80% 60%)',
    bgColor: 'bg-[hsl(280_80%_60%)]/10',
    textColor: 'text-[hsl(280_80%_60%)]',
    icon: 'Palette',
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--muted-foreground))',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    icon: 'Calendar',
  },
};

// Campus configuration for styling
export const EVENT_CAMPUS_CONFIG: Record<EventCampus, {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  all: {
    label: 'All Campuses',
    color: 'hsl(var(--primary))',
    bgColor: 'bg-[hsl(var(--primary))]/10',
    textColor: 'text-[hsl(var(--primary))]',
    borderColor: 'border-[hsl(var(--primary))]/20',
  },
  preschool: {
    label: 'Preschool',
    color: 'hsl(var(--preschool))',
    bgColor: 'bg-[hsl(var(--preschool))]/10',
    textColor: 'text-[hsl(var(--preschool))]',
    borderColor: 'border-[hsl(var(--preschool))]/20',
  },
  elementary: {
    label: 'Elementary',
    color: 'hsl(var(--elementary))',
    bgColor: 'bg-[hsl(var(--elementary))]/10',
    textColor: 'text-[hsl(var(--elementary))]',
    borderColor: 'border-[hsl(var(--elementary))]/20',
  },
  middle_high: {
    label: 'Middle & High School',
    color: 'hsl(var(--middle-high))',
    bgColor: 'bg-[hsl(var(--middle-high))]/10',
    textColor: 'text-[hsl(var(--middle-high))]',
    borderColor: 'border-[hsl(var(--middle-high))]/20',
  },
};
