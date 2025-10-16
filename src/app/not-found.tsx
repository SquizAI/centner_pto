'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: string; delay: number; size: number; color: string }>>([])

  useEffect(() => {
    // Generate confetti pieces
    const colors = ['#23ABE3', '#EC4E88', '#FC6F24', '#57BAEB', '#8DC916']
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 3,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setConfetti(pieces)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute animate-confetti"
            style={{
              left: piece.left,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
              animationDelay: `${piece.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          {/* 404 Number with Float Animation */}
          <motion.div
            className="mb-8 animate-float"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-[150px] sm:text-[200px] md:text-[250px] font-black leading-none bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
              404
            </h1>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-4 mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800">
                Oops! Page Not Found
              </h2>
              <Sparkles className="w-8 h-8 text-pink-500 animate-pulse" />
            </div>

            <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto">
              Looks like this page took a field trip without permission!
              Don't worry, we'll help you get back on track.
            </p>
          </motion.div>

          {/* Fun Facts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/20"
          >
            <p className="text-sm text-gray-600 italic">
              Fun fact: Did you know? The first website ever created is still online!
              But sadly, this page isn't one of them.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 group h-12 px-8"
              >
                <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Back to Home
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              onClick={() => window.history.back()}
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 group h-12 px-8"
            >
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Button>
          </motion.div>

          {/* Search Suggestion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-12"
          >
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Try searching or check out our navigation menu
            </p>
          </motion.div>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 left-10 hidden lg:block">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-6xl"
          >
            🎈
          </motion.div>
        </div>

        <div className="absolute top-20 right-10 hidden lg:block">
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-6xl"
          >
            🎨
          </motion.div>
        </div>

        <div className="absolute bottom-20 right-20 hidden lg:block">
          <motion.div
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-6xl"
          >
            📚
          </motion.div>
        </div>
      </div>
    </div>
  )
}
