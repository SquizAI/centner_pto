# Volunteer Components - Implementation Guide

## Quick Start

### 1. Import Components

```typescript
import {
  VolunteerCard,
  VolunteerGrid,
  VolunteerFilter,
  SignupForm,
  MyVolunteerShifts,
} from '@/components/volunteer';
```

### 2. Import Types

```typescript
import type {
  VolunteerOpportunity,
  OpportunityWithAvailability,
  VolunteerFilters,
  VolunteerCampus,
  DateFilter,
} from '@/types/volunteer.types';
```

### 3. Import Utilities

```typescript
import {
  getDateRange,
  formatTimeRange,
  isOpportunityFull,
  filterOpportunitiesByDateRange,
} from '@/lib/volunteer-utils';
```

---

## Common Usage Patterns

### Pattern 1: Browse Opportunities Page

Create a page where users can browse and sign up for volunteer opportunities.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  VolunteerGrid,
  VolunteerFilter,
  SignupForm,
} from '@/components/volunteer';
import type {
  OpportunityWithAvailability,
  VolunteerFilters,
} from '@/types/volunteer.types';

export default function VolunteerPage() {
  const supabase = createClient();
  const [opportunities, setOpportunities] = useState<OpportunityWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<VolunteerFilters>({
    campus: null,
    dateRange: 'upcoming',
  });
  const [selectedOpp, setSelectedOpp] = useState<OpportunityWithAvailability | null>(null);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // Fetch opportunities
  useEffect(() => {
    fetchOpportunities();
  }, [filters]);

  const fetchOpportunities = async () => {
    setLoading(true);

    let query = supabase
      .from('volunteer_opportunities')
      .select('*')
      .eq('status', 'active');

    // Apply campus filter
    if (filters.campus) {
      query = query.eq('campus', filters.campus);
    }

    // Apply date filter
    const today = new Date().toISOString().split('T')[0];
    if (filters.dateRange === 'upcoming') {
      query = query.gte('date', today);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) {
      console.error('Error fetching opportunities:', error);
    } else {
      setOpportunities(data || []);
    }

    setLoading(false);
  };

  const handleSignUp = (opportunity: OpportunityWithAvailability) => {
    setSelectedOpp(opportunity);
    setIsSignupOpen(true);
  };

  const handleSubmitSignup = async (opportunityId: string, notes: string) => {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to sign up');

    // Insert signup
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
      <h1 className="text-4xl font-bold mb-4">Volunteer Opportunities</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Join us in making a difference! Sign up for volunteer opportunities below.
      </p>

      <VolunteerFilter
        filters={filters}
        onFilterChange={setFilters}
        className="mb-8"
      />

      {loading ? (
        <VolunteerGridSkeleton count={6} />
      ) : (
        <VolunteerGrid
          opportunities={opportunities}
          onSignUp={handleSignUp}
        />
      )}

      <SignupForm
        opportunity={selectedOpp}
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSuccess={() => {
          fetchOpportunities(); // Refresh data
          // Optional: Show success toast
        }}
        onSubmit={handleSubmitSignup}
      />
    </div>
  );
}
```

---

### Pattern 2: User Dashboard with My Shifts

Display user's upcoming volunteer shifts.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MyVolunteerShifts } from '@/components/volunteer';

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

export default function MyShiftsPage() {
  const supabase = createClient();
  const [shifts, setShifts] = useState<VolunteerShift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserShifts();
  }, []);

  const fetchUserShifts = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch user's signups with opportunity details
    const { data, error } = await supabase
      .from('volunteer_signups')
      .select(`
        id,
        opportunity_id,
        notes,
        status,
        volunteer_opportunities (
          title,
          date,
          start_time,
          end_time,
          location,
          campus
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .gte('volunteer_opportunities.date', new Date().toISOString().split('T')[0])
      .order('volunteer_opportunities.date', { ascending: true });

    if (error) {
      console.error('Error fetching shifts:', error);
    } else {
      // Transform data to match VolunteerShift interface
      const transformedShifts = data?.map((signup: any) => ({
        id: signup.id,
        opportunity_id: signup.opportunity_id,
        title: signup.volunteer_opportunities.title,
        date: signup.volunteer_opportunities.date,
        start_time: signup.volunteer_opportunities.start_time,
        end_time: signup.volunteer_opportunities.end_time,
        location: signup.volunteer_opportunities.location,
        campus: signup.volunteer_opportunities.campus,
        notes: signup.notes,
        status: signup.status,
      })) || [];

      setShifts(transformedShifts);
    }

    setLoading(false);
  };

  const handleCancelSignup = async (signupId: string) => {
    const { error } = await supabase
      .from('volunteer_signups')
      .update({ status: 'cancelled' })
      .eq('id', signupId);

    if (error) throw error;

    // Remove from local state
    setShifts(shifts.filter(shift => shift.id !== signupId));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">My Volunteer Shifts</h1>
      <p className="text-lg text-muted-foreground mb-8">
        View and manage your upcoming volunteer commitments.
      </p>

      <MyVolunteerShifts
        shifts={shifts}
        isLoading={loading}
        onCancelSignup={handleCancelSignup}
      />
    </div>
  );
}
```

---

### Pattern 3: Using Helper Functions

Leverage utility functions for common operations.

```typescript
import {
  getDateRange,
  formatTimeRange,
  isOpportunityFull,
  isOpportunityAlmostFull,
  canSignUpForOpportunity,
  getSpotsRemainingText,
} from '@/lib/volunteer-utils';

// Example: Check if user can sign up
const opportunity = {
  date: '2025-11-01',
  max_volunteers: 10,
  current_signups: 8,
};

const { canSignUp, reason } = canSignUpForOpportunity(
  opportunity.date,
  opportunity.max_volunteers,
  opportunity.current_signups
);

if (!canSignUp) {
  console.log(reason); // Display to user
}

// Example: Format time range
const timeDisplay = formatTimeRange('14:00:00', '16:00:00');
// Output: "2:00 PM - 4:00 PM"

// Example: Get spots remaining text
const spotsText = getSpotsRemainingText(
  opportunity.max_volunteers,
  opportunity.current_signups
);
// Output: "2 of 10 spots available"

// Example: Check if almost full
if (isOpportunityAlmostFull(10, 8)) {
  // Show warning badge
}
```

---

## Supabase Query Examples

### Fetch Active Opportunities with Filters

```typescript
// Basic query - active opportunities only
const { data: opportunities } = await supabase
  .from('volunteer_opportunities')
  .select('*')
  .eq('status', 'active')
  .gte('date', new Date().toISOString().split('T')[0])
  .order('date', { ascending: true });

// With campus filter
const { data: campusOpportunities } = await supabase
  .from('volunteer_opportunities')
  .select('*')
  .eq('status', 'active')
  .eq('campus', 'elementary')
  .gte('date', new Date().toISOString().split('T')[0])
  .order('date', { ascending: true });

// With date range filter
const weekStart = new Date();
const weekEnd = new Date();
weekEnd.setDate(weekEnd.getDate() + 7);

const { data: weekOpportunities } = await supabase
  .from('volunteer_opportunities')
  .select('*')
  .eq('status', 'active')
  .gte('date', weekStart.toISOString().split('T')[0])
  .lte('date', weekEnd.toISOString().split('T')[0])
  .order('date', { ascending: true });
```

### Check Available Spots Using Helper Function

```typescript
// Use database helper function
const { data: availableSpots } = await supabase
  .rpc('get_available_spots', {
    opportunity_uuid: opportunityId,
  });

// Check if full
const { data: isFull } = await supabase
  .rpc('is_opportunity_full', {
    opportunity_uuid: opportunityId,
  });
```

### Create Volunteer Signup

```typescript
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  throw new Error('Must be logged in to sign up');
}

const { data, error } = await supabase
  .from('volunteer_signups')
  .insert({
    opportunity_id: opportunityId,
    user_id: user.id,
    notes: 'I can help with setup',
    status: 'confirmed',
  })
  .select()
  .single();

if (error) {
  console.error('Signup failed:', error);
  throw error;
}
```

### Fetch User's Upcoming Shifts

```typescript
// Option 1: Use helper function
const { data: userCommitments } = await supabase
  .rpc('get_user_upcoming_commitments', {
    user_uuid: userId,
  });

// Option 2: Manual query with join
const { data: shifts } = await supabase
  .from('volunteer_signups')
  .select(`
    id,
    notes,
    status,
    volunteer_opportunities (
      id,
      title,
      date,
      start_time,
      end_time,
      location,
      campus
    )
  `)
  .eq('user_id', userId)
  .eq('status', 'confirmed')
  .gte('volunteer_opportunities.date', new Date().toISOString().split('T')[0]);
```

### Cancel Signup

```typescript
const { error } = await supabase
  .from('volunteer_signups')
  .update({ status: 'cancelled' })
  .eq('id', signupId)
  .eq('user_id', userId); // Security: ensure user owns this signup

if (error) {
  console.error('Cancel failed:', error);
  throw error;
}
```

### Get User's Total Signup Count

```typescript
const { data: signupCount } = await supabase
  .rpc('get_user_signups_count', {
    user_uuid: userId,
  });
```

---

## Error Handling

### Client-Side Error Handling

```typescript
const handleSubmitSignup = async (opportunityId: string, notes: string) => {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('You must be logged in to sign up');
    }

    // Check if user already signed up
    const { data: existingSignup } = await supabase
      .from('volunteer_signups')
      .select('id')
      .eq('opportunity_id', opportunityId)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single();

    if (existingSignup) {
      throw new Error('You have already signed up for this opportunity');
    }

    // Create signup
    const { error: insertError } = await supabase
      .from('volunteer_signups')
      .insert({
        opportunity_id: opportunityId,
        user_id: user.id,
        notes: notes || null,
        status: 'confirmed',
      });

    if (insertError) {
      throw insertError;
    }

    // Success!
    return { success: true };

  } catch (error) {
    console.error('Signup error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('already signed up')) {
        throw new Error('You have already signed up for this opportunity');
      }

      if (error.message.includes('logged in')) {
        throw new Error('Please log in to sign up for volunteer opportunities');
      }
    }

    // Generic error
    throw new Error('Failed to sign up. Please try again.');
  }
};
```

---

## Authentication Checks

### Protect Signup Actions

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function VolunteerPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSignUpClick = (opportunity) => {
    if (!user) {
      // Redirect to login
      router.push('/login?redirect=/volunteer');
      return;
    }

    // Proceed with signup
    setSelectedOpp(opportunity);
    setIsSignupOpen(true);
  };

  return (
    // ... component JSX
  );
}
```

---

## Accessibility Testing Checklist

- [ ] All interactive elements are keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicators are visible on all focusable elements
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] All images have alt text or aria-hidden for decorative icons
- [ ] Form fields have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Loading states are announced
- [ ] Modal dialogs trap focus and return focus on close
- [ ] Headings follow logical hierarchy (h1 > h2 > h3)
- [ ] Time elements use proper datetime attributes
- [ ] Links have descriptive text (not just "click here")
- [ ] Buttons have descriptive aria-labels where needed

---

## Performance Optimization

### Image Loading Priority

```tsx
// Prioritize first 3 cards
<VolunteerGrid
  opportunities={opportunities}
  onSignUp={handleSignUp}
/>

// The component automatically sets priority={true} for first 3 cards
```

### Skeleton Loading States

```tsx
import { VolunteerGridSkeleton } from '@/components/volunteer';

{isLoading ? (
  <VolunteerGridSkeleton count={6} columns={3} />
) : (
  <VolunteerGrid opportunities={opportunities} />
)}
```

### Debounce Filter Changes

```typescript
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const debouncedFilterChange = useCallback(
  debounce((newFilters: VolunteerFilters) => {
    fetchOpportunities(newFilters);
  }, 300),
  []
);

<VolunteerFilter
  filters={filters}
  onFilterChange={(newFilters) => {
    setFilters(newFilters);
    debouncedFilterChange(newFilters);
  }}
/>
```

---

## Responsive Design

All components are built mobile-first with the following breakpoints:

- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

### Grid Layout

```tsx
// Customize columns
<VolunteerGrid opportunities={opportunities} columns={2} /> // Max 2 columns
<VolunteerGrid opportunities={opportunities} columns={1} /> // Single column
```

---

## Testing

### Component Testing Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { VolunteerCard } from '@/components/volunteer';

describe('VolunteerCard', () => {
  const mockOpportunity = {
    id: '1',
    title: 'School Fundraiser Setup',
    description: 'Help set up tables and decorations',
    date: '2025-11-15',
    start_time: '08:00:00',
    end_time: '10:00:00',
    location: 'Main Campus Gym',
    campus: 'elementary',
    max_volunteers: 10,
    current_signups: 3,
    status: 'active',
    // ... other required fields
  };

  it('renders opportunity details', () => {
    render(<VolunteerCard opportunity={mockOpportunity} />);

    expect(screen.getByText('School Fundraiser Setup')).toBeInTheDocument();
    expect(screen.getByText(/7 of 10 spots available/)).toBeInTheDocument();
  });

  it('calls onSignUp when button clicked', () => {
    const handleSignUp = jest.fn();
    render(
      <VolunteerCard opportunity={mockOpportunity} onSignUp={handleSignUp} />
    );

    const button = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(button);

    expect(handleSignUp).toHaveBeenCalledWith(mockOpportunity);
  });

  it('disables button when opportunity is full', () => {
    const fullOpportunity = {
      ...mockOpportunity,
      current_signups: 10,
    };

    render(<VolunteerCard opportunity={fullOpportunity} />);

    const button = screen.getByRole('button', { name: /fully booked/i });
    expect(button).toBeDisabled();
  });
});
```

---

## Troubleshooting

### Issue: Types not found

**Solution:** Ensure database types are generated:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

### Issue: Campus colors not showing

**Solution:** Verify CSS variables are defined in `globals.css`:
```css
:root {
  --preschool: 339 80% 61%;
  --elementary: 197 79% 63%;
  --middle-high: 20 98% 57%;
}
```

### Issue: Animations not working

**Solution:** Ensure Framer Motion is installed:
```bash
npm install framer-motion
```

### Issue: Date formatting errors

**Solution:** Ensure date-fns is installed:
```bash
npm install date-fns
```

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
