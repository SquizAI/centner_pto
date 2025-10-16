# Volunteer and Event Management Database Schema

## Overview

This document details the comprehensive database schema implementation for the Centner Academy PTO volunteer and event management system. The schema has been successfully deployed to Supabase (Project ID: `whtwuisrljgjtpzbyhfp`).

**Migration Date:** 2025-10-15

---

## Table of Contents

1. [Database Tables](#database-tables)
2. [Row-Level Security Policies](#row-level-security-policies)
3. [Automated Triggers and Functions](#automated-triggers-and-functions)
4. [Views and Helper Functions](#views-and-helper-functions)
5. [Indexes for Performance](#indexes-for-performance)
6. [Migration Summary](#migration-summary)
7. [Development Considerations](#development-considerations)
8. [Security Notes](#security-notes)

---

## Database Tables

### 1. Enhanced `events` Table

**Purpose:** Manage PTO events with enhanced features for scheduling and recurring events.

**New Columns Added:**
- `event_type_new` (text) - Type of event: fundraiser, social, volunteer, meeting, workshop, celebration, other
- `start_time` (time) - Event start time
- `end_time` (time) - Event end time
- `date` (date) - Primary event date for sorting and filtering
- `status_new` (text) - Event status: draft, published, cancelled, completed
- `max_capacity` (integer) - Maximum number of attendees allowed
- `is_recurring` (boolean) - Whether this is a recurring event
- `recurrence_rule` (jsonb) - JSON storage for recurring event patterns (RRULE-like format)

**Existing Columns:**
- `id` (uuid, primary key)
- `title` (text)
- `description` (text)
- `event_date` (timestamptz)
- `end_date` (timestamptz)
- `location` (text)
- `campus` (text[])
- `event_type` (text) - Legacy field
- `status` (text) - Legacy field
- `max_attendees` (integer)
- `current_attendees` (integer)
- `image_url` (text)
- `created_by` (uuid → profiles)
- `created_at`, `updated_at` (timestamptz)

**Indexes:**
- `idx_events_date` - Fast date-based queries
- `idx_events_event_type_new` - Filter by event type
- `idx_events_status_new` - Filter by status
- `idx_events_created_by` - Creator lookups
- `idx_events_campus` (GIN) - Multi-campus filtering
- `idx_events_recurring` - Find recurring events

---

### 2. `volunteer_shifts` Table (NEW)

**Purpose:** Individual volunteer time slots that can be associated with events or standalone opportunities.

**Columns:**
- `id` (uuid, primary key)
- `event_id` (uuid → events, nullable) - Optional reference to an event
- `opportunity_id` (uuid → volunteer_opportunities, nullable) - Optional reference to opportunity
- `title` (text, required)
- `description` (text)
- `date` (date, required)
- `start_time` (time, required)
- `end_time` (time, required)
- `slots_total` (integer, required) - Total volunteer slots available
- `slots_filled` (integer, default 0) - Current filled slots (auto-updated)
- `campus` (text) - all, preschool, elementary, middle_high
- `location` (text)
- `requirements` (text[]) - Array of special requirements
- `status` (text) - open, full, cancelled, completed
- `created_by` (uuid → profiles)
- `created_at`, `updated_at` (timestamptz)

**Constraints:**
- `shift_time_check` - Ensures end_time > start_time
- `shift_event_or_opportunity` - Ensures only one parent reference or standalone
- CHECK: `slots_total > 0`
- CHECK: `slots_filled >= 0 AND slots_filled <= slots_total`

**Indexes:**
- `idx_volunteer_shifts_event_id` - Event association
- `idx_volunteer_shifts_opportunity_id` - Opportunity association
- `idx_volunteer_shifts_date` - Date-based queries
- `idx_volunteer_shifts_status` - Status filtering
- `idx_volunteer_shifts_campus` - Campus filtering
- `idx_volunteer_shifts_created_by` - Creator lookups
- `idx_volunteer_shifts_date_status` - Composite for upcoming shifts

---

### 3. Enhanced `volunteer_signups` Table

**Purpose:** Track user signups for volunteer shifts with comprehensive status tracking.

**New Columns Added:**
- `shift_id` (uuid → volunteer_shifts, nullable)
- `signed_up_at` (timestamptz)
- `cancelled_at` (timestamptz, nullable)
- `completed_at` (timestamptz, nullable)
- `hours_earned` (decimal(5,2), nullable)
- `checked_in_at` (timestamptz, nullable)
- `checked_in_by` (uuid → profiles, nullable)
- `status_new` (text) - confirmed, cancelled, completed, no_show

**Existing Columns:**
- `id` (uuid, primary key)
- `opportunity_id` (uuid → volunteer_opportunities)
- `user_id` (uuid → auth.users)
- `signup_date` (timestamptz)
- `notes` (text)
- `status` (text) - Legacy field
- `created_at`, `updated_at` (timestamptz)

**Constraints:**
- `signup_shift_or_opportunity` - Ensures either shift_id or opportunity_id is set
- Unique index prevents duplicate signups per shift/opportunity

**Indexes:**
- `idx_volunteer_signups_shift_id` - Shift lookups
- `idx_volunteer_signups_user_status` - User signup queries
- `idx_volunteer_signups_signed_up_at` - Chronological sorting
- `idx_volunteer_signups_checked_in_by` - Check-in tracking
- `idx_unique_shift_signup` - Prevent duplicate shift signups
- `idx_unique_opportunity_signup` - Prevent duplicate opportunity signups

---

### 4. `volunteer_hours` Table (NEW)

**Purpose:** Tracking table for volunteer hours contributed by users with approval workflow.

**Columns:**
- `id` (uuid, primary key)
- `user_id` (uuid → profiles, required)
- `signup_id` (uuid → volunteer_signups, nullable) - Optional reference to generating signup
- `hours` (decimal(5,2), required) - Hours volunteered (0-24 per entry)
- `date` (date, required)
- `activity` (text, required) - Description of volunteer activity
- `notes` (text, nullable)
- `approved_by` (uuid → profiles, nullable) - Admin who approved
- `approved_at` (timestamptz, nullable) - Approval timestamp
- `created_at`, `updated_at` (timestamptz)

**Constraints:**
- CHECK: `hours > 0 AND hours <= 24`

**Indexes:**
- `idx_volunteer_hours_user_id` - User lookups
- `idx_volunteer_hours_signup_id` - Signup association
- `idx_volunteer_hours_date` - Date-based queries
- `idx_volunteer_hours_approved_by` - Approval tracking
- `idx_volunteer_hours_user_date` - User activity timeline
- `idx_volunteer_hours_pending_approval` - Find unapproved hours

---

### 5. Enhanced `event_rsvps` Table

**Purpose:** Track event RSVPs with check-in functionality.

**New Columns Added:**
- `checked_in_at` (timestamptz, nullable)
- `checked_in_by` (uuid → profiles, nullable)

**Existing Columns:**
- `id` (uuid, primary key)
- `event_id` (uuid → events)
- `user_id` (uuid → profiles)
- `status` (text) - confirmed, waitlist, cancelled
- `guests_count` (integer, default 0)
- `notes` (text)
- `created_at` (timestamptz)

**Indexes:**
- `idx_event_rsvps_checked_in` - Check-in tracking
- `idx_event_rsvps_event_status` - Event RSVP queries

---

## Row-Level Security Policies

All tables have RLS enabled with comprehensive policies:

### `volunteer_shifts` Policies

1. **Anyone can view open and full volunteer shifts** (SELECT)
   - Public can see available shifts
   - Status IN ('open', 'full')

2. **Authenticated users can view all volunteer shifts** (SELECT)
   - Logged-in users see all shifts

3. **Admins can insert volunteer shifts** (INSERT)
   - Requires admin or super_admin role

4. **Admins can update volunteer shifts** (UPDATE)
   - Requires admin or super_admin role

5. **Admins can delete volunteer shifts** (DELETE)
   - Requires admin or super_admin role

### `volunteer_signups` Policies

1. **Users can view their own volunteer signups** (SELECT)
   - Users see their signups
   - Admins see all signups

2. **Users can create their own volunteer signups** (INSERT)
   - Users can only sign themselves up

3. **Users can update their own volunteer signups** (UPDATE)
   - Users can modify their own signups
   - Admins can modify any signup

4. **Admins can delete volunteer signups** (DELETE)
   - Admin-only deletion

### `volunteer_hours` Policies

1. **Users can view their own volunteer hours** (SELECT)
   - Users see their hours
   - Admins see all hours

2. **Users can create their own volunteer hours** (INSERT)
   - Users can submit hours

3. **Users can update their own pending volunteer hours** (UPDATE)
   - Users can modify unapproved hours only
   - approved_at IS NULL

4. **Admins can approve and manage volunteer hours** (UPDATE)
   - Admins can approve and modify any hours

5. **Admins can delete volunteer hours** (DELETE)
   - Admin-only deletion

---

## Automated Triggers and Functions

### 1. Slot Count Management

**Function:** `update_volunteer_shift_slots_filled()`
**Trigger:** `trigger_update_volunteer_shift_slots_filled`
**Fires On:** INSERT, UPDATE, DELETE on `volunteer_signups`

**Purpose:** Automatically updates `slots_filled` count and shift status when signups change.

**Logic:**
- Counts confirmed and completed signups
- Updates shift to 'full' when slots_filled >= slots_total
- Updates shift to 'open' when slots become available

### 2. Timestamp Automation

**Function:** `auto_set_signup_timestamps()`
**Trigger:** `trigger_auto_set_signup_timestamps`
**Fires On:** INSERT, UPDATE on `volunteer_signups`

**Purpose:** Automatically sets timestamps based on status changes.

**Logic:**
- Sets `cancelled_at` when status changes to 'cancelled'
- Sets `completed_at` when status changes to 'completed'
- Sets `signed_up_at` on insert if not already set

### 3. Auto-Create Volunteer Hours

**Function:** `auto_create_volunteer_hours_on_completion()`
**Trigger:** `trigger_auto_create_volunteer_hours`
**Fires On:** UPDATE on `volunteer_signups`

**Purpose:** Automatically creates volunteer_hours entry when signup is marked completed.

**Logic:**
- Fires when status changes to 'completed'
- Calculates hours from shift duration
- Creates approved hours entry if checked in by admin

### 4. Event Attendee Count

**Function:** `update_event_attendees_count()`
**Trigger:** `trigger_update_event_attendees_count`
**Fires On:** INSERT, UPDATE, DELETE on `event_rsvps`

**Purpose:** Maintains accurate count of event attendees.

**Logic:**
- Counts confirmed RSVPs including guests
- Updates `current_attendees` on events table

### 5. Updated At Triggers

**Function:** `update_volunteer_shifts_updated_at()`, `update_volunteer_hours_updated_at()`
**Triggers:** Applied to respective tables
**Fires On:** UPDATE

**Purpose:** Automatically maintains `updated_at` timestamps.

---

## Views and Helper Functions

### Views

#### 1. `volunteer_hours_summary`
Summary of volunteer hours by user with totals and approval status.

**Columns:**
- user_id, full_name, email, campus
- total_entries, total_hours
- approved_hours, pending_hours
- first_volunteer_date, last_volunteer_date

#### 2. `upcoming_volunteer_shifts`
Upcoming volunteer shifts with availability information.

**Columns:**
- All shift details
- slots_available (calculated)
- event_title, opportunity_title (joined)
- Filtered: date >= CURRENT_DATE, status IN ('open', 'full')

#### 3. `user_volunteer_activity`
Complete view of user volunteer signups and activity.

**Columns:**
- User and signup details
- Shift, event, and opportunity information
- Timestamps for all status changes

#### 4. `volunteer_leaderboard_monthly`
Monthly volunteer leaderboard with rankings.

**Columns:**
- user_id, full_name, campus, month
- total_hours, activities_count, rank

#### 5. `volunteer_leaderboard_yearly`
Yearly volunteer leaderboard with rankings.

**Columns:**
- user_id, full_name, campus, year
- total_hours, activities_count, rank

#### 6. `campus_volunteer_stats`
Volunteer statistics aggregated by campus.

**Columns:**
- campus, unique_volunteers
- total_hours, avg_hours_per_entry
- total_activities

#### 7. `shift_fulfillment_stats`
Statistics on volunteer shift fulfillment rates.

**Columns:**
- campus, total_shifts, completed_shifts
- cancelled_shifts, full_shifts, unfilled_past_shifts
- total_slots, filled_slots, fill_rate_percentage

### Helper Functions

#### 1. `get_user_volunteer_hours(target_user_id uuid)`
Returns volunteer hour statistics for a specific user.

**Returns:**
- total_hours, approved_hours, pending_hours
- total_signups, completed_signups

**Security:** SECURITY DEFINER

#### 2. `can_signup_for_shift(target_shift_id uuid, target_user_id uuid)`
Checks if a user is eligible to sign up for a volunteer shift.

**Returns:** boolean

**Checks:**
- Shift exists and is open
- Available slots
- No existing active signup

**Security:** SECURITY DEFINER

#### 3. `get_volunteer_stats_by_date_range(start_date, end_date, target_campus)`
Get volunteer statistics for a specific date range and optional campus.

**Returns:**
- total_volunteers, total_hours
- total_shifts, completed_shifts
- avg_hours_per_volunteer

**Security:** SECURITY DEFINER

#### 4. `get_top_volunteers(period_start, period_end, limit_count)`
Get top volunteers by hours for a specific period.

**Returns:**
- user_id, full_name, campus
- total_hours, activities_count
- Ordered by total_hours DESC

**Security:** SECURITY DEFINER

---

## Indexes for Performance

All tables have been optimized with strategic indexes:

### Performance Strategy

1. **Single-column indexes** on frequently queried fields (date, status, user_id)
2. **Composite indexes** for common query patterns (date + status)
3. **GIN indexes** for array columns (campus, requirements)
4. **Partial indexes** for filtered queries (is_recurring = true, approved_at IS NULL)
5. **Unique indexes** to enforce business rules (prevent duplicate signups)

### Key Indexes

**Events:**
- Date-based queries
- Status and type filtering
- Campus filtering with GIN
- Recurring event lookups

**Volunteer Shifts:**
- Date and status composite
- Foreign key relationships
- Campus filtering

**Volunteer Signups:**
- User activity tracking
- Shift/opportunity lookups
- Unique signup enforcement

**Volunteer Hours:**
- User timeline queries
- Pending approval filtering
- Date-based aggregations

---

## Migration Summary

The following migrations were successfully applied:

1. **enhance_events_table_with_advanced_features**
   - Added new event fields (event_type_new, date, times, recurrence)
   - Created performance indexes
   - Added column comments

2. **create_volunteer_shifts_table**
   - Created volunteer_shifts table
   - Implemented RLS policies
   - Added indexes and triggers
   - Created update_updated_at trigger

3. **enhance_volunteer_signups_table**
   - Added shift_id and status tracking columns
   - Created unique indexes to prevent duplicates
   - Enhanced RLS policies
   - Added check-in tracking

4. **create_volunteer_hours_tracking_table**
   - Created volunteer_hours table
   - Implemented approval workflow
   - Added RLS policies
   - Created indexes for reporting

5. **create_volunteer_shift_triggers_and_functions**
   - Slot count management trigger
   - Timestamp automation trigger
   - Auto-create hours on completion trigger

6. **create_helpful_views_and_functions**
   - Created summary and reporting views
   - Added helper functions
   - Granted appropriate permissions

7. **add_event_attendee_tracking_enhancements**
   - Enhanced event_rsvps with check-in
   - Created attendee count trigger

8. **create_volunteer_leaderboard_and_statistics**
   - Created leaderboard views
   - Added statistics views
   - Created reporting functions

---

## Development Considerations

### Data Migration

**Note:** The events table has both legacy fields and new fields:
- `event_type` (old) → `event_type_new` (new)
- `status` (old) → `status_new` (new)
- `event_date` (old) → `date` + `start_time` + `end_time` (new)

**Action Required:** You may want to migrate data from old fields to new fields and eventually deprecate the old columns.

### Campus Field Consistency

Different tables use different formats for campus:
- **events:** `text[]` (array) - Can be ['all'], ['preschool'], etc.
- **volunteer_shifts:** `text` (single value) - 'all', 'preschool', etc.
- **volunteer_opportunities:** `text` (single value with CHECK constraint)

**Recommendation:** Consider standardizing to a single approach across all tables for consistency.

### Volunteer Hours Approval Workflow

The system supports both automatic and manual hour approval:
- **Automatic:** When admin checks in volunteer (approved_at set immediately)
- **Manual:** User submits hours, admin approves later

**UI Consideration:** Build admin dashboard to approve pending hours.

### Recurring Events

The `recurrence_rule` field uses JSONB for flexibility. Consider implementing a standard format like:

```json
{
  "frequency": "weekly",
  "interval": 1,
  "daysOfWeek": [1, 3, 5],
  "endDate": "2025-12-31"
}
```

### Duplicate Signups Prevention

Unique indexes prevent duplicate signups, but they exclude cancelled signups:
- Users can cancel and re-signup
- Enforced at database level
- Handle unique constraint violations in application code

---

## Security Notes

### Security Advisors Report

The Supabase security advisor flagged the following items:

#### 1. SECURITY DEFINER Views (7 instances)

**Issue:** Views created with default settings use SECURITY DEFINER, which enforces the creator's permissions rather than the querying user's permissions.

**Affected Views:**
- volunteer_hours_summary
- upcoming_volunteer_shifts
- user_volunteer_activity
- volunteer_leaderboard_monthly
- volunteer_leaderboard_yearly
- campus_volunteer_stats
- shift_fulfillment_stats

**Impact:** Low - These views aggregate public or user-scoped data and don't expose sensitive information.

**Recommendation:** These views are safe as-is since they respect RLS through underlying tables. No immediate action required.

**Reference:** [Supabase Security Definer Documentation](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)

#### 2. Function Search Path Mutable (Multiple Functions)

**Issue:** Functions don't have an explicit search_path set, which could theoretically be exploited.

**Impact:** Low - All functions are scoped to public schema and don't call user-defined functions.

**Recommendation:** For production hardening, consider adding `SET search_path = public` to SECURITY DEFINER functions.

**Reference:** [Supabase Function Security Documentation](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)

#### 3. Leaked Password Protection Disabled

**Issue:** Supabase Auth's leaked password protection is currently disabled.

**Recommendation:** Enable leaked password protection in Supabase Dashboard → Authentication → Settings.

**Reference:** [Password Security Documentation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

### RLS Best Practices

All tables with user data have RLS enabled:
- Users can only view/modify their own data
- Admins have elevated permissions
- Public can view published/open content
- Anonymous access denied for sensitive operations

### Data Integrity

Implemented constraints ensure:
- No negative values for counts or hours
- Valid time ranges (end_time > start_time)
- Valid status transitions
- Required foreign key relationships
- No duplicate signups

---

## Usage Examples

### Query: Get User's Volunteer Summary

```sql
SELECT * FROM get_user_volunteer_hours('user-uuid-here');
```

### Query: Find Upcoming Open Shifts

```sql
SELECT * FROM upcoming_volunteer_shifts
WHERE campus = 'elementary' OR campus = 'all'
ORDER BY date, start_time
LIMIT 10;
```

### Query: Check If User Can Sign Up

```sql
SELECT can_signup_for_shift('shift-uuid', 'user-uuid');
```

### Query: Monthly Leaderboard

```sql
SELECT * FROM volunteer_leaderboard_monthly
WHERE month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
ORDER BY month DESC, rank ASC;
```

### Query: Campus Statistics

```sql
SELECT * FROM campus_volunteer_stats
ORDER BY total_hours DESC;
```

### Insert: Create Volunteer Shift

```sql
INSERT INTO volunteer_shifts (
  event_id, title, description, date, start_time, end_time,
  slots_total, campus, location, created_by
) VALUES (
  'event-uuid',
  'Setup Crew',
  'Help set up tables and chairs',
  '2025-10-20',
  '08:00',
  '10:00',
  5,
  'elementary',
  'Main Gymnasium',
  auth.uid()
);
```

### Insert: User Signs Up for Shift

```sql
INSERT INTO volunteer_signups (
  shift_id, user_id, notes
) VALUES (
  'shift-uuid',
  auth.uid(),
  'I can bring folding tables'
);
```

### Update: Complete Shift and Award Hours

```sql
UPDATE volunteer_signups
SET
  status_new = 'completed',
  hours_earned = 2.5,
  checked_in_at = NOW(),
  checked_in_by = auth.uid()
WHERE id = 'signup-uuid';
-- This automatically creates a volunteer_hours entry via trigger
```

---

## Next Steps for Development Team

1. **Update Frontend Components**
   - Modify event forms to use new event fields
   - Build volunteer shift management UI
   - Create volunteer hours approval dashboard
   - Implement check-in functionality

2. **Data Migration** (if needed)
   - Migrate `event_type` → `event_type_new`
   - Migrate `status` → `status_new`
   - Migrate `event_date` → `date` + `start_time` + `end_time`
   - Deprecate old columns after verification

3. **API Integration**
   - Update Supabase queries to use new tables
   - Implement recurring event logic
   - Add validation for shift signups
   - Build leaderboard endpoints

4. **Testing**
   - Test RLS policies with different user roles
   - Verify trigger functionality
   - Test concurrent signup scenarios
   - Validate hour calculation accuracy

5. **Documentation**
   - Document API endpoints
   - Create user guides for volunteer features
   - Document admin workflows

6. **Security Hardening** (Optional)
   - Enable leaked password protection
   - Add search_path to SECURITY DEFINER functions
   - Review and audit RLS policies

---

## Database Connection Information

**Project ID:** whtwuisrljgjtpzbyhfp
**Region:** US East (default)
**Connection:** Use Supabase client library or direct PostgreSQL connection

**TypeScript Types:** Generate updated types with:
```bash
npx supabase gen types typescript --project-id whtwuisrljgjtpzbyhfp > types/supabase.ts
```

---

## Support and Maintenance

For questions or issues with the database schema:

1. Review this documentation
2. Check Supabase Dashboard for table structure
3. Use SQL Editor in Supabase to test queries
4. Review RLS policies in Table Editor → Authentication tab

**Schema Version:** 1.0
**Last Updated:** 2025-10-15
**Maintained By:** Database Architecture Team
