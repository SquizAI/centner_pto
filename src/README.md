# Source Directory Structure

This is the main source directory for the Centner PTO website.

## Directory Overview

- **`/app`** - Next.js App Router pages and layouts
- **`/components`** - React components
  - `/ui` - Reusable UI components (buttons, cards, forms, etc.)
- **`/lib`** - Utility libraries and integrations
  - `/supabase` - Supabase client utilities
  - `/stripe` - Stripe payment utilities
  - `/utils` - Helper functions
  - `/validations` - Zod validation schemas
- **`/actions`** - Next.js Server Actions for mutations
- **`/types`** - TypeScript type definitions

## Development Guidelines

1. **Server Components by Default**: All components in `/app` are Server Components unless marked with `'use client'`
2. **Server Actions**: Place all data mutations in `/actions` with `'use server'` directive
3. **Type Safety**: Import types from `/types/database.types.ts`
4. **Styling**: Use Tailwind CSS utility classes
5. **Components**: Build reusable components in `/components/ui`

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables: Copy `.env.example` to `.env.local`
3. Run development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Related Documentation

See the `/docs` directory for:
- Technical Architecture
- API Documentation
- Development Plan
- Brand Guidelines
