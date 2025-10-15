# Authentication System Documentation

## Overview

This document describes the complete authentication system for the Centner Academy PTO website. The system uses **Supabase Auth** with email/password authentication, role-based access control, and secure session management.

## Architecture

### Tech Stack
- **Authentication**: Supabase Auth (email/password)
- **Session Management**: HTTP-only cookies via Supabase SSR
- **Database**: PostgreSQL (Supabase)
- **Framework**: Next.js 15 with App Router
- **Form Validation**: Zod
- **UI Components**: shadcn/ui

### User Roles
- `member` - Default role for all new users
- `volunteer` - Active volunteers (not currently used, reserved for future)
- `admin` - Can manage content (events, photos, news, volunteers)
- `super_admin` - Full system access including user management

## File Structure

```
src/
├── app/
│   ├── (auth)/                      # Auth route group (redirects authenticated users)
│   │   ├── layout.tsx               # Centered auth layout
│   │   ├── login/page.tsx           # Login page
│   │   ├── signup/page.tsx          # Signup page
│   │   ├── forgot-password/page.tsx # Password reset request
│   │   └── reset-password/page.tsx  # Password reset confirmation
│   ├── dashboard/                   # User dashboard (requires auth)
│   │   ├── layout.tsx               # Requires authentication
│   │   └── page.tsx                 # User profile & volunteer signups
│   ├── admin/                       # Admin dashboard (requires admin)
│   │   ├── layout.tsx               # Requires admin role
│   │   └── page.tsx                 # Admin overview & quick links
│   ├── gallery/admin/               # Gallery management (requires admin)
│   │   └── layout.tsx               # Requires admin role
│   └── actions/
│       └── auth-actions.ts          # Server actions for auth operations
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx            # Login form component
│   │   ├── SignupForm.tsx           # Signup form component
│   │   ├── UserMenu.tsx             # User menu in header
│   │   └── ProtectedRoute.tsx       # Client-side route protection
│   └── dashboard/
│       ├── ProfileEditForm.tsx      # Profile editing form
│       └── VolunteerSignups.tsx     # Display user's volunteer signups
├── lib/
│   ├── auth-utils.ts                # Auth utility functions
│   └── supabase/
│       ├── server.ts                # Server-side Supabase client
│       └── client.ts                # Client-side Supabase client
└── middleware.ts                    # Route protection & role verification
```

## Core Components

### 1. Server Actions (`/app/actions/auth-actions.ts`)

All authentication mutations happen through Server Actions:

- `signIn(email, password, redirectTo?)` - Login action
- `signUp(email, password, fullName)` - Signup action
- `signOut()` - Logout action
- `updateProfile(data)` - Update user profile
- `resetPassword(email)` - Send password reset email
- `updatePassword(password)` - Update password after reset

All actions include:
- Zod validation
- Error handling
- Automatic revalidation
- Type-safe return values

### 2. Auth Utilities (`/lib/auth-utils.ts`)

Server-side auth helpers for Server Components:

```typescript
// Get current user (cached per request)
const user = await getCurrentUser()

// Require authentication (redirects to /login if not authenticated)
const user = await requireAuth()

// Require admin role (redirects to / if not admin/super_admin)
const user = await requireAdmin()

// Require super admin role
const user = await requireSuperAdmin()

// Check specific role
const hasRole = await checkRole('admin')
const hasAnyRole = await checkRole(['admin', 'super_admin'])

// Check if admin
const isUserAdmin = await isAdmin()

// Check if super admin
const isUserSuperAdmin = await isSuperAdmin()
```

### 3. Middleware (`/src/middleware.ts`)

Protects routes at the edge before they render:

**Protected Routes:**
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires authentication + admin/super_admin role
- `/gallery/admin/*` - Requires authentication + admin/super_admin role
- `/volunteer/admin/*` - Requires authentication + admin/super_admin role
- `/news/admin/*` - Requires authentication + admin/super_admin role
- `/events/admin/*` - Requires authentication + admin/super_admin role

**Redirects:**
- Unauthenticated users → `/login?redirectTo=<original-path>`
- Non-admin users → `/`

### 4. User Menu (`/components/auth/UserMenu.tsx`)

Shows in the header:
- **Not Logged In**: Login button
- **Logged In**: User avatar with dropdown menu
  - Dashboard
  - Admin Panel (if admin/super_admin)
  - Settings
  - Sign Out

## Authentication Flow

### Signup Flow
1. User fills out signup form (`/signup`)
2. Form submits to `signUp()` Server Action
3. Supabase creates auth user
4. Database trigger creates profile record with role='member'
5. Confirmation email sent (if enabled)
6. User redirected to login

### Login Flow
1. User fills out login form (`/login`)
2. Form submits to `signIn()` Server Action
3. Supabase validates credentials
4. Session cookie set (HTTP-only)
5. User redirected to dashboard or original destination

### Password Reset Flow
1. User requests reset (`/forgot-password`)
2. Form submits to `resetPassword()` Server Action
3. Supabase sends reset email
4. User clicks link → redirected to `/reset-password`
5. User enters new password
6. Form submits to `updatePassword()` Server Action
7. User redirected to dashboard

## Security Features

### Server-Side
✅ All mutations through Server Actions (automatic CSRF protection)
✅ Server-side role validation in middleware
✅ Server-side role validation in page layouts
✅ Database RLS policies (from migration 002_row_level_security.sql)
✅ HTTP-only cookies for session management
✅ Automatic session refresh in middleware

### Client-Side
✅ Form validation with Zod
✅ Client-side redirects for better UX
✅ Real-time auth state updates
✅ Loading and error states
✅ Protected route component for client components

### Database
✅ Row Level Security (RLS) enabled on all tables
✅ Auto-create profile trigger on signup
✅ Default role enforcement (member)
✅ Role enum constraint in database
✅ Profile references auth.users with CASCADE delete

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'volunteer', 'admin', 'super_admin')),
    campus TEXT CHECK (campus IN ('preschool', 'elementary', 'middle_high')),
    student_grades TEXT[],
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Profile Creation Trigger
```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'member')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Admin Management

### Creating Admin Users

Admins must be created manually in the database:

```sql
-- Make a user an admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';

-- Make a user a super admin
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'superadmin@example.com';
```

### Admin Capabilities

**Admin (`admin` role):**
- Access to `/admin` dashboard
- Manage gallery photos
- Create/edit news posts
- Create/manage volunteer opportunities
- Manage events

**Super Admin (`super_admin` role):**
- Everything an admin can do, plus:
- User management
- Site settings
- Analytics and reports
- Role assignment (future feature)

## Environment Variables

Required environment variables (`.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Usage Examples

### Server Component (requires auth)
```typescript
import { requireAuth } from '@/lib/auth-utils'

export default async function MyPage() {
  const user = await requireAuth()

  return <div>Welcome, {user.profile.full_name}!</div>
}
```

### Server Component (requires admin)
```typescript
import { requireAdmin } from '@/lib/auth-utils'

export default async function AdminPage() {
  const user = await requireAdmin()

  return <div>Admin: {user.profile.full_name}</div>
}
```

### Server Component (optional auth)
```typescript
import { getCurrentUser } from '@/lib/auth-utils'

export default async function PublicPage() {
  const user = await getCurrentUser()

  return (
    <div>
      {user ? (
        <p>Logged in as {user.profile.full_name}</p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  )
}
```

### Client Component (protected)
```typescript
'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function MyClientComponent() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  )
}
```

### Client Component (admin only)
```typescript
'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function MyAdminComponent() {
  return (
    <ProtectedRoute requireRole={['admin', 'super_admin']}>
      <div>Admin content</div>
    </ProtectedRoute>
  )
}
```

## Testing Checklist

- [ ] Signup creates account and sends confirmation email
- [ ] Login works with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Unauthenticated users redirected from `/dashboard`
- [ ] Unauthenticated users redirected from `/admin`
- [ ] Non-admin users redirected from `/admin`
- [ ] Password reset email sent
- [ ] Password reset link works
- [ ] Profile update works
- [ ] User menu shows correct options
- [ ] Logout works and redirects to home
- [ ] Admin can access `/admin`
- [ ] Admin can access `/gallery/admin`
- [ ] Member cannot access `/admin`
- [ ] Session persists across page refreshes

## Troubleshooting

### Profile not created on signup
- Check that migration `20251015200000_auth_profile_trigger.sql` has been applied
- Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created'`

### Can't access admin routes
- Verify user role in database: `SELECT role FROM profiles WHERE email = 'your@email.com'`
- Check middleware is running: Look for logs in terminal
- Verify RLS policies allow access

### Session not persisting
- Check that cookies are being set (browser DevTools → Application → Cookies)
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Check middleware is refreshing sessions

### Redirect loop
- Check that auth pages don't require auth (they shouldn't)
- Verify middleware isn't protecting auth routes
- Clear browser cookies and try again

## Future Enhancements

Potential improvements to consider:

- [ ] OAuth providers (Google, Apple, etc.)
- [ ] Two-factor authentication
- [ ] Email verification enforcement
- [ ] Password strength requirements
- [ ] Session management (view/revoke sessions)
- [ ] User role management UI for super admins
- [ ] Audit log for admin actions
- [ ] Rate limiting on auth endpoints
- [ ] Magic link authentication
- [ ] Remember me functionality

## Support

For issues or questions about the auth system, please contact the development team or refer to:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
