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
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!user) {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-white font-semibold">
              {getUserInitials(user.profile.full_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
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
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
