# Store Quick Start Guide

Get your Centner Academy PTO store up and running in 5 minutes!

## Step 1: Set Up Shopify (5 minutes)

1. **Create Shopify Account**
   - Go to [shopify.com](https://www.shopify.com)
   - Sign up for an account (free trial available)
   - Choose a store name (e.g., "centner-pto")

2. **Add Your Products**
   - Go to Shopify Admin → Products → Add product
   - Add at least one product with:
     - Title (e.g., "Centner Spirit T-Shirt")
     - Description
     - Price
     - Image (square format recommended)
     - Product type (e.g., "Spirit Wear")
   - Click "Save"
   - Ensure product is published to "Online Store" channel

## Step 2: Create API Access (3 minutes)

1. **Create Storefront App**
   - In Shopify Admin, go to: **Settings** → **Apps and sales channels**
   - Click **"Develop apps"**
   - Click **"Create an app"**
   - Name it: "PTO Website"
   - Click **"Create app"**

2. **Configure Permissions**
   - Click **"Configure Storefront API scopes"**
   - Enable these checkboxes:
     - ✅ `unauthenticated_read_product_listings`
     - ✅ `unauthenticated_read_product_inventory`
     - ✅ `unauthenticated_read_product_tags`
     - ✅ `unauthenticated_read_collection_listings`
     - ✅ `unauthenticated_write_checkouts`
     - ✅ `unauthenticated_read_checkouts`
   - Click **"Save"**

3. **Install App**
   - Click **"Install app"** button
   - Confirm installation

4. **Get Your Credentials**
   - Go to **"API credentials"** tab
   - Copy the **Storefront API access token** (starts with `shpat_...`)
   - Keep this handy!

## Step 3: Configure Your Website (2 minutes)

1. **Open `.env.local` file** in your project root

2. **Add/Update these lines**:
   ```bash
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store-name.myshopify.com
   NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_your_token_here
   ```

3. **Replace placeholders**:
   - `your-store-name` = Your Shopify store name
   - `shpat_your_token_here` = The token you copied

4. **Example**:
   ```bash
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=centner-pto.myshopify.com
   NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_a1b2c3d4e5f6g7h8i9j0
   ```

## Step 4: Test Your Store (1 minute)

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   - Go to: `http://localhost:5001/store`
   - You should see your products!

3. **Test features**:
   - Click on a product
   - Add to cart
   - View cart
   - Click "Proceed to Checkout"

## Step 5: Deploy to Production

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Shopify store integration"
   git push
   ```

2. **Configure Vercel**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add the same two variables from Step 3
   - Redeploy

## That's It!

Your store is now live! 🎉

---

## Quick Troubleshooting

**Products not showing?**
- Check that products are published to "Online Store" channel in Shopify
- Verify environment variables are correct (no `https://` in domain)
- Restart dev server after changing `.env.local`

**Cart button missing?**
- Check that `CartProvider` is in `layout.tsx`
- Verify `CartButton` is in `header.tsx`

**Images not loading?**
- Add `cdn.shopify.com` to `next.config.js` image domains (already done)

---

## Need More Help?

See the full documentation:
- **SHOPIFY_SETUP.md** - Detailed setup guide
- **SHOPIFY_INTEGRATION_SUMMARY.md** - Complete feature list

## Campus Pickup Setup

To allow customers to pick up orders at school:

1. In Shopify Admin: **Settings** → **Shipping and delivery**
2. Click **"Add local pickup"**
3. Enter school address
4. Set pickup location name: "Centner Academy"
5. Save

Customers will see this option at checkout!

---

**Happy selling! 🛍️**
