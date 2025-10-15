# Centner PTO Website - Quick Setup Guide

## 🎉 Phase 2 Complete! ✅✅

Your Next.js 15 application with Supabase backend is successfully running at **http://localhost:3000**

**Database Status:**
- ✅ 9 tables created with full schema
- ✅ 9 indexes for performance optimization
- ✅ 46 Row Level Security policies
- ✅ 4 storage buckets (event-photos, news-images, avatars, documents)
- ✅ 16 storage policies for file access control
- ✅ Automatic timestamp triggers on 6 tables

**Project ID:** `whtwuisrljgjtpzbyhfp`

---

## ✅ What's Been Set Up

### Project Configuration
- ✅ Next.js 15 with App Router
- ✅ TypeScript strict mode
- ✅ Tailwind CSS 4 with custom design system
- ✅ ESLint and code quality tools
- ✅ All dependencies installed (388 packages, 0 vulnerabilities)
- ✅ Development server running

### Application Structure
- ✅ Server Components architecture
- ✅ Supabase client utilities (server & client)
- ✅ Middleware for authentication
- ✅ Type definitions for database
- ✅ Basic homepage with Centner Academy branding

### Database Preparation
- ✅ Complete SQL schema for all tables
- ✅ Row Level Security (RLS) policies
- ✅ Storage bucket configurations
- ✅ Indexes and triggers
- ✅ Comprehensive setup documentation

---

## 🚀 Next Step: Create Supabase Project

### Step 1: Create Project (5 minutes)

1. Go to **https://supabase.com/dashboard**
2. Sign in or create account
3. Click **"New Project"**
4. Fill in details:
   - **Name**: `centner-pto`
   - **Password**: Generate strong password (save it!)
   - **Region**: `us-east-1` (or closest to Miami)
   - **Plan**: Pro ($25/month) ✅ You confirmed this
5. Click **"Create new project"**
6. Wait 2-3 minutes for initialization

### Step 2: Get Credentials (2 minutes)

1. Go to **Project Settings** → **API**
2. Copy these values:

```
Project URL: https://[your-ref].supabase.co
anon public: eyJhbGc...
service_role: eyJhbGc... (keep secret!)
```

3. Update `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Step 3: Run Database Migrations (5 minutes)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Run these SQL files **in order**:

#### Migration 1: Schema
- Open `supabase/migrations/001_initial_schema.sql`
- Copy all content
- Paste in SQL Editor
- Click **"Run"**
- ✅ Should see: "Success. No rows returned"

#### Migration 2: RLS Policies
- Open `supabase/migrations/002_row_level_security.sql`
- Copy all content
- Paste in SQL Editor
- Click **"Run"**
- ✅ Should see: "Success. No rows returned"

#### Migration 3: Storage Buckets
- Open `supabase/migrations/003_storage_buckets.sql`
- Copy all content
- Paste in SQL Editor
- Click **"Run"**
- ✅ Should see: "Success. No rows returned"

### Step 4: Create Storage Buckets (3 minutes)

1. Go to **Storage** in Supabase Dashboard
2. Click **"Create a new bucket"**
3. Create these 4 buckets:

| Bucket Name | Public? | Max Size | MIME Types |
|-------------|---------|----------|------------|
| `event-photos` | ✅ Yes | 10MB | image/* |
| `news-images` | ✅ Yes | 5MB | image/* |
| `avatars` | ✅ Yes | 2MB | image/* |
| `documents` | ❌ No | 10MB | application/pdf, image/* |

### Step 5: Restart Dev Server (1 minute)

```bash
# In your terminal, press Ctrl+C to stop the server
# Then start it again:
npm run dev
```

The Supabase errors should be gone! ✅

### Step 6: Verify Setup (2 minutes)

Visit **http://localhost:3000** - you should see:
- ✅ Centner Academy logo
- ✅ "Cultivating Leaders with Heart"
- ✅ Three campus cards
- ✅ No console errors

---

## 📊 Verify Database Tables

Run this query in Supabase SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 9 tables:
- ✅ donations
- ✅ event_rsvps
- ✅ events
- ✅ news_posts
- ✅ photo_albums
- ✅ photos
- ✅ profiles
- ✅ volunteer_opportunities
- ✅ volunteer_signups

---

## 🔐 Create Your Admin Account

1. Go to **http://localhost:3000** (once Supabase is set up)
2. Click **Sign Up** (to be created in Phase 3)
3. Register with your email
4. In Supabase Dashboard:
   - Go to **Authentication** → **Users**
   - Find your user
   - Go to **SQL Editor** and run:

```sql
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'your-email@example.com';
```

Now you have full admin access! 🎉

---

## 📁 Project Structure

```
centner-pto-website/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Tailwind styles
│   ├── components/ui/          # Reusable components
│   ├── lib/
│   │   ├── supabase/           # Supabase clients
│   │   ├── utils/              # Utility functions
│   │   └── validations/        # Zod schemas
│   ├── actions/                # Server Actions
│   ├── types/                  # TypeScript types
│   └── middleware.ts           # Auth middleware
├── supabase/
│   ├── migrations/             # SQL migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_row_level_security.sql
│   │   └── 003_storage_buckets.sql
│   └── README.md               # Detailed setup guide
├── docs/                       # All documentation
├── .env.local                  # Environment variables
└── package.json                # Dependencies

```

---

## 🎯 Development Phases

### ✅ Phase 1: Project Setup (COMPLETE)
- Next.js 15 installation
- TypeScript configuration
- Tailwind CSS setup
- Folder structure
- SQL migrations prepared

### ✅ Phase 2: Supabase Setup (COMPLETE)
- Supabase project created (whtwuisrljgjtpzbyhfp)
- Environment variables configured
- Database schema migrated (9 tables)
- Indexes and triggers created
- Row Level Security policies applied
- Storage buckets created (4 buckets)
- Storage policies configured (16 policies)
- Dev server running successfully

### ⬜ Phase 3: Authentication (Next)
- Sign up/login forms
- User profiles
- Auth middleware
- Role management

### ⬜ Phase 4-9: Feature Development
- Events system
- Photo gallery
- Donations with Stripe
- News/announcements
- Volunteer management
- Store integration

---

## 📚 Documentation

- **Detailed Supabase Setup**: `supabase/README.md`
- **Technical Architecture**: `docs/architecture/TECHNICAL_ARCHITECTURE.md`
- **API Documentation**: `docs/api/`
- **Development Plan**: `DEVELOPMENT_PLAN.md`
- **Product Requirements**: `docs/prd/PRD.md`

---

## 🆘 Troubleshooting

### "relation does not exist"
**Solution**: Run all 3 SQL migration files in order (001, 002, 003)

### "bucket does not exist"
**Solution**: Create the 4 storage buckets manually in Dashboard

### Dev server errors about Supabase
**Solution**: Make sure `.env.local` has correct credentials and restart server

### Can't access admin features
**Solution**: Update your profile role to 'admin' or 'super_admin' in database

---

## 💰 Costs Summary

- **Supabase Pro**: $25/month ✅ (You confirmed)
- **Vercel Pro**: $20/month (when deploying)
- **Domain**: ~$1/month (when purchasing)
- **Total**: $46/month minimum

**Development is FREE** - you're building it yourself! 🎉

---

## ⏱️ Estimated Time

- **Supabase Setup**: ~20 minutes
- **Phase 3 (Auth)**: 6-8 hours
- **Phase 4-9 (Features)**: 100-150 hours

**See `DEVELOPMENT_PLAN.md` for detailed task breakdown**

---

## 🤝 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Project Docs**: Check the `/docs` folder

---

**Ready to continue?** Follow the Supabase setup steps above! 🚀
