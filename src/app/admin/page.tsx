import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users,
  Calendar,
  Heart,
  Camera,
  HandHeart,
  Newspaper,
  TrendingUp,
  Shield,
  LayoutDashboard,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage the Centner Academy PTO website',
}

export default async function AdminPage() {
  const user = await requireAdmin()
  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: totalUsers },
    { count: totalEvents },
    { count: totalPhotos },
    { count: totalVolunteers },
    { count: totalNews },
    { data: recentDonations },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('photos').select('*', { count: 'exact', head: true }),
    supabase.from('volunteer_signups').select('*', { count: 'exact', head: true }),
    supabase.from('news_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase
      .from('donations')
      .select('amount, created_at')
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Calculate total donations
  const totalDonationsAmount = recentDonations?.reduce((sum, d) => sum + d.amount, 0) || 0

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers || 0,
      icon: Users,
      description: 'Registered members',
      color: 'text-blue-600',
    },
    {
      title: 'Active Events',
      value: totalEvents || 0,
      icon: Calendar,
      description: 'Published events',
      color: 'text-purple-600',
    },
    {
      title: 'Total Donations',
      value: `$${((totalDonationsAmount || 0) / 100).toFixed(0)}`,
      icon: Heart,
      description: 'Recent donations',
      color: 'text-pink-600',
    },
    {
      title: 'Volunteer Signups',
      value: totalVolunteers || 0,
      icon: HandHeart,
      description: 'Active volunteers',
      color: 'text-green-600',
    },
    {
      title: 'Gallery Photos',
      value: totalPhotos || 0,
      icon: Camera,
      description: 'Total photos',
      color: 'text-amber-600',
    },
    {
      title: 'News Articles',
      value: totalNews || 0,
      icon: Newspaper,
      description: 'Published articles',
      color: 'text-indigo-600',
    },
  ]

  const quickLinks = [
    {
      title: 'Gallery Management',
      description: 'Upload and manage event photos',
      href: '/gallery/admin',
      icon: Camera,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Volunteer Management',
      description: 'Create and manage volunteer opportunities',
      href: '/volunteer/admin',
      icon: HandHeart,
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'News Management',
      description: 'Create and edit news posts',
      href: '/news/admin',
      icon: Newspaper,
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      title: 'Events Management',
      description: 'Manage PTO events and activities',
      href: '/events/admin',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-700',
    },
  ]

  const isSuperAdmin = user.profile.role === 'super_admin'

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Welcome back, {user.profile.full_name}! Here&apos;s an overview of the PTO website.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${link.color}`}>
                      <link.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                      <CardDescription>{link.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Super Admin Section */}
      {isSuperAdmin && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Super Admin Tools
            </CardTitle>
            <CardDescription>
              Additional tools available only to super administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                User Management
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Site Settings
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics & Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
