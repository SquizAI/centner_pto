'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Calendar, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

interface Donation {
  id: string
  amount: number
  currency: string
  status: string
  donation_type: string
  is_recurring: boolean
  recurring_interval: string | null
  created_at: string
  student_grade?: string
  campus?: string
}

interface DonationHistoryProps {
  donations: Donation[]
}

export default function DonationHistory({ donations }: DonationHistoryProps) {
  const totalDonated = donations
    .filter((d) => d.status === 'succeeded')
    .reduce((sum, d) => sum + d.amount, 0)

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDonationType = (type: string) => {
    const types: Record<string, string> = {
      general: 'General Fund',
      playground: 'Playground',
      stem: 'STEM Programs',
      arts: 'Arts & Music',
      field_trips: 'Field Trips',
      teacher_appreciation: 'Teacher Appreciation',
      campus_specific: 'Campus Specific',
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {formatAmount(totalDonated, 'usd')}
              </div>
              <p className="text-sm text-gray-600 mt-1">Total Donated</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{donations.length}</div>
              <p className="text-sm text-gray-600 mt-1">Total Donations</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {donations.filter((d) => d.is_recurring).length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Recurring</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations List */}
      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
          <CardDescription>Your contribution history and impact</CardDescription>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
              <p className="text-gray-600">
                Your donation history will appear here once you make your first contribution
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {formatDonationType(donation.donation_type)}
                        </h4>
                        {donation.is_recurring && (
                          <Badge variant="secondary" className="text-xs">
                            {donation.recurring_interval}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            donation.status === 'succeeded'
                              ? 'default'
                              : donation.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-xs"
                        >
                          {donation.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(donation.created_at), 'MMM d, yyyy')}
                        </span>
                        {donation.campus && <span>• {donation.campus}</span>}
                        {donation.student_grade && <span>• Grade {donation.student_grade}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatAmount(donation.amount, donation.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
