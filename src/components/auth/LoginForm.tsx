'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signIn, signInWithOAuth } from '@/app/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { FaFacebook, FaGoogle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn(email, password, redirectTo)

      if (!result.success) {
        setError(result.error || 'Login failed')
        setIsLoading(false)
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
      await signInWithOAuth(provider, redirectTo)
    } catch (err) {
      setError(`Failed to sign in with ${provider}`)
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Section (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-[hsl(var(--light-blue))] to-[hsl(var(--teal-blue))] relative overflow-hidden">
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
                className="mx-auto drop-shadow-2xl"
              />
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">
                Centner Academy PTO
              </h1>
              <p className="text-xl text-white/90 max-w-md">
                Building community, supporting excellence in education
              </p>
            </div>

            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Cultivating Leaders with Heart</span>
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
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to continue to your dashboard</p>
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
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="pl-10 h-12 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-12 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-[hsl(var(--teal-blue))] hover:from-primary/90 hover:to-[hsl(var(--teal-blue))]/90 shadow-sm hover:shadow transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
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
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
