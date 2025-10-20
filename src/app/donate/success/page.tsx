'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { CheckCircle, Heart, Home, Mail, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function SuccessContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-2 border-green-200 shadow-xl">
          <CardContent className="pt-12 pb-8 px-6 md:px-12">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
                <div className="relative bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-full shadow-lg">
                  <CheckCircle className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Thank You for Your Generosity!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Your donation has been successfully processed.
              </p>
              <p className="text-gray-500">
                You will receive a confirmation email shortly with your receipt.
              </p>
            </div>

            {/* Impact Message */}
            <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-6 mb-8 border border-green-200">
              <div className="flex items-start gap-3">
                <Heart className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Making a Real Difference
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your contribution directly supports our students, teachers, and community programs.
                    Together, we are creating enriching educational experiences and building a stronger
                    school community.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4 mb-8">
              <h3 className="font-semibold text-gray-800 text-center">What Happens Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700">Email Confirmation</p>
                    <p className="text-gray-500">
                      Check your email for your tax-deductible donation receipt
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Heart className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700">Recognition</p>
                    <p className="text-gray-500">
                      Your support will be acknowledged in our donor recognition program
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Share2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700">Stay Updated</p>
                    <p className="text-gray-500">
                      Receive updates on how your donation is making an impact
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Return Home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/events">
                  View Upcoming Events
                </Link>
              </Button>
            </div>

            {/* Social Sharing */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500 mb-4">
                Help us spread the word about supporting our PTO
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = "I just supported Centner Academy PTO! Join me in making a difference in our students' education."
                    const url = `${window.location.origin}/donate`
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                      '_blank'
                    )
                  }}
                >
                  Share on Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `${window.location.origin}/donate`
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                      '_blank'
                    )
                  }}
                >
                  Share on Facebook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Questions about your donation?{' '}
            <Link href="/contact" className="text-primary hover:underline font-medium">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
