import { Metadata } from 'next'
import { Heart, DollarSign, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Centner Academy PTO and help us make a difference in our students\' education',
}

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full"></div>
                <div className="relative bg-gradient-to-br from-[#FF6B9D] to-[#FEC84B] p-6 rounded-2xl shadow-xl">
                  <Heart className="h-16 w-16 text-white" fill="currentColor" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#FF6B9D] to-[#FEC84B] bg-clip-text text-transparent">
              Make a Difference
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your generous donation helps fund programs, events, and activities that enrich our students education and strengthen our school community.
            </p>
          </div>

          <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 md:p-12 mb-8">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 text-center">Donation System Coming Soon</h2>
            <p className="text-gray-500 text-center mb-8 max-w-md mx-auto">
              We are setting up a secure donation system to make it easy for you to support our PTO. Check back soon to contribute!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Student Programs</h3>
              <p className="text-sm text-gray-500">Fund enrichment activities and educational programs</p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 p-6 rounded-xl text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Community Events</h3>
              <p className="text-sm text-gray-500">Support family events and community gatherings</p>
            </div>
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 rounded-xl text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Heart className="h-6 w-6 text-secondary" fill="currentColor" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Teacher Support</h3>
              <p className="text-sm text-gray-500">Provide resources and supplies for classrooms</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6 md:p-8 text-center">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Every Contribution Matters</h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Whether big or small, every donation helps us create memorable experiences and support our amazing students and teachers.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">Tax Deductible</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">100% Goes to PTO</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
