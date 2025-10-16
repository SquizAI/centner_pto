'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signUp, signInWithOAuth } from '@/app/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaFacebook, FaGoogle } from 'react-icons/fa'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'

export default function SignupForm() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const result = await signUp(email, password, fullName)

      if (!result.success) {
        setError(result.error || 'Signup failed')
        setIsLoading(false)
      } else {
        router.push('/success?type=signup&redirect=/login')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setError(null)
    setOauthLoading(provider)
    try {
      await signInWithOAuth(provider, '/dashboard')
    } catch (err) {
      setError(`Failed to sign up with ${provider}`)
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Section (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary via-accent to-[hsl(var(--bright-green))] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        {/* Animated Blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            {/* Bee Logo */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/centner-bee.png"
                alt="Centner Academy"
                width={120}
                height={120}
                priority
                className="mx-auto drop-shadow-2xl"
              />
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">
                Join Our Community
              </h1>
              <p className="text-xl text-white/90 max-w-md">
                Together we support excellence in education and build lasting connections
              </p>
            </div>

            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Empowering Families, Enriching Education</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/centner-bee.png"
              alt="Centner Academy"
              width={80}
              height={80}
              priority
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join the Centner Academy PTO community</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">Get started with your free account</p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-11 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-11 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="pl-10 h-11 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pt-2"
                >
                  <PasswordStrengthIndicator password={password} />
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="pl-10 h-11 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-sm hover:shadow transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-4 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading || oauthLoading !== null}
              className="h-11 bg-white border-gray-300 hover:bg-gray-50"
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
                  Google
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('facebook')}
              disabled={isLoading || oauthLoading !== null}
              className="h-11 bg-white border-gray-300 hover:bg-gray-50"
            >
              {oauthLoading === 'facebook' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <FaFacebook className="mr-2 h-4 w-4 text-blue-600" />
                  Facebook
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
