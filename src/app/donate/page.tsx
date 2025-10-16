import { Metadata } from 'next'
import { Heart, Users, Sparkles, GraduationCap, Palette, Bus, Trophy, Rocket } from 'lucide-react'
import DonationForm from '@/components/donations/DonationForm'

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Centner Academy PTO and help us make a difference in our students\' education',
}

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
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

          {/* Impact Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              Your Impact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-200">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Rocket className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">STEM Programs</h3>
                <p className="text-sm text-gray-600">
                  Fund robotics, coding, and science labs that inspire future innovators
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 rounded-xl border border-purple-200">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Arts & Music</h3>
                <p className="text-sm text-gray-600">
                  Support art supplies, musical instruments, and creative expression
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-xl border border-green-200">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Bus className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Field Trips</h3>
                <p className="text-sm text-gray-600">
                  Enable educational adventures and real-world learning experiences
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 rounded-xl border border-orange-200">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <GraduationCap className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Teacher Support</h3>
                <p className="text-sm text-gray-600">
                  Provide classroom supplies and professional development resources
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 p-6 rounded-xl border border-pink-200">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Trophy className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Playground</h3>
                <p className="text-sm text-gray-600">
                  Upgrade play equipment and create safe, fun outdoor spaces
                </p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-6 rounded-xl border border-indigo-200">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Community Events</h3>
                <p className="text-sm text-gray-600">
                  Host family gatherings, celebrations, and community-building activities
                </p>
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <DonationForm />

          {/* Trust Badges */}
          <div className="mt-12 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6 md:p-8 text-center">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Every Contribution Matters</h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Whether big or small, every donation helps us create memorable experiences and support our amazing students and teachers.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">Tax Deductible</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">100% Goes to PTO</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">Secure Payments</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">Powered by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
