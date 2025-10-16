#!/bin/bash

# =====================================================
# Setup Script for Supabase & Stripe Integrations
# =====================================================

set -e  # Exit on any error

echo "🚀 Starting setup for Centner Academy PTO Website integrations..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# =====================================================
# 1. Check Prerequisites
# =====================================================

echo "📋 Checking prerequisites..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo "Creating .env.local from example..."
    cp .env.example .env.local 2>/dev/null || touch .env.local
fi

# Check Supabase project ID
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo -e "${YELLOW}⚠️  Supabase URL not configured in .env.local${NC}"
fi

echo -e "${GREEN}✓ Prerequisites checked${NC}"
echo ""

# =====================================================
# 2. Apply Supabase Migrations
# =====================================================

echo "📦 Applying Supabase database migrations..."
echo ""

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "Found Supabase CLI, attempting to apply migrations..."

    # Try to apply migrations via CLI
    supabase db push 2>/dev/null && echo -e "${GREEN}✓ Migrations applied via CLI${NC}" || {
        echo -e "${YELLOW}⚠️  CLI migration failed, will use SQL scripts instead${NC}"
    }
else
    echo -e "${YELLOW}⚠️  Supabase CLI not installed${NC}"
    echo "You can install it with: npm install -g supabase"
fi

echo ""
echo "📝 Migration SQL files are ready at:"
echo "   - supabase/migrations/20251016120000_enhance_event_rsvps.sql"
echo "   - supabase/migrations/20251016100000_add_stripe_donation_fields.sql"
echo ""
echo "To apply manually:"
echo "   1. Go to: https://supabase.com/dashboard/project/whtwuisrljgjtpzbyhfp/sql"
echo "   2. Copy and paste each migration file"
echo "   3. Click 'Run'"
echo ""

# =====================================================
# 3. Stripe Configuration
# =====================================================

echo "💳 Configuring Stripe integration..."
echo ""

# Check if Stripe keys are set
STRIPE_PK=$(grep "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env.local 2>/dev/null || echo "")
STRIPE_SK=$(grep "STRIPE_SECRET_KEY" .env.local 2>/dev/null || echo "")

if [ -z "$STRIPE_PK" ] || [ -z "$STRIPE_SK" ]; then
    echo -e "${YELLOW}⚠️  Stripe keys not configured${NC}"
    echo ""
    echo "To set up Stripe:"
    echo "   1. Sign up at: https://dashboard.stripe.com/register"
    echo "   2. Get your test API keys from: https://dashboard.stripe.com/test/apikeys"
    echo "   3. Add to .env.local:"
    echo "      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
    echo "      STRIPE_SECRET_KEY=sk_test_..."
    echo "      STRIPE_WEBHOOK_SECRET=whsec_... (get from webhook setup)"
    echo ""
    echo "   See DONATION_SETUP.md for detailed instructions"
    echo ""
else
    echo -e "${GREEN}✓ Stripe keys found in .env.local${NC}"
    echo ""
    echo "Next steps for Stripe:"
    echo "   1. Test donation flow at http://localhost:5001/donate"
    echo "   2. Use test card: 4242 4242 4242 4242"
    echo "   3. Set up webhooks (see DONATION_SETUP.md)"
    echo ""
fi

# =====================================================
# 4. Shopify Configuration
# =====================================================

echo "🛍️  Configuring Shopify integration..."
echo ""

# Check if Shopify keys are set
SHOPIFY_DOMAIN=$(grep "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN" .env.local 2>/dev/null || echo "")
SHOPIFY_TOKEN=$(grep "NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN" .env.local 2>/dev/null || echo "")

if [ -z "$SHOPIFY_DOMAIN" ] || [ -z "$SHOPIFY_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Shopify not configured${NC}"
    echo ""
    echo "To set up Shopify:"
    echo "   1. Create store at: https://www.shopify.com"
    echo "   2. Add products to your store"
    echo "   3. Create Storefront API app (Settings → Apps → Develop apps)"
    echo "   4. Enable required scopes (see SHOPIFY_SETUP.md)"
    echo "   5. Copy Storefront API access token"
    echo "   6. Add to .env.local:"
    echo "      NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com"
    echo "      NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=..."
    echo ""
    echo "   See STORE_QUICKSTART.md for step-by-step guide"
    echo ""
else
    echo -e "${GREEN}✓ Shopify credentials found in .env.local${NC}"
    echo ""
    echo "Next steps for Shopify:"
    echo "   1. Add products to your Shopify store"
    echo "   2. Test store at http://localhost:5001/store"
    echo "   3. Test cart and checkout flow"
    echo ""
fi

# =====================================================
# 5. Verify Installation
# =====================================================

echo "🔍 Verification..."
echo ""

# Count configured integrations
CONFIGURED=0
[ ! -z "$STRIPE_PK" ] && CONFIGURED=$((CONFIGURED + 1))
[ ! -z "$SHOPIFY_DOMAIN" ] && CONFIGURED=$((CONFIGURED + 1))

echo "Integration status:"
echo "   Database migrations: Ready (manual apply needed)"
echo "   Stripe: $([ ! -z "$STRIPE_PK" ] && echo -e "${GREEN}Configured${NC}" || echo -e "${YELLOW}Not configured${NC}")"
echo "   Shopify: $([ ! -z "$SHOPIFY_DOMAIN" ] && echo -e "${GREEN}Configured${NC}" || echo -e "${YELLOW}Not configured${NC}")"
echo ""

if [ $CONFIGURED -eq 2 ]; then
    echo -e "${GREEN}🎉 All integrations configured!${NC}"
    echo ""
    echo "Next steps:"
    echo "   1. Apply database migrations (see instructions above)"
    echo "   2. Test each system:"
    echo "      - Events: http://localhost:5001/events"
    echo "      - Donations: http://localhost:5001/donate"
    echo "      - Store: http://localhost:5001/store"
else
    echo -e "${YELLOW}⚠️  Some integrations need configuration${NC}"
    echo ""
    echo "Complete setup by following the guides:"
    echo "   - Database: See migration instructions above"
    echo "   - Stripe: See DONATION_SETUP.md"
    echo "   - Shopify: See STORE_QUICKSTART.md"
fi

echo ""
echo "=============================================="
echo "📚 Documentation:"
echo "   - Complete setup: README.md"
echo "   - Stripe guide: DONATION_SETUP.md"
echo "   - Shopify guide: STORE_QUICKSTART.md"
echo "   - Events guide: EVENTS_SUMMARY.md"
echo "=============================================="
echo ""
echo "✨ Setup script completed!"
