'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth-actions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Settings, LayoutDashboard, Shield, LogOut, Loader2 } from 'lucide-react'
import { getUserInitials } from '@/lib/utils/user-helpers'

export type UserRole = 'member' | 'volunteer' | 'admin' | 'super_admin'

export interface Profile {
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

interface UserMenuProps {
  user: {
    email: string
    profile: Profile
  } | null
  isMobile?: boolean
}

export default function UserMenu({ user, isMobile = false }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!user) {
    // Mobile version - full width button
    if (isMobile) {
      return (
        <Link href="/login" className="w-full">
          <Button size="default" variant="outline" className="w-full">
            <User className="w-4 h-4 mr-2" />
            Login
          </Button>
        </Link>
      )
    }

    // Desktop version - small button
    return (
      <Link href="/login">
        <Button size="sm" variant="outline">
          <User className="w-4 h-4 mr-2" />
          Login
        </Button>
      </Link>
    )
  }

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      setIsLoggingOut(false)
    }
  }

  const isAdmin = user.profile.role === 'admin' || user.profile.role === 'super_admin'

  // Mobile version - full width buttons
  if (isMobile) {
    return (
      <div className="w-full flex flex-col gap-2">
        {/* Prominent Logout button first! */}
        <Button
          size="default"
          className="w-full justify-start bg-red-600 hover:bg-red-700 text-white font-semibold"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </>
          )}
        </Button>

        <div className="h-px bg-gray-200 my-1" />

        <Link href="/dashboard" className="w-full">
          <Button size="default" variant="outline" className="w-full justify-start">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            My Dashboard
          </Button>
        </Link>
        <Link href="/dashboard" className="w-full">
          <Button size="default" variant="outline" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    )
  }

  // Desktop version - Avatar dropdown PLUS visible Logout button
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={isAdmin ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold" : "bg-primary text-white font-semibold"}>
                      {getUserInitials(user.profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {isAdmin && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center">
                      <Shield className="h-2.5 w-2.5 text-purple-900" />
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.profile.full_name || 'User'} • Account menu</p>
            </TooltipContent>
          </Tooltip>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.profile.full_name || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>

      {/* Visible Logout Button - No dropdown needed! */}
      <Button
        size="sm"
        variant="outline"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={handleSignOut}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Logging out...
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </>
        )}
      </Button>
    </div>
  )
}
