'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, ArrowRight, Mail, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)

  // Get parameters from URL
  const type = searchParams.get('type') || 'signup'
  const redirectTo = searchParams.get('redirect') || '/login'

  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(redirectTo)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, redirectTo])

  // Content based on type
  const content = {
    signup: {
      title: 'Check Your Email!',
      message: 'Account created successfully - One more step!',
      description: 'We\'ve sent a confirmation email to verify your account. Please check your inbox (and spam folder) for an email from Centner Academy PTO.',
      icon: '📧',
      nextStep: 'Click the confirmation link in the email to activate your account, then sign in to access all PTO features, events, and community updates.',
    },
    'email-verified': {
      title: 'Email Verified Successfully!',
      message: 'Your account is now active',
      description: 'Welcome to the Centner Academy PTO community! Your email has been verified and your account is ready to use.',
      icon: '✅',
      nextStep: 'You can now sign in to access all PTO features, stay updated on events, volunteer for activities, and connect with other families.',
    },
    contact: {
      title: 'Message Sent!',
      message: 'We\'ve received your message.',
      description: 'Thank you for reaching out! We\'ll get back to you as soon as possible.',
      icon: '📧',
      nextStep: 'You can expect a response within 24-48 hours.',
    },
    volunteer: {
      title: 'Thank You for Volunteering!',
      message: 'Your volunteer application has been submitted.',
      description: 'We appreciate your willingness to help our community!',
      icon: '❤️',
      nextStep: 'A coordinator will contact you soon with more details.',
    },
  }

  const currentContent = content[type as keyof typeof content] || content.signup

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating sparkles */}
      <motion.div
        className="absolute top-20 left-20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles className="w-8 h-8 text-yellow-500" />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-20"
        animate={{
          y: [0, 20, 0],
          rotate: [360, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles className="w-8 h-8 text-pink-500" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Success Icon */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                className="inline-block"
              >
                <div className="bg-white rounded-full p-4 shadow-xl">
                  <CheckCircle2 className="w-16 h-16 text-green-500" strokeWidth={2.5} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {currentContent.icon} {currentContent.title}
                </h1>
                <p className="text-white/90 text-lg">
                  {currentContent.message}
                </p>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-8 sm:p-12 space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-4 text-center"
              >
                <p className="text-lg text-gray-700">
                  {currentContent.description}
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 text-left">
                      {currentContent.nextStep}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Countdown & Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    Redirecting in <span className="font-bold text-primary text-lg">{countdown}</span> seconds...
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href={redirectTo} className="flex-1 sm:flex-none">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        <LogIn className="mr-2 h-5 w-5" />
                        Continue Now
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>

                    <Link href="/" className="flex-1 sm:flex-none">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600">
              Need help? Contact us at{' '}
              <a href="mailto:info@centnerpto.org" className="text-primary hover:underline font-medium">
                info@centnerpto.org
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
