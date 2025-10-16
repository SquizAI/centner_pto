# Shopify Store Integration - Setup Guide

This document provides comprehensive setup instructions for the Centner Academy PTO Shopify store integration.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Shopify Store Setup](#shopify-store-setup)
4. [Environment Configuration](#environment-configuration)
5. [Features](#features)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The store integration uses the Shopify Storefront API to provide a seamless shopping experience directly within the PTO website. This integration includes:

- Product catalog with filtering and sorting
- Product detail pages with image galleries
- Shopping cart with persistent state
- Secure checkout via Shopify
- Real-time inventory management
- Responsive design for all devices

### Technology Stack

- **Next.js 15** - Server-side rendering and routing
- **Shopify Storefront API** - Product and cart management
- **GraphQL** - API queries
- **React Context** - Cart state management
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

---

## Prerequisites

Before setting up the store, ensure you have:

1. A Shopify store account (any plan)
2. Products added to your Shopify store
3. Node.js 18+ installed
4. Access to the project's `.env.local` file

---

## Shopify Store Setup

### Step 1: Create a Shopify Store

1. Go to [shopify.com](https://www.shopify.com) and sign up
2. Complete the store setup wizard
3. Add your products with:
   - Product title and description
   - Product images (high quality, square aspect ratio recommended)
   - Product variants (sizes, colors, etc.)
   - Pricing and inventory
   - Product type/category
   - Tags (e.g., "New", "Spirit Wear", etc.)

### Step 2: Create a Storefront API Access Token

1. In your Shopify admin, go to **Settings** → **Apps and sales channels**
2. Click **Develop apps**
3. Click **Create an app**
4. Name your app (e.g., "PTO Website Integration")
5. Click **Configure Storefront API scopes**
6. Enable the following scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_read_collection_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
7. Click **Save**
8. Click **Install app**
9. Go to **API credentials** tab
10. Copy the **Storefront API access token**

### Step 3: Get Your Store Domain

Your store domain is in the format: `your-store-name.myshopify.com`

You can find this in your Shopify admin URL or under **Settings** → **Domains**

---

## Environment Configuration

### Step 1: Update `.env.local`

Add the following variables to your `.env.local` file:

```bash
# Shopify Configuration
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store-name.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token_here

# Optional: Admin API (for future features)
SHOPIFY_ADMIN_API_ACCESS_TOKEN=your_admin_token_here
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 2: Verify Configuration

Replace the placeholder values:

- `your-store-name.myshopify.com` - Your actual Shopify store domain
- `your_storefront_access_token_here` - The token from Step 2 above

**Important:** Do NOT include `https://` in the store domain, just the domain itself.

### Example

```bash
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=centner-pto.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_1234567890abcdef
```

---

## Features

### Product Catalog (`/store`)

- **Product Grid**: Displays all products with images, prices, and availability
- **Filters**:
  - Search by product name/description
  - Filter by category/product type
  - Filter by price range
  - Filter by availability (in stock only)
- **Sorting**:
  - Newest first
  - Price: Low to High
  - Price: High to Low
  - Name: A-Z / Z-A
- **Quick View**: Modal preview of product details
- **Add to Cart**: Directly from grid

### Product Detail Page (`/store/[handle]`)

- **Image Gallery**: Multiple product images with thumbnails
- **Variant Selection**: Size, color, and other options
- **Quantity Selector**: Choose quantity before adding to cart
- **Stock Indicators**: Show remaining inventory when low
- **Related Products**: Suggestions from the same collection
- **Share Button**: Native share or copy link
- **Add to Cart**: With loading states

### Shopping Cart (`/store/cart`)

- **Cart Items**: List all items with images and details
- **Quantity Adjustments**: Increase/decrease or remove items
- **Cart Summary**: Subtotal, shipping info, and total
- **Checkout Button**: Redirects to Shopify checkout
- **Persistent Cart**: Saved in localStorage
- **Empty State**: Helpful message when cart is empty

### Cart Features

- **Persistent State**: Cart persists across page reloads
- **Real-time Updates**: Instant cart updates
- **Cart Count Badge**: Shows item count in header
- **Loading States**: Smooth loading indicators
- **Error Handling**: Graceful error messages

---

## Project Structure

```
src/
├── app/
│   └── store/
│       ├── page.tsx                    # Store homepage
│       ├── store-client.tsx            # Client-side store logic
│       ├── loading.tsx                 # Loading skeleton
│       ├── [handle]/
│       │   ├── page.tsx                # Product detail page
│       │   ├── product-detail-client.tsx
│       │   ├── loading.tsx
│       │   └── not-found.tsx
│       └── cart/
│           ├── page.tsx                # Cart page
│           └── cart-client.tsx
├── components/
│   └── store/
│       ├── ProductCard.tsx             # Product card component
│       ├── ProductGrid.tsx             # Product grid layout
│       ├── ProductFilters.tsx          # Filtering component
│       ├── QuickViewModal.tsx          # Quick view modal
│       ├── CartButton.tsx              # Cart button for header
│       ├── CartItem.tsx                # Cart item component
│       └── CartSummary.tsx             # Cart summary component
├── contexts/
│   └── CartContext.tsx                 # Cart state management
└── lib/
    └── shopify/
        ├── client.ts                   # Shopify API client
        └── types.ts                    # TypeScript types
```

---

## Testing

### 1. Test Product Fetching

Start the development server:

```bash
npm run dev
```

Navigate to `http://localhost:5001/store` and verify:

- Products load correctly
- Images display properly
- Prices are formatted correctly
- Product types/categories show

### 2. Test Filtering & Sorting

- Use the search bar to find products
- Apply category filters
- Set price range filters
- Try different sort options
- Verify results update correctly

### 3. Test Product Detail Page

- Click on a product card
- Verify all images load
- Test variant selection (if applicable)
- Change quantity
- Click "Add to Cart"
- Verify success message

### 4. Test Shopping Cart

- Add multiple products to cart
- Navigate to `/store/cart`
- Verify all items display
- Test quantity adjustments (+/-)
- Test item removal
- Verify cart total updates
- Test "Proceed to Checkout" button

### 5. Test Checkout Flow

- Click "Proceed to Checkout" from cart
- Verify redirect to Shopify checkout
- Complete a test order (use Shopify's test mode)
- Verify order appears in Shopify admin

### 6. Test Edge Cases

- Empty cart behavior
- Out of stock products
- Product not found (invalid handle)
- Network errors
- Cart persistence (refresh page)

---

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
   - `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
4. Deploy

### Environment Variables in Production

Ensure all Shopify credentials are added to your production environment. Never commit these to version control.

---

## Troubleshooting

### Products Not Loading

**Issue**: Store shows "Setup Required" or no products

**Solutions**:
1. Verify environment variables are set correctly
2. Check Shopify store domain (no `https://`)
3. Verify Storefront API token is valid
4. Ensure products are published to "Online Store" sales channel in Shopify
5. Check browser console for API errors

### Cart Not Persisting

**Issue**: Cart clears on page refresh

**Solutions**:
1. Check browser localStorage is enabled
2. Verify CartProvider is wrapping the app in `layout.tsx`
3. Clear browser cache and cookies
4. Check for JavaScript errors in console

### Images Not Displaying

**Issue**: Product images show broken or don't load

**Solutions**:
1. Verify images are uploaded in Shopify admin
2. Check image URLs in browser network tab
3. Ensure Next.js Image component has proper domains configured
4. Add Shopify CDN to `next.config.js`:

```js
images: {
  domains: ['cdn.shopify.com'],
}
```

### API Rate Limiting

**Issue**: "Too Many Requests" errors

**Solutions**:
1. Shopify Storefront API has rate limits
2. Reduce frequency of API calls
3. Implement caching (already configured with 60s revalidation)
4. Contact Shopify support for higher limits if needed

### TypeScript Errors

**Issue**: Type errors in IDE

**Solutions**:
1. Run `npm install` to ensure all packages are installed
2. Restart TypeScript server in your IDE
3. Check that `@shopify/hydrogen-react` and `shopify-buy` are installed

### Checkout Redirect Issues

**Issue**: Checkout button doesn't work

**Solutions**:
1. Verify `checkoutUrl` is present in cart object
2. Check browser console for errors
3. Ensure cart is not empty
4. Test in different browser (disable ad blockers)

---

## Advanced Configuration

### Custom Checkout Domain

To use a custom checkout domain instead of `myshopify.com`:

1. In Shopify admin: **Settings** → **Checkout** → **Custom domain**
2. Follow Shopify's instructions to set up custom domain
3. Checkout URLs will automatically use your custom domain

### Campus Pickup Option

To enable campus pickup at checkout:

1. In Shopify admin: **Settings** → **Shipping and delivery**
2. Add "Local pickup" shipping method
3. Set pickup location as school address
4. Customers can select this at checkout

### Promo Codes

Shopify checkout automatically supports discount codes:

1. Create discount codes in Shopify admin
2. Customers can enter them at checkout
3. No additional configuration needed

### Tax Configuration

Configure tax settings in Shopify:

1. **Settings** → **Taxes and duties**
2. Set up tax rates for your location
3. Configure tax collection settings

---

## Next Steps

### Optional Enhancements

1. **Product Reviews**: Add review system (third-party app or custom)
2. **Wishlist**: Allow users to save favorite products
3. **Email Notifications**: Order confirmations and updates
4. **Analytics**: Track store performance
5. **SEO**: Optimize product pages for search engines
6. **Admin Dashboard**: View orders and inventory in PTO admin

### Webhooks (Future)

Set up webhooks to sync data:

- Product updates
- Order creation
- Inventory changes

Webhook endpoint: `/api/webhooks/shopify`

---

## Support

### Resources

- [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project Repository Issues](https://github.com/your-repo/issues)

### Getting Help

1. Check this documentation first
2. Review Shopify admin for product/settings issues
3. Check browser console for error messages
4. Contact development team with specific error details

---

## Security Notes

1. **Never commit** Shopify API keys to version control
2. Use **environment variables** for all sensitive data
3. Storefront API tokens are **public-facing** (safe for client-side use)
4. Admin API tokens should **only** be used server-side
5. Regularly rotate API tokens
6. Monitor Shopify admin for suspicious activity

---

## Changelog

### Version 1.0.0 (Initial Release)
- Complete Shopify Storefront API integration
- Product catalog with filtering and sorting
- Product detail pages
- Shopping cart functionality
- Shopify checkout integration
- Responsive design
- Cart persistence
- Loading states and error handling

---

**Last Updated**: January 2025
**Maintained By**: Centner Academy PTO Development Team
