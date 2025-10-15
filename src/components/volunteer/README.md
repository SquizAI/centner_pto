# Volunteer Components

Professional, production-ready UI components for the Centner Academy PTO volunteer management system.

## Overview

This directory contains all volunteer-related UI components built with:
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible base components
- **Framer Motion** - Smooth animations
- **date-fns** - Date formatting
- **Radix UI** - Accessible primitives

## Components

### 1. VolunteerCard

Displays a volunteer opportunity with all relevant information.

**File:** `VolunteerCard.tsx`

**Props:**
```typescript
interface VolunteerCardProps {
  opportunity: OpportunityWithAvailability;
  className?: string;
  priority?: boolean; // For image loading priority
  onSignUp?: (opportunity: OpportunityWithAvailability) => void;
}
```

**Features:**
- Campus-colored badge
- Date, time, and location display
- Available spots indicator with visual warnings
- Requirements badge (if applicable)
- Sign-up button (disabled when full)
- Hover animations
- Responsive design
- Skeleton loading state

**Usage:**
```tsx
import { VolunteerCard } from '@/components/volunteer';

<VolunteerCard
  opportunity={opportunity}
  onSignUp={(opp) => handleSignUp(opp)}
/>
```

---

### 2. VolunteerGrid

Responsive grid container for displaying multiple volunteer opportunities.

**File:** `VolunteerGrid.tsx`

**Props:**
```typescript
interface VolunteerGridProps {
  opportunities: OpportunityWithAvailability[];
  className?: string;
  columns?: 1 | 2 | 3; // Default: 3
  onSignUp?: (opportunity: OpportunityWithAvailability) => void;
}
```

**Features:**
- Responsive grid layout (1/2/3 columns)
- Empty state message
- Stagger animation on load
- Grid skeleton loader

**Grid Breakpoints:**
- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns

**Usage:**
```tsx
import { VolunteerGrid } from '@/components/volunteer';

<VolunteerGrid
  opportunities={opportunities}
  columns={3}
  onSignUp={handleSignUp}
/>
```

---

### 3. VolunteerFilter

Filter controls for campus and date range selection.

**File:** `VolunteerFilter.tsx`

**Props:**
```typescript
interface VolunteerFilterProps {
  filters: VolunteerFilters;
  onFilterChange: (filters: VolunteerFilters) => void;
  className?: string;
}

interface VolunteerFilters {
  campus: VolunteerCampus | null;
  dateRange: DateFilter;
}

type DateFilter = 'upcoming' | 'this-week' | 'this-month' | 'all';
```

**Features:**
- Campus filter badges (All, Preschool, Elementary, Middle-High)
- Date range filter buttons
- Active filters summary
- Keyboard navigation support
- Visual feedback for selected filters

**Usage:**
```tsx
import { VolunteerFilter } from '@/components/volunteer';
import { useState } from 'react';

const [filters, setFilters] = useState<VolunteerFilters>({
  campus: null,
  dateRange: 'upcoming'
});

<VolunteerFilter
  filters={filters}
  onFilterChange={setFilters}
/>
```

---

### 4. SignupForm

Modal form for volunteers to sign up for opportunities.

**File:** `SignupForm.tsx`

**Props:**
```typescript
interface SignupFormProps {
  opportunity: OpportunityWithAvailability | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (opportunityId: string, notes: string) => Promise<void>;
}
```

**Features:**
- Full opportunity details display
- Optional notes textarea
- Required agreement checkbox
- Form validation
- Loading states
- Error handling
- Success/cancel callbacks
- Auto-reset on close

**Validation:**
- User must check agreement checkbox
- Handles async submission
- Displays error messages

**Usage:**
```tsx
import { SignupForm } from '@/components/volunteer';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);
const [selectedOpp, setSelectedOpp] = useState(null);

const handleSubmit = async (opportunityId: string, notes: string) => {
  const { error } = await supabase
    .from('volunteer_signups')
    .insert({
      opportunity_id: opportunityId,
      user_id: userId,
      notes: notes || null,
      status: 'confirmed'
    });

  if (error) throw error;
};

<SignupForm
  opportunity={selectedOpp}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={() => {
    toast.success('Successfully signed up!');
    refreshData();
  }}
  onSubmit={handleSubmit}
/>
```

---

### 5. MyVolunteerShifts

Displays user's upcoming volunteer commitments with cancel functionality.

**File:** `MyVolunteerShifts.tsx`

**Props:**
```typescript
interface MyVolunteerShiftsProps {
  shifts: VolunteerShift[];
  isLoading?: boolean;
  onCancelSignup: (signupId: string) => Promise<void>;
  className?: string;
}

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
```

**Features:**
- Chronologically sorted upcoming shifts
- Campus-colored badges
- User notes display
- Cancel signup button
- Confirmation dialog
- Loading states
- Empty state message
- Exit animations
- Skeleton loaders

**Usage:**
```tsx
import { MyVolunteerShifts } from '@/components/volunteer';

const handleCancel = async (signupId: string) => {
  const { error } = await supabase
    .from('volunteer_signups')
    .update({ status: 'cancelled' })
    .eq('id', signupId);

  if (error) throw error;
};

<MyVolunteerShifts
  shifts={userShifts}
  isLoading={loading}
  onCancelSignup={handleCancel}
/>
```

---

## Type Definitions

All types are defined in `/src/types/volunteer.types.ts`:

```typescript
// Main database types
export type VolunteerOpportunity = Tables<'volunteer_opportunities'>;
export type VolunteerSignup = Tables<'volunteer_signups'>;

// Campus types
export type VolunteerCampus = 'all' | 'preschool' | 'elementary' | 'middle-high';

// Filter types
export type DateFilter = 'upcoming' | 'this-week' | 'this-month' | 'all';

// Extended types
export interface OpportunityWithAvailability extends VolunteerOpportunity {
  available_spots?: number;
  is_full?: boolean;
}
```

---

## Campus Color System

Campus colors are defined in `volunteer.types.ts` and match the global theme:

```typescript
export const VOLUNTEER_CAMPUS_CONFIG = {
  all: {
    label: 'All Campuses',
    color: 'hsl(var(--primary))',
    bgColor: 'bg-[hsl(var(--primary))]/10',
    textColor: 'text-[hsl(var(--primary))]',
    borderColor: 'border-[hsl(var(--primary))]',
  },
  preschool: {
    label: 'Preschool',
    color: 'hsl(var(--preschool))', // Pink #EC4E88
    // ... other colors
  },
  elementary: {
    label: 'Elementary',
    color: 'hsl(var(--elementary))', // Light Blue #57BAEB
    // ... other colors
  },
  'middle-high': {
    label: 'Middle & High School',
    color: 'hsl(var(--middle-high))', // Orange #FC6F24
    // ... other colors
  },
};
```

---

## Accessibility Features

All components follow WCAG 2.1 AA standards:

- ✅ Semantic HTML elements
- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus indicators (visible outlines)
- ✅ Screen reader announcements
- ✅ Color contrast compliance
- ✅ Form field labels
- ✅ Error messages associated with fields
- ✅ Loading states announced
- ✅ Icon alt text and aria-hidden

---

## Animation Details

Using Framer Motion for smooth, performant animations:

### Card Entrance
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

### Card Hover
```typescript
whileHover={{ y: -4 }}
```

### Grid Stagger Effect
```typescript
transition={{ duration: 0.3, delay: index * 0.1 }}
```

### Exit Animation
```typescript
exit={{ opacity: 0, x: -100 }}
```

---

## Integration Example

Complete page implementation example:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  VolunteerGrid,
  VolunteerFilter,
  SignupForm,
  MyVolunteerShifts,
} from '@/components/volunteer';
import type { VolunteerFilters, OpportunityWithAvailability } from '@/types/volunteer.types';

export default function VolunteerPage() {
  const supabase = createClient();
  const [opportunities, setOpportunities] = useState<OpportunityWithAvailability[]>([]);
  const [filters, setFilters] = useState<VolunteerFilters>({
    campus: null,
    dateRange: 'upcoming',
  });
  const [selectedOpp, setSelectedOpp] = useState<OpportunityWithAvailability | null>(null);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // Fetch opportunities with filters
  useEffect(() => {
    const fetchOpportunities = async () => {
      let query = supabase
        .from('volunteer_opportunities')
        .select('*')
        .eq('status', 'active');

      // Apply filters
      if (filters.campus) {
        query = query.eq('campus', filters.campus);
      }

      // Date filtering logic here

      const { data } = await query.order('date', { ascending: true });
      setOpportunities(data || []);
    };

    fetchOpportunities();
  }, [filters]);

  const handleSignUp = (opportunity: OpportunityWithAvailability) => {
    setSelectedOpp(opportunity);
    setIsSignupOpen(true);
  };

  const handleSubmitSignup = async (opportunityId: string, notes: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in');

    const { error } = await supabase
      .from('volunteer_signups')
      .insert({
        opportunity_id: opportunityId,
        user_id: user.id,
        notes: notes || null,
        status: 'confirmed',
      });

    if (error) throw error;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Volunteer Opportunities</h1>

      <VolunteerFilter
        filters={filters}
        onFilterChange={setFilters}
        className="mb-8"
      />

      <VolunteerGrid
        opportunities={opportunities}
        onSignUp={handleSignUp}
      />

      <SignupForm
        opportunity={selectedOpp}
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSuccess={() => {
          // Refresh data, show success message
        }}
        onSubmit={handleSubmitSignup}
      />
    </div>
  );
}
```

---

## Database Queries

### Fetch Active Opportunities
```typescript
const { data: opportunities } = await supabase
  .from('volunteer_opportunities')
  .select('*')
  .eq('status', 'active')
  .gte('date', new Date().toISOString().split('T')[0])
  .order('date', { ascending: true });
```

### Create Signup
```typescript
const { error } = await supabase
  .from('volunteer_signups')
  .insert({
    opportunity_id: opportunityId,
    user_id: userId,
    notes: notes,
    status: 'confirmed'
  });
```

### Cancel Signup
```typescript
const { error } = await supabase
  .from('volunteer_signups')
  .update({ status: 'cancelled' })
  .eq('id', signupId);
```

### Fetch User's Upcoming Shifts
```typescript
const { data: shifts } = await supabase
  .rpc('get_user_upcoming_commitments', {
    user_uuid: userId
  });
```

---

## Client vs Server Components

**Client Components** (use 'use client'):
- VolunteerCard - Needs hover effects and click handlers
- VolunteerGrid - Needs animations
- VolunteerFilter - Needs state management
- SignupForm - Needs form state and validation
- MyVolunteerShifts - Needs interactive cancel functionality

**Server Components** (for pages):
- Fetch initial data server-side
- Pass to client components as props

---

## Dependencies

Required packages (already installed):
- `framer-motion` - Animations
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `@radix-ui/react-*` - Accessible primitives
- `tailwindcss` - Styling
- `class-variance-authority` - Variant styling
- `clsx` and `tailwind-merge` - Class utilities

---

## File Structure

```
src/components/volunteer/
├── VolunteerCard.tsx        # Card component for opportunities
├── VolunteerGrid.tsx        # Grid layout container
├── VolunteerFilter.tsx      # Filter controls
├── SignupForm.tsx           # Signup modal form
├── MyVolunteerShifts.tsx    # User's upcoming shifts
├── index.ts                 # Barrel export
└── README.md                # This file

src/types/
└── volunteer.types.ts       # Type definitions

src/components/ui/
└── checkbox.tsx             # New checkbox component
```

---

## Next Steps for Integration

1. **Create pages:**
   - `/volunteer` - Browse opportunities page
   - `/volunteer/my-shifts` - User's shifts dashboard

2. **Add authentication checks:**
   - Require login to sign up
   - Show user-specific data in MyVolunteerShifts

3. **Add notifications:**
   - Toast on successful signup
   - Email confirmation
   - Reminder emails

4. **Add admin features:**
   - Create/edit opportunities
   - Manage signups
   - Export volunteer lists

---

## Support

For questions or issues with these components, please refer to:
- Component source code comments
- Type definitions in `volunteer.types.ts`
- shadcn/ui documentation
- Framer Motion documentation
