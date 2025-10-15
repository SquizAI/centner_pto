'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'
// import { createClient } from '@/lib/supabase/client'
// import UserMenu, { type Profile } from '@/components/auth/UserMenu'

const desktopNavItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Events', href: '/events' },
  { label: 'News', href: '/news' },
  { label: 'Volunteer', href: '/volunteer' },
  { label: 'Photos', href: '/photos' },
  { label: 'Store', href: '/store' },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // const [user, setUser] = useState<{ email: string; profile: Profile } | null>(null)
  // const [isLoading, setIsLoading] = useState(true)

  // useEffect(() => {
  //   const supabase = createClient()

  //   // Get initial user
  //   const getUser = async () => {
  //     const {
  //       data: { user: authUser },
  //     } = await supabase.auth.getUser()

  //     if (authUser) {
  //       const { data: profile } = await supabase
  //         .from('profiles')
  //         .select('*')
  //         .eq('id', authUser.id)
  //         .single()

  //       if (profile) {
  //         setUser({ email: authUser.email!, profile })
  //       }
  //     }
  //     setIsLoading(false)
  //   }

  //   getUser()

  //   // Listen for auth changes
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     if (session?.user) {
  //       const { data: profile } = await supabase
  //         .from('profiles')
  //         .select('*')
  //         .eq('id', session.user.id)
  //         .single()

  //       if (profile) {
  //         setUser({ email: session.user.email!, profile })
  //       }
  //     } else {
  //       setUser(null)
  //     }
  //   })

  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b bg-white/98 backdrop-blur-md shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/" className="flex items-center gap-2 md:gap-3">
                <Image
                  src="https://centneracademy.com/wp-content/uploads/2021/02/logo-centner.png"
                  alt="Centner Academy"
                  width={120}
                  height={50}
                  priority
                  className="h-8 md:h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
                <div className="border-l border-primary/30 pl-2 md:pl-3 h-8 md:h-10 flex flex-col justify-center">
                  <div className="text-xs md:text-sm font-bold text-primary leading-tight">PTO</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground leading-tight hidden sm:block">
                    Parent-Teacher Org
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {desktopNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 xl:px-4 py-2 text-sm font-medium rounded-lg transition-all',
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Link href="/donate" className="hidden sm:block">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#FF6B9D] to-[#FEC84B] hover:opacity-90 text-white border-0 font-semibold shadow-md"
                >
                  <Heart className="w-4 h-4 mr-1.5" fill="currentColor" />
                  Donate
                </Button>
              </Link>
              <Link href="/store" className="hidden md:block">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary hover:text-white font-semibold"
                >
                  <ShoppingBag className="w-4 h-4 mr-1.5" />
                  Store
                </Button>
              </Link>
              {/* {!isLoading && <UserMenu user={user} />} */}
              <Button
                size="sm"
                variant="ghost"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-2">
                {desktopNavItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'px-4 py-3 text-base font-medium rounded-lg transition-all',
                        isActive
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                <div className="border-t pt-3 mt-2 flex flex-col gap-2">
                  <Link href="/donate" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      size="default"
                      className="w-full bg-gradient-to-r from-[#FF6B9D] to-[#FEC84B] hover:opacity-90 text-white border-0 font-semibold"
                    >
                      <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                      Make a Donation
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </motion.header>
    </>
  )
}
