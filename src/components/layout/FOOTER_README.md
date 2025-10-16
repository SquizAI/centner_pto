# Footer Component Documentation

## Overview

The `footer.tsx` component is a comprehensive, production-ready footer for the Centner Academy PTO website. It provides essential navigation, contact information, social media links, and legal information in a fully responsive and accessible design.

## Location

```
src/components/layout/footer.tsx
```

## Features

### Core Functionality
- **About Section**: Displays PTO mission, logo, and 501(c)(3) status
- **Quick Links**: Navigation to main sections (Events, News, Gallery, Volunteer, Donate)
- **Connect Links**: Links to About, Store, Contact, and external Centner Academy site
- **Contact Information**: Email, phone, and address with clickable links
- **Social Media**: Facebook, Instagram, and Twitter links with icons
- **Legal Links**: Privacy Policy, Terms of Service, Tax Information
- **Copyright Notice**: Dynamic year with tax-deductible donation disclaimer
- **Donate Button**: Prominent call-to-action with gradient styling

### Design Features
- **Fully Responsive**: Mobile-first design with breakpoints for tablet and desktop
- **Smooth Animations**: Framer Motion animations on scroll with stagger effects
- **Hover Effects**: Interactive states for all links and buttons
- **Brand Consistency**: Uses Centner Academy brand colors and styling
- **Decorative Elements**: Subtle gradient blobs for visual interest

### Accessibility Features
- **Semantic HTML**: Proper use of `<footer>`, `<nav>`, `<address>` elements
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Keyboard Navigation**: Full keyboard support with visible focus states
- **Screen Reader Support**: Proper labeling and role attributes
- **External Link Indicators**: Visual indicators for links that open in new tabs
- **Color Contrast**: WCAG AA compliant color ratios

## Usage

### Basic Implementation

```tsx
import Footer from '@/components/layout/footer'

export default function Page() {
  return (
    <div>
      {/* Page content */}
      <Footer />
    </div>
  )
}
```

### In Layout Component

```tsx
// src/app/layout.tsx
import Footer from '@/components/layout/footer'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

## Customization

### Updating Links

Edit the arrays in the component:

```tsx
// Quick Links
const quickLinks: FooterLink[] = [
  { label: 'Events Calendar', href: '/events' },
  // Add or modify links here
]

// Connect Links
const connectLinks: FooterLink[] = [
  { label: 'About PTO', href: '/about' },
  // Add or modify links here
]

// Legal Links
const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  // Add or modify links here
]
```

### Updating Contact Information

```tsx
const contactInfo = {
  email: 'pto@centneracademy.com',
  phone: '(305) 555-1234',
  address: '4215 Alton Road, Miami Beach, FL 33140'
}
```

### Updating Social Media Links

```tsx
const socialLinks: SocialLink[] = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/centneracademy',
    icon: <Facebook className="w-5 h-5" aria-hidden="true" />
  },
  // Add or modify social links here
]
```

## Responsive Breakpoints

- **Mobile** (default): Single column layout
- **Small** (`sm:` - 640px+): Two column layout
- **Large** (`lg:` - 1024px+): Four column layout

## Color Scheme

The footer uses the following Centner Academy brand colors:

- **Background**: `bg-slate-900` (dark blue-gray)
- **Text**: `text-white` (primary), `text-slate-400` (secondary)
- **Hover States**: `hover:text-primary` (bright blue)
- **Donate Button**: Gradient from `secondary` (pink) to `accent` (orange)
- **Focus Rings**: `focus:ring-primary` with offset

## Animations

### Scroll Animations
- Fade in and slide up on scroll using Framer Motion
- Stagger effect for column entries
- Scale animation for divider line

### Hover Animations
- Arrow icons slide in from left on link hover
- Social media icons scale up on hover
- Smooth color transitions (200ms duration)

## Accessibility Checklist

- [x] Semantic HTML elements (`<footer>`, `<nav>`, `<address>`)
- [x] ARIA labels on all interactive elements
- [x] Proper heading hierarchy
- [x] Keyboard navigation support
- [x] Visible focus indicators
- [x] Screen reader friendly text
- [x] External link indicators
- [x] Sufficient color contrast (WCAG AA)
- [x] Touch-friendly tap targets (min 44x44px)

## Dependencies

- `next/image`: Optimized image component for logo
- `next/link`: Client-side navigation
- `framer-motion`: Animation library
- `lucide-react`: Icon library

## Icons Used

- `Mail`: Email contact
- `Phone`: Phone contact
- `MapPin`: Address contact
- `Facebook`, `Instagram`, `Twitter`: Social media
- `Heart`: Donate button
- `ExternalLink`: External link indicator
- `ArrowRight`: Link hover effect

## Testing

### Manual Testing Checklist

- [ ] All links navigate to correct pages
- [ ] External links open in new tab
- [ ] Social media links work correctly
- [ ] Email link opens mail client
- [ ] Phone link initiates call on mobile
- [ ] Address link opens Google Maps
- [ ] Donate button navigates to donate page
- [ ] Hover effects work on all interactive elements
- [ ] Animations trigger on scroll
- [ ] Responsive layout works on all screen sizes
- [ ] Keyboard navigation works (Tab, Enter, Shift+Tab)
- [ ] Screen reader announces all content correctly

### Browser Testing

Test in the following browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## Performance Considerations

- Uses Next.js Image component for optimized logo loading
- Animations use `viewport: { once: true }` to prevent re-triggering
- Framer Motion animations are GPU-accelerated
- CSS transitions use transform and opacity (performant properties)

## Future Enhancements

Potential improvements for future versions:

1. **Newsletter Signup**: Add email subscription form
2. **Language Selector**: Multi-language support
3. **Theme Toggle**: Dark/light mode switch
4. **Sitemap Link**: Add comprehensive sitemap
5. **Accessibility Widget**: Third-party accessibility tools integration
6. **Live Chat**: Customer support chat widget
7. **Dynamic Content**: CMS integration for editable footer content
8. **Analytics**: Track footer link clicks
9. **A/B Testing**: Test different layouts and CTAs

## Troubleshooting

### Logo Not Displaying
- Ensure `/centner-bee.png` exists in the `public` folder
- Check image file permissions
- Verify Next.js Image component configuration

### Links Not Working
- Check route paths match your routing structure
- Verify external URLs are correct
- Ensure Link component is imported from `next/link`

### Animations Not Triggering
- Verify Framer Motion is installed: `npm install framer-motion`
- Check that parent element is scrollable
- Ensure `viewport: { once: true }` is set correctly

### Responsive Layout Issues
- Check Tailwind CSS configuration
- Verify breakpoint classes are correct
- Test in browser dev tools responsive mode

## Support

For questions or issues with the Footer component:
- Review this documentation
- Check component source code comments
- Test in browser dev tools
- Consult Centner Academy design system

## Version History

- **v1.0.0** (2025-10-16): Initial production release
  - Complete footer with all sections
  - Fully responsive design
  - Accessibility compliant
  - Brand-consistent styling
  - Smooth animations
