# Volunteer Components - Quick Reference

## Import Statement
```typescript
import {
  VolunteerCard,
  VolunteerGrid,
  VolunteerFilter,
  SignupForm,
  MyVolunteerShifts,
} from '@/components/volunteer';

import type {
  VolunteerOpportunity,
  VolunteerFilters,
  VolunteerCampus,
} from '@/types/volunteer.types';
```

## Basic Usage

### Display Opportunities
```tsx
<VolunteerGrid
  opportunities={opportunities}
  onSignUp={(opp) => handleSignUp(opp)}
/>
```

### Add Filters
```tsx
const [filters, setFilters] = useState<VolunteerFilters>({
  campus: null,
  dateRange: 'upcoming'
});

<VolunteerFilter
  filters={filters}
  onFilterChange={setFilters}
/>
```

### Signup Modal
```tsx
const [selectedOpp, setSelectedOpp] = useState(null);
const [isOpen, setIsOpen] = useState(false);

<SignupForm
  opportunity={selectedOpp}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={() => toast.success('Signed up!')}
  onSubmit={async (id, notes) => {
    await supabase.from('volunteer_signups').insert({
      opportunity_id: id,
      user_id: userId,
      notes
    });
  }}
/>
```

### User Shifts
```tsx
<MyVolunteerShifts
  shifts={userShifts}
  isLoading={loading}
  onCancelSignup={async (id) => {
    await supabase
      .from('volunteer_signups')
      .update({ status: 'cancelled' })
      .eq('id', id);
  }}
/>
```

## Supabase Queries

### Fetch Opportunities
```typescript
const { data } = await supabase
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
    opportunity_id: id,
    user_id: userId,
    notes: 'Optional notes',
    status: 'confirmed'
  });
```

### Fetch User Shifts
```typescript
const { data } = await supabase
  .rpc('get_user_upcoming_commitments', {
    user_uuid: userId
  });
```

## Campus Colors
- `all` → Bright Blue (#23ABE3)
- `preschool` → Pink (#EC4E88)
- `elementary` → Light Blue (#57BAEB)
- `middle-high` → Orange (#FC6F24)

## File Locations
- Components: `/src/components/volunteer/`
- Types: `/src/types/volunteer.types.ts`
- Utils: `/src/lib/volunteer-utils.ts`
- UI: `/src/components/ui/checkbox.tsx`

## All Components are Client Components
Add `'use client'` when using in server component pages.

## Documentation
- Full docs: `/src/components/volunteer/README.md`
- Integration guide: `/src/components/volunteer/COMPONENT_GUIDE.md`
- Handoff: `/src/components/volunteer/HANDOFF.md`
