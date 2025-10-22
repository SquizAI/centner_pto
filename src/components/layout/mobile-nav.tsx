'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Newspaper, Users, LogIn, LayoutDashboard, UserCircle, MoreHorizontal, Shield, LogOut, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/app/actions/auth-actions'
import { useEffect, useState } from 'react'
import { getUserInitials } from '@/lib/utils/user-helpers'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

type UserRole = 'member' | 'volunteer' | 'admin' | 'super_admin'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  campus: string | null
  student_grades: string[] | null
  phone: string | null
  created_at: string
  updated_at: string
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

// Nav items for logged out users
const loggedOutNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Events',
    href: '/events',
    icon: Calendar,
  },
  {
    label: 'News',
    href: '/news',
    icon: Newspaper,
  },
  {
    label: 'Volunteer',
    href: '/volunteer',
    icon: Users,
  },
  {
    label: 'Login',
    href: '/login',
    icon: LogIn,
  },
]

// Nav items for logged in members
const memberNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Events',
    href: '/events',
    icon: Calendar,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Profile',
    href: '/dashboard',
    icon: UserCircle,
  },
  {
    label: 'More',
    href: '#more',
    icon: MoreHorizontal,
  },
]

// Nav items for admin users
const adminNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: Shield,
  },
  {
    label: 'Events',
    href: '/events',
    icon: Calendar,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Profile',
    href: '/dashboard',
    icon: UserCircle,
  },
]

export default function MobileNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string; profile: Profile } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    const getUser = async () => {
      try {
        // Use getSession() instead of getUser() for client components
        // getSession() reads from localStorage and doesn't require server validation
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('MobileNav: Session error:', sessionError)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('MobileNav: Profile fetch error:', profileError)
          }

          if (profile) {
            setUser({ email: session.user.email!, profile })
          }
        }
      } catch (error) {
        console.error('MobileNav: Error getting user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser({ email: session.user.email!, profile })
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname]) // Re-check auth on navigation

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    setMoreMenuOpen(false)
    try {
      await signOut()
    } catch (error) {
      setIsLoggingOut(false)
    }
  }

  // Determine which nav items to show
  const getNavItems = (): NavItem[] => {
    if (!user) return loggedOutNavItems

    const isAdmin = user.profile.role === 'admin' || user.profile.role === 'super_admin'
    return isAdmin ? adminNavItems : memberNavItems
  }

  const navItems = getNavItems()
  const isAdmin = user?.profile.role === 'admin' || user?.profile.role === 'super_admin'

  // Don't render until we know auth state
  if (isLoading) {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-1">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </nav>
    )
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && item.href !== '#more' && pathname.startsWith(item.href))

          // Special handling for "More" menu item
          if (item.href === '#more' && user) {
            return (
              <Sheet key={item.href} open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 transition-all',
                      'text-gray-600 hover:text-primary hover:bg-gray-50 active:scale-95'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto">
                  <SheetHeader>
                    <SheetTitle>More Options</SheetTitle>
                    <SheetDescription>
                      Access additional features and settings
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-3 mt-6 pb-4">
                    {/* User Profile Info */}
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback
                          className={isAdmin
                            ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold text-base"
                            : "bg-primary text-white font-semibold text-base"
                          }
                        >
                          {getUserInitials(user.profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.profile.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <div className="flex items-center gap-1 mt-1">
                            <Shield className="h-3 w-3 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600">
                              {user.profile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Menu Items */}
                    <div className="flex flex-col gap-2">
                      <Link href="/news" onClick={() => setMoreMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start h-12" size="lg">
                          <Newspaper className="mr-3 h-5 w-5" />
                          News & Updates
                        </Button>
                      </Link>
                      <Link href="/volunteer" onClick={() => setMoreMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start h-12" size="lg">
                          <Users className="mr-3 h-5 w-5" />
                          Volunteer Opportunities
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setMoreMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start h-12 border-purple-200 text-purple-700 hover:bg-purple-50" size="lg">
                            <Shield className="mr-3 h-5 w-5" />
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Logout Button */}
                    <div className="border-t pt-3 mt-2">
                      <Button
                        variant="destructive"
                        className="w-full h-12"
                        size="lg"
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing out...
                          </>
                        ) : (
                          <>
                            <LogOut className="mr-2 h-5 w-5" />
                            Sign Out
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )
          }

          // Special handling for Profile item (show avatar instead of icon)
          if (item.href === '/dashboard' && item.icon === UserCircle && user) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-all',
                  isActive
                    ? 'text-primary bg-primary/5'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                )}
              >
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback
                      className={isAdmin
                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold text-[10px]"
                        : "bg-primary text-white font-semibold text-[10px]"
                      }
                    >
                      {getUserInitials(user.profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {isAdmin && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-400 border border-white flex items-center justify-center">
                      <Shield className="h-1.5 w-1.5 text-purple-900" />
                    </span>
                  )}
                </div>
                <span className={cn('text-xs font-medium', isActive && 'scale-105')}>{item.label}</span>
              </Link>
            )
          }

          // Regular nav items
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-all',
                isActive
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
