import { Tables } from './database.types';

// Volunteer types from database
export type VolunteerOpportunity = Tables<'volunteer_opportunities'>;
export type VolunteerSignup = Tables<'volunteer_signups'>;

// Campus type for volunteer opportunities
export type VolunteerCampus = 'all' | 'preschool' | 'elementary' | 'middle-high';

// Campus configuration for styling and labels
export const VOLUNTEER_CAMPUS_CONFIG: Record<VolunteerCampus, {
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
    borderColor: 'border-[hsl(var(--primary))]',
  },
  preschool: {
    label: 'Preschool',
    color: 'hsl(var(--preschool))',
    bgColor: 'bg-[hsl(var(--preschool))]/10',
    textColor: 'text-[hsl(var(--preschool))]',
    borderColor: 'border-[hsl(var(--preschool))]',
  },
  elementary: {
    label: 'Elementary',
    color: 'hsl(var(--elementary))',
    bgColor: 'bg-[hsl(var(--elementary))]/10',
    textColor: 'text-[hsl(var(--elementary))]',
    borderColor: 'border-[hsl(var(--elementary))]',
  },
  'middle-high': {
    label: 'Middle & High School',
    color: 'hsl(var(--middle-high))',
    bgColor: 'bg-[hsl(var(--middle-high))]/10',
    textColor: 'text-[hsl(var(--middle-high))]',
    borderColor: 'border-[hsl(var(--middle-high))]',
  },
};

// Helper type for opportunity with available spots
export interface OpportunityWithAvailability extends VolunteerOpportunity {
  available_spots?: number;
  is_full?: boolean;
}

// Filter options
export type DateFilter = 'upcoming' | 'this-week' | 'this-month' | 'all';

export interface VolunteerFilters {
  campus: VolunteerCampus | null;
  dateRange: DateFilter;
}

// User commitment from helper function
export interface UserCommitment {
  opportunity_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  signup_notes: string | null;
}
