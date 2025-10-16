'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCheckoutSession } from '@/app/actions/donation-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { PRESET_AMOUNTS, DONATION_TYPES, RECURRING_INTERVALS } from '@/lib/stripe/config'

const CAMPUS_OPTIONS = [
  { value: 'all', label: 'All Campuses' },
  { value: 'preschool', label: 'Preschool' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'middle_high', label: 'Middle & High School' },
]

const GRADE_OPTIONS = [
  'PreK',
  'K',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th',
]

export default function DonationForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const [formData, setFormData] = useState({
    donationType: 'general' as keyof typeof DONATION_TYPES,
    frequency: 'one_time' as 'one_time' | 'monthly' | 'quarterly' | 'annual',
    donorName: '',
    donorEmail: '',
    phone: '',
    studentName: '',
    studentGrade: '',
    campus: 'all' as 'all' | 'preschool' | 'elementary' | 'middle_high',
    isAnonymous: false,
    message: '',
  })

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setShowCustom(false)
    setCustomAmount('')
  }

  const handleCustomClick = () => {
    setShowCustom(true)
    setSelectedAmount(null)
  }

  const getFinalAmount = (): number => {
    if (showCustom && customAmount) {
      return parseFloat(customAmount)
    }
    return selectedAmount || 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const amount = getFinalAmount()

      if (!amount || amount < 5) {
        toast.error('Minimum donation amount is $5')
        setLoading(false)
        return
      }

      if (amount > 10000) {
        toast.error('Maximum donation amount is $10,000. For larger donations, please contact us.')
        setLoading(false)
        return
      }

      if (!formData.donorName || !formData.donorEmail) {
        toast.error('Please fill in all required fields')
        setLoading(false)
        return
      }

      const result = await createCheckoutSession({
        amount,
        ...formData,
      })

      if (result.success && result.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.url
      } else {
        toast.error(result.error || 'Failed to create checkout session')
        setLoading(false)
      }
    } catch (error) {
      console.error('Donation submission error:', error)
      toast.error('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Amount Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Donation Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={selectedAmount === amount ? 'default' : 'outline'}
                className="h-16 text-lg font-semibold"
                onClick={() => handleAmountSelect(amount)}
              >
                ${amount}
              </Button>
            ))}
            <Button
              type="button"
              variant={showCustom ? 'default' : 'outline'}
              className="h-16 text-lg font-semibold"
              onClick={handleCustomClick}
            >
              Custom
            </Button>
          </div>

          {showCustom && (
            <div>
              <Label htmlFor="customAmount">Custom Amount ($)</Label>
              <Input
                id="customAmount"
                type="number"
                min="5"
                max="10000"
                step="1"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="text-lg"
                required
              />
            </div>
          )}

          {/* Frequency */}
          <div>
            <Label htmlFor="frequency">Donation Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: any) =>
                setFormData({ ...formData, frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time">One-Time Donation</SelectItem>
                {Object.entries(RECURRING_INTERVALS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label} Recurring
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Donation Type */}
      <Card>
        <CardHeader>
          <CardTitle>What would you like to support?</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.donationType}
            onValueChange={(value: any) =>
              setFormData({ ...formData, donationType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DONATION_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Donor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="donorName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="donorName"
              value={formData.donorName}
              onChange={(e) =>
                setFormData({ ...formData, donorName: e.target.value })
              }
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="donorEmail">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="donorEmail"
              type="email"
              value={formData.donorEmail}
              onChange={(e) =>
                setFormData({ ...formData, donorEmail: e.target.value })
              }
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studentName">Student Name (Optional)</Label>
              <Input
                id="studentName"
                value={formData.studentName}
                onChange={(e) =>
                  setFormData({ ...formData, studentName: e.target.value })
                }
                placeholder="Student's name"
              />
            </div>

            <div>
              <Label htmlFor="studentGrade">Student Grade (Optional)</Label>
              <Select
                value={formData.studentGrade}
                onValueChange={(value) =>
                  setFormData({ ...formData, studentGrade: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="campus">Campus Affiliation (Optional)</Label>
            <Select
              value={formData.campus}
              onValueChange={(value: any) =>
                setFormData({ ...formData, campus: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message or Special Instructions (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Leave a message..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isAnonymous: checked as boolean })
              }
            />
            <Label
              htmlFor="anonymous"
              className="text-sm font-normal cursor-pointer"
            >
              Make this donation anonymous
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-primary mb-2">
              ${getFinalAmount().toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">
              {formData.frequency === 'one_time'
                ? 'One-time donation'
                : `${
                    RECURRING_INTERVALS[
                      formData.frequency as keyof typeof RECURRING_INTERVALS
                    ]
                  } recurring donation`}
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full text-lg"
            disabled={loading || getFinalAmount() < 5}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-5 w-5" fill="currentColor" />
                Continue to Payment
              </>
            )}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              Secure Payment
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              Tax Deductible
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              100% to PTO
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
