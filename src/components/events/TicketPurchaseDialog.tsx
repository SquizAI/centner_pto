'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Ticket, AlertCircle } from 'lucide-react'
import { Event } from '@/types/events'
import { toast } from 'sonner'

interface TicketPurchaseDialogProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TicketPurchaseDialog({
  event,
  open,
  onOpenChange,
}: TicketPurchaseDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableTickets = (event.ticket_quantity || 0) - (event.tickets_sold || 0)
  const unitPrice = event.ticket_price || 0
  const totalPrice = unitPrice * quantity

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate fields
      if (!buyerName || !buyerEmail) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      if (quantity > availableTickets) {
        setError(`Only ${availableTickets} tickets available`)
        setLoading(false)
        return
      }

      // Create checkout session
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          quantity,
          buyerName,
          buyerEmail,
          buyerPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process checkout')
      setLoading(false)
      toast.error('Failed to create checkout session')
    }
  }

  // Check if sales are currently open
  const now = new Date()
  const salesStart = event.ticket_sales_start ? new Date(event.ticket_sales_start) : null
  const salesEnd = event.ticket_sales_end ? new Date(event.ticket_sales_end) : null

  const salesNotStarted = salesStart && salesStart > now
  const salesEnded = salesEnd && salesEnd < now
  const soldOut = availableTickets <= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Purchase Tickets
          </DialogTitle>
          <DialogDescription>
            {event.title}
          </DialogDescription>
        </DialogHeader>

        {salesNotStarted && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              Ticket sales open on {salesStart?.toLocaleDateString()} at {salesStart?.toLocaleTimeString()}
            </div>
          </div>
        )}

        {salesEnded && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              Ticket sales have ended
            </div>
          </div>
        )}

        {soldOut && !salesEnded && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              This event is sold out
            </div>
          </div>
        )}

        {!salesNotStarted && !salesEnded && !soldOut && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available tickets:</span>
                <span className="font-semibold">{availableTickets}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price per ticket:</span>
                <span className="font-semibold">${unitPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={availableTickets}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerName">Full Name *</Label>
              <Input
                id="buyerName"
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerEmail">Email *</Label>
              <Input
                id="buyerEmail"
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerPhone">Phone (Optional)</Label>
              <Input
                id="buyerPhone"
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4 mr-2" />
                  Continue to Payment
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You'll be redirected to Stripe for secure payment processing
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
