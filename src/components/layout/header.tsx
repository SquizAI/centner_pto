'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src="https://centneracademy.com/wp-content/uploads/2021/02/logo-centner.png"
                alt="Centner Academy"
                width={140}
                height={60}
                priority
                className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <div className="hidden sm:block border-l border-primary/20 pl-3 ml-3 h-10">
              <div className="text-sm font-bold text-primary">PTO</div>
              <div className="text-xs text-muted-foreground">Parent-Teacher Organization</div>
            </div>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/events" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Events
            </Link>
            <Link href="/news" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              News
            </Link>
            <Link href="/volunteer" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Volunteer
            </Link>
            <Link href="/photos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Photos
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/donate">
              <Button size="default" className="hidden sm:flex bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white border-0">
                <Heart className="w-4 h-4 mr-2" />
                Donate
              </Button>
            </Link>
            <Button variant="outline" size="default" className="border-primary text-primary hover:bg-primary hover:text-white">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
