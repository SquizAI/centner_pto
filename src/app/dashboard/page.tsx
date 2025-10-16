import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { updateProfile } from '@/app/actions/auth-actions'
import { User, Mail, Phone, GraduationCap, School, CalendarDays } from 'lucide-react'
import ProfileEditForm from '@/components/dashboard/ProfileEditForm'
import VolunteerSignups from '@/components/dashboard/VolunteerSignups'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your Centner Academy PTO account',
}

export default async function DashboardPage() {
  const user = await requireAuth()

  // Redirect admin users to admin dashboard
  if (user.profile.role === 'admin' || user.profile.role === 'super_admin') {
    redirect('/admin')
  }

  const supabase = await createClient()

  // Fetch user's volunteer signups
  const { data: signups } = await supabase
    .from('volunteer_signups')
    .select(`
      *,
      opportunity:volunteer_opportunities(
        id,
        title,
        description,
        date,
        location,
        status
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'volunteer':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.profile.full_name}!</h1>
        <p className="text-muted-foreground">
          Manage your profile and view your PTO activity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <Badge variant={getRoleBadgeVariant(user.profile.role)}>
                {formatRole(user.profile.role)}
              </Badge>
            </div>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Name:</span>
                <span>{user.profile.full_name || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{user.profile.email}</span>
              </div>
              {user.profile.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{user.profile.phone}</span>
                </div>
              )}
              {user.profile.campus && (
                <div className="flex items-center gap-2 text-sm">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Campus:</span>
                  <span className="capitalize">{user.profile.campus.replace('_', ' ')}</span>
                </div>
              )}
              {user.profile.student_grades && user.profile.student_grades.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="font-medium">Student Grades:</span>
                  <span>{user.profile.student_grades.join(', ')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileEditForm profile={user.profile} />
          </CardContent>
        </Card>

        {/* Volunteer Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Your Volunteer Signups
            </CardTitle>
            <CardDescription>
              View and manage your volunteer commitments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VolunteerSignups signups={signups || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
