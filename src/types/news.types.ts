import { Tables } from './database.types';

// NewsPost type from database
export type NewsPost = Tables<'news_posts'>;

// Campus type for easier usage
export type Campus = 'all' | 'preschool' | 'elementary' | 'middle-high';

// Campus configuration for styling and labels
export const CAMPUS_CONFIG: Record<Campus, { label: string; color: string; bgColor: string; textColor: string }> = {
  all: {
    label: 'All Campuses',
    color: 'hsl(var(--primary))',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
  },
  preschool: {
    label: 'Preschool',
    color: 'hsl(var(--preschool))',
    bgColor: 'bg-[hsl(var(--preschool))]/10',
    textColor: 'text-[hsl(var(--preschool))]',
  },
  elementary: {
    label: 'Elementary',
    color: 'hsl(var(--elementary))',
    bgColor: 'bg-[hsl(var(--elementary))]/10',
    textColor: 'text-[hsl(var(--elementary))]',
  },
  'middle-high': {
    label: 'Middle & High School',
    color: 'hsl(var(--middle-high))',
    bgColor: 'bg-[hsl(var(--middle-high))]/10',
    textColor: 'text-[hsl(var(--middle-high))]',
  },
};
