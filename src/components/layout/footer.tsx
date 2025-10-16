'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Heart,
  ExternalLink,
  ArrowRight
} from 'lucide-react'

/**
 * Footer Component
 *
 * Comprehensive footer with multiple sections including:
 * - About PTO with mission statement
 * - Quick navigation links
 * - Contact information
 * - Social media links
 * - Legal links
 * - Copyright and tax information
 *
 * Features:
 * - Fully responsive (mobile, tablet, desktop)
 * - Accessible with ARIA labels and semantic HTML
 * - Smooth hover animations
 * - Consistent with Centner Academy brand styling
 */

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface SocialLink {
  label: string
  href: string
  icon: React.ReactNode
}

const Footer = () => {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: {
      staggerChildren: 0.1
    }
  }

  // Quick Links
  const quickLinks: FooterLink[] = [
    { label: 'Events Calendar', href: '/events' },
    { label: 'News & Updates', href: '/news' },
    { label: 'Photo Gallery', href: '/gallery' },
    { label: 'Volunteer', href: '/volunteer' },
    { label: 'Donate', href: '/donate' },
  ]

  // Connect Links
  const connectLinks: FooterLink[] = [
    { label: 'About PTO', href: '/about' },
    { label: 'PTO Store', href: '/store' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Centner Academy', href: 'https://centneracademy.com', external: true },
  ]

  // Legal Links
  const legalLinks: FooterLink[] = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Tax Information', href: '/tax-info' },
  ]

  // Social Media Links
  const socialLinks: SocialLink[] = [
    {
      label: 'Facebook',
      href: 'https://facebook.com/centneracademy',
      icon: <Facebook className="w-5 h-5" aria-hidden="true" />
    },
    {
      label: 'Instagram',
      href: 'https://instagram.com/centneracademy',
      icon: <Instagram className="w-5 h-5" aria-hidden="true" />
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com/centneracademy',
      icon: <Twitter className="w-5 h-5" aria-hidden="true" />
    },
  ]

  // Contact Information
  const contactInfo = {
    email: 'pto@centneracademy.com',
    phone: '(305) 555-1234',
    address: '4215 Alton Road, Miami Beach, FL 33140'
  }

  return (
    <footer className="bg-slate-900 text-white" role="contentinfo">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12"
        >
          {/* About Section */}
          <motion.div variants={fadeInUp} className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/centner-bee.png"
                alt="Centner Academy Bumblebee Mascot"
                width={60}
                height={60}
                className="drop-shadow-lg transition-transform hover:scale-110 duration-300"
              />
              <h2 className="text-lg font-bold">
                Centner Academy PTO
              </h2>
            </div>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Building community and supporting excellence in education. Together, we cultivate leaders with heart.
            </p>
            <p className="text-slate-500 text-xs mb-4">
              MICA PTO, Co. is a 501(c)(3) nonprofit organization
            </p>

            {/* Donate Button */}
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-accent text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-lg hover:shadow-accent/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Make a donation to Centner Academy PTO"
            >
              <Heart className="w-4 h-4" aria-hidden="true" />
              Donate Now
            </Link>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav aria-label="Quick Links">
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 text-sm hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <ArrowRight
                        className="w-4 h-4 text-primary opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200"
                        aria-hidden="true"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* Connect */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <nav aria-label="Connect Links">
              <ul className="space-y-3">
                {connectLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 text-sm hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <ArrowRight
                        className="w-4 h-4 text-primary opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200"
                        aria-hidden="true"
                      />
                      {link.label}
                      {link.external && (
                        <ExternalLink className="w-3 h-3 ml-1" aria-label="(opens in new tab)" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* Contact & Social */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>

            {/* Contact Information */}
            <address className="not-italic space-y-3 mb-6">
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-slate-400 text-sm hover:text-primary transition-colors duration-200 flex items-start gap-3 group"
                aria-label={`Email us at ${contactInfo.email}`}
              >
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" aria-hidden="true" />
                <span>{contactInfo.email}</span>
              </a>

              <a
                href={`tel:${contactInfo.phone.replace(/\D/g, '')}`}
                className="text-slate-400 text-sm hover:text-primary transition-colors duration-200 flex items-start gap-3 group"
                aria-label={`Call us at ${contactInfo.phone}`}
              >
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" aria-hidden="true" />
                <span>{contactInfo.phone}</span>
              </a>

              <a
                href="https://maps.google.com/?q=4215+Alton+Road,+Miami+Beach,+FL+33140"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 text-sm hover:text-primary transition-colors duration-200 flex items-start gap-3 group"
                aria-label="View address on Google Maps (opens in new tab)"
              >
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" aria-hidden="true" />
                <span>{contactInfo.address}</span>
              </a>
            </address>

            {/* Social Media */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-slate-300">Follow Us</h4>
              <div className="flex gap-3" role="list" aria-label="Social media links">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900"
                    aria-label={`Visit our ${social.label} page (opens in new tab)`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="border-t border-slate-800 mb-8"
        />

        {/* Bottom Bar */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="whileInView"
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-slate-400 mb-2">
              &copy; {new Date().getFullYear()} MICA PTO, Co. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 max-w-2xl">
              All donations to MICA PTO, Co. are considered charitable contributions and tax-deductible, as no goods or services were exchanged for this donation.
            </p>
          </div>

          {/* Legal Links */}
          <nav aria-label="Legal Links" className="flex flex-wrap items-center justify-center gap-4">
            {legalLinks.map((link, index) => (
              <span key={link.href} className="flex items-center gap-4">
                <Link
                  href={link.href}
                  className="text-sm text-slate-400 hover:text-primary transition-colors duration-200 focus:outline-none focus:underline"
                >
                  {link.label}
                </Link>
                {index < legalLinks.length - 1 && (
                  <span className="text-slate-700" aria-hidden="true">|</span>
                )}
              </span>
            ))}
          </nav>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
    </footer>
  )
}

export default Footer
