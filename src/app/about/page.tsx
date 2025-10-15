'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, Heart, Calendar, Target, Sparkles,
  CheckCircle, UserCircle, Video, MapPin, MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const officers = [
    { title: 'President', name: 'Karina Maggioni', icon: '👑' },
    { title: 'Vice-President', name: 'Marica Morelli', icon: '🌟' },
    { title: 'Secretary', name: 'Kiana Lowrance', icon: '📝' },
    { title: 'Front-End Treasurer', name: 'Dania Maida', icon: '💰' },
    { title: 'Back-end Treasurer', name: 'Kristel Diaz', icon: '💼' },
  ]

  const meetings = [
    { date: 'Monday, September 22', time: '8:45am' },
    { date: 'Thursday, December 4', time: '8:45am' },
    { date: 'Thursday, February 5', time: '8:45am' },
    { date: 'Monday, May 18', time: '8:45am' },
  ]

  const roomParentRoles = [
    'Communicate with homeroom teachers and attend PTO meetings',
    'Relay notes and updates back to classroom parents',
    'Volunteer during school events (Tent of Treasure, Book Fair, Staff Appreciation Week)',
    'Promote the school\'s core values and mission',
    'Follow up on parent donations for PTO',
  ]

  const chairpeopleRoles = [
    'Take the lead in creating and executing special PTO supported events',
    'Coordinate with volunteers and manage event logistics',
    'Work closely with PTO officers to achieve annual goals',
    'Foster community engagement across all three campuses',
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[hsl(var(--light-blue))] to-[hsl(var(--teal-blue))] py-16 sm:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Centner Academy PTO
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
              Welcome to Our PTO
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              The Centner Academy Parent Teacher Organization (PTO) is a nonprofit organization dedicated to supporting the school's mission of providing a high-quality education to its students.
            </p>

            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Our work is centered on enhancing the student experience and strengthening the school community. We are a group of parents committed to the health, well-being, and learning of the "whole child," helping to provide students with the experiences and skills they need to become lifelong learners and critical thinkers.
            </p>
          </motion.div>
        </div>

        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </section>

      {/* PTO Officers Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary text-white">
              <Users className="w-4 h-4 mr-2" />
              Leadership Team
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Meet Our PTO Officers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dedicated parents working together to support our school community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officers.map((officer, index) => (
              <motion.div
                key={officer.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full">
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-4xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                      {officer.icon}
                    </div>
                    <CardTitle className="text-xl mb-2">{officer.title}</CardTitle>
                    <CardDescription className="text-lg font-semibold text-foreground">
                      {officer.name}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PTO's Role Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[hsl(var(--teal-blue))] text-white">
                <Target className="w-4 h-4 mr-2" />
                Our Role
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                PTO's Role in Centner Academy
              </h2>
            </div>

            <div className="space-y-6">
              <Card className="border-l-4 border-l-primary shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Separate Entity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The PTO operates as a separate entity from Centner Academy, allowing us to independently support and enhance the educational experience.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-secondary" />
                    Not-for-Profit Organization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The PTO is a not-for-profit organization. All funds raised go directly toward supporting students, teachers, and school programs across all three campuses.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent" />
                    PTO Goals for 2025-2026
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[hsl(var(--bright-green))] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Enhance student experiences through engaging events and activities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[hsl(var(--bright-green))] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Support faculty and staff through appreciation initiatives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[hsl(var(--bright-green))] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Build a stronger community across all three campuses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[hsl(var(--bright-green))] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Promote sustainability through our Bee Green Uniform Program</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meetings Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[hsl(var(--light-blue))] to-[hsl(var(--teal-blue))]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Calendar className="w-4 h-4 mr-2" />
                Meetings
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                School-Wide PTO Meetings
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Meetings are held in the Big Ideas Room and via Zoom. All meetings are open to the PTO and parent community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meetings.map((meeting, index) => (
                <motion.div
                  key={meeting.date}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {meeting.date}
                      </CardTitle>
                      <CardDescription className="text-white/80 text-lg font-semibold">
                        {meeting.time}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Badge className="bg-white/20 text-white border-white/30">
                          <MapPin className="w-3 h-3 mr-1" />
                          In-Person
                        </Badge>
                        <Badge className="bg-white/20 text-white border-white/30">
                          <Video className="w-3 h-3 mr-1" />
                          Zoom
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Room Parents & Chairpeople Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[hsl(var(--bright-green))] text-white">
                <Users className="w-4 h-4 mr-2" />
                Community Support
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                How We Support Our Community
              </h2>
              <p className="text-lg text-muted-foreground">
                Room Parents and Chairpeople play vital roles in making our PTO successful
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Room Parents */}
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <div className="w-16 h-16 bg-[hsl(var(--elementary))] rounded-xl flex items-center justify-center mb-4">
                    <UserCircle className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Room Parents</CardTitle>
                  <CardDescription>The bridge between teachers and families</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {roomParentRoles.map((role, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[hsl(var(--elementary))] mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{role}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Chairpeople */}
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <div className="w-16 h-16 bg-[hsl(var(--middle-high))] rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Chairpeople</CardTitle>
                  <CardDescription>Event leaders and community builders</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {chairpeopleRoles.map((role, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[hsl(var(--middle-high))] mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{role}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-secondary via-accent to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Join Us in Making a Difference
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Whether you want to volunteer at events, join a committee, or support through donations, there's a place for you in our PTO community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white hover:bg-white/90 text-accent shadow-2xl text-lg px-8 py-6 h-auto font-bold">
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
              <Link href="/events">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-accent text-lg px-8 py-6 h-auto font-bold">
                  <Calendar className="w-5 h-5 mr-2" />
                  View Upcoming Events
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
      </section>
    </div>
  )
}
