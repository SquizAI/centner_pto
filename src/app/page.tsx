'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar, Heart, Users, Camera, Newspaper, HandHeart,
  GraduationCap, Baby, BookOpen, Sparkles, TrendingUp,
  Gift, MessageCircle, Award, PartyPopper
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Centner Academy Vibrant Style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[hsl(var(--light-blue))] to-[hsl(var(--teal-blue))] py-20 sm:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        {/* Floating Bumblebee Mascot */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute left-4 sm:left-10 lg:left-20 top-1/2 -translate-y-1/2 hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/centner-bee.png"
              alt="Centner Academy Bumblebee"
              width={180}
              height={180}
              className="drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Welcome to Our Community
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6"
            >
              Centner Academy
              <span className="block mt-2 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                PTO
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl sm:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Cultivating Leaders with Heart • Building Community • Supporting Excellence
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl text-lg px-8 py-6 h-auto">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Events
              </Button>
              <Button size="lg" className="bg-white/10 text-white border-2 border-white hover:bg-white hover:text-primary backdrop-blur-md text-lg px-8 py-6 h-auto font-semibold">
                <HandHeart className="w-5 h-5 mr-2" />
                Get Involved
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Vibrant accent shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </section>

      {/* Featured Section */}
      <section className="py-16 sm:py-24 bg-muted/30 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Badge className="mb-4 bg-secondary text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              What's Happening
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Featured Events & News
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Stay connected with the latest happenings in our community
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
          >
            {/* Large Featured Card */}
            <motion.div variants={fadeInUp}>
              <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full bg-gradient-to-br from-primary to-[hsl(var(--teal-blue))]">
                <CardHeader className="relative h-64 p-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500"></div>
                  <Badge className="absolute top-4 right-4 z-20 bg-secondary text-secondary-foreground border-0">
                    <PartyPopper className="w-3 h-3 mr-1" />
                    Featured Event
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 text-white">
                  <CardTitle className="text-2xl mb-2">Fall Festival 2025</CardTitle>
                  <CardDescription className="text-white/80 mb-4">
                    Join us for an amazing day of fun, games, food, and community celebration!
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Oct 25, 2025
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      All Ages
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Smaller Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full bg-white">
                  <CardHeader>
                    <div className="w-12 h-12 bg-[hsl(var(--teal-blue))] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Newspaper className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Latest Newsletter</CardTitle>
                    <CardDescription>
                      October 2025 edition now available
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full bg-white">
                  <CardHeader>
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Teacher Appreciation</CardTitle>
                    <CardDescription>
                      Help us celebrate our amazing teachers
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full bg-white">
                  <CardHeader>
                    <div className="w-12 h-12 bg-[hsl(var(--bright-green))] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Fundraising Goals</CardTitle>
                    <CardDescription>
                      We're 75% of the way to our goal!
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full bg-white">
                  <CardHeader>
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Join the Conversation</CardTitle>
                    <CardDescription>
                      Connect with other parents
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Campus Sections - Using Campus-specific Colors */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-[hsl(var(--bright-green))] text-white">
              Our Community
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Campuses</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Supporting students across all levels of Centner Academy
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Preschool - Purple */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden border-2 border-transparent hover:border-[hsl(var(--preschool))] shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
                <div className="absolute inset-0 bg-[hsl(var(--preschool))] opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="w-20 h-20 bg-[hsl(var(--preschool))] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Baby className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    Preschool
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Building foundations for lifelong learning through play, exploration, and nurturing care.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Button variant="outline" className="w-full group-hover:bg-[hsl(var(--preschool))] group-hover:text-white group-hover:border-[hsl(var(--preschool))] transition-colors">
                    Learn more →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Elementary - Blue */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden border-2 border-transparent hover:border-[hsl(var(--elementary))] shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
                <div className="absolute inset-0 bg-[hsl(var(--elementary))] opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="w-20 h-20 bg-[hsl(var(--elementary))] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    Elementary
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Nurturing curiosity and creativity while developing strong academic and social skills.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Button variant="outline" className="w-full group-hover:bg-[hsl(var(--elementary))] group-hover:text-white group-hover:border-[hsl(var(--elementary))] transition-colors">
                    Learn more →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Middle/High School - Orange/Gold */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden border-2 border-transparent hover:border-[hsl(var(--middle-high))] shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
                <div className="absolute inset-0 bg-[hsl(var(--middle-high))] opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="w-20 h-20 bg-[hsl(var(--middle-high))] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    Middle/High School
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Preparing leaders for tomorrow with advanced academics and real-world experiences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Button variant="outline" className="w-full group-hover:bg-[hsl(var(--middle-high))] group-hover:text-white group-hover:border-[hsl(var(--middle-high))] transition-colors">
                    Learn more →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Vibrant Centner Style */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-secondary via-accent to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        {/* Bumblebee Mascot - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="absolute right-4 sm:right-10 lg:right-20 top-1/2 -translate-y-1/2 hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/centner-bee.png"
              alt="Centner Academy Bumblebee"
              width={160}
              height={160}
              className="drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Support Our Mission
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Your donations help us create amazing experiences and opportunities for all Centner Academy students
            </p>
            <Button size="lg" className="bg-white hover:bg-white/90 text-accent shadow-2xl text-lg px-8 py-6 h-auto font-bold">
              <Heart className="w-5 h-5 mr-2" />
              Make a Donation
            </Button>
          </motion.div>
        </div>

        {/* Accent shapes */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/centner-bee.png"
                  alt="Centner Bumblebee"
                  width={60}
                  height={60}
                  className="drop-shadow-lg"
                />
                <h3 className="text-lg font-semibold">Centner Academy PTO</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Building community and supporting excellence in education
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/events" className="text-slate-400 hover:text-primary transition-colors">Events</Link></li>
                <li><Link href="/volunteer" className="text-slate-400 hover:text-primary transition-colors">Volunteer</Link></li>
                <li><Link href="/donate" className="text-slate-400 hover:text-accent transition-colors">Donate</Link></li>
                <li><Link href="/photos" className="text-slate-400 hover:text-primary transition-colors">Photo Gallery</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-slate-400 hover:text-primary transition-colors">About PTO</Link></li>
                <li><Link href="/news" className="text-slate-400 hover:text-primary transition-colors">News & Updates</Link></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-primary transition-colors">Contact Us</Link></li>
                <li><a href="https://centneracademy.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">Centner Academy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} Centner Academy PTO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
