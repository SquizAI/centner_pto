import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/header'
import MobileNav from '@/components/layout/mobile-nav'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Centner Academy PTO',
    template: '%s | Centner Academy PTO',
  },
  description: 'Supporting excellence in education across Preschool, Elementary, and Middle/High School campuses',
  keywords: ['Centner Academy', 'PTO', 'Parent Teacher Organization', 'Miami', 'Education'],
  authors: [{ name: 'Centner Academy PTO' }],
  creator: 'Centner Academy PTO',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: '/favicon.ico',
    apple: '/centner-bee.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: 'Centner Academy PTO',
    description: 'Supporting excellence in education',
    siteName: 'Centner Academy PTO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Centner Academy PTO',
    description: 'Supporting excellence in education',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <main className="pb-16 md:pb-0">{children}</main>
        <MobileNav />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
