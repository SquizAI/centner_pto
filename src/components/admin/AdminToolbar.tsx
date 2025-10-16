'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ChevronUp,
  ChevronDown,
  Edit,
  Calendar,
  Image,
  FileText,
  Users,
  Settings,
  Share2,
  PlusCircle,
  LayoutDashboard,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminToolbarProps {
  userRole: 'admin' | 'super_admin';
}

export function AdminToolbar({ userRole }: AdminToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Don't show toolbar on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Determine context-specific actions based on current page
  const getContextActions = () => {
    // Events page
    if (pathname.startsWith('/events') || pathname.startsWith('/calendar')) {
      return [
        {
          label: 'Manage Events',
          icon: Calendar,
          href: '/admin/events',
          color: 'text-purple-600',
        },
        {
          label: 'Create Event',
          icon: PlusCircle,
          href: '/admin/events/create',
          color: 'text-green-600',
        },
      ];
    }

    // Gallery page
    if (pathname.startsWith('/gallery') || pathname.startsWith('/photos')) {
      return [
        {
          label: 'Manage Gallery',
          icon: Image,
          href: '/admin/gallery',
          color: 'text-amber-600',
        },
        {
          label: 'Social Media',
          icon: Share2,
          href: '/admin/social-media',
          color: 'text-blue-600',
        },
      ];
    }

    // News page
    if (pathname.startsWith('/news')) {
      return [
        {
          label: 'Manage News',
          icon: FileText,
          href: '/admin/news',
          color: 'text-indigo-600',
        },
        {
          label: 'Create Article',
          icon: PlusCircle,
          href: '/admin/news/create',
          color: 'text-green-600',
        },
      ];
    }

    // Volunteer page
    if (pathname.startsWith('/volunteer')) {
      return [
        {
          label: 'Manage Volunteers',
          icon: Users,
          href: '/admin/volunteer',
          color: 'text-emerald-600',
        },
        {
          label: 'Create Opportunity',
          icon: PlusCircle,
          href: '/admin/volunteer/create',
          color: 'text-green-600',
        },
      ];
    }

    // Default actions for other pages
    return [
      {
        label: 'Admin Dashboard',
        icon: LayoutDashboard,
        href: '/admin',
        color: 'text-primary',
      },
      {
        label: 'Settings',
        icon: Settings,
        href: '/admin/settings',
        color: 'text-gray-600',
      },
    ];
  };

  const contextActions = getContextActions();

  if (!isVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <Shield className="h-5 w-5" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      >
        <div className="container mx-auto px-4 pb-4">
          <div className="ml-auto max-w-4xl pointer-events-auto">
            <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground rounded-t-xl shadow-2xl border border-primary/20">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-primary-foreground/10">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold">Admin Toolbar</span>
                  <Badge variant="secondary" className="text-xs">
                    {userRole === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    className="h-8 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {/* Context Actions */}
                      <div>
                        <p className="text-sm font-medium mb-3 text-primary-foreground/80">
                          Quick Actions for This Page
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {contextActions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <Link key={action.href} href={action.href}>
                                <Button
                                  variant="secondary"
                                  className="w-full justify-start gap-2 h-auto py-3"
                                >
                                  <Icon className={cn('h-4 w-4', action.color)} />
                                  <span className="text-sm">{action.label}</span>
                                </Button>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      <div className="h-px bg-primary-foreground/10" />

                      {/* Global Admin Links */}
                      <div>
                        <p className="text-sm font-medium mb-3 text-primary-foreground/80">
                          Admin Portal
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          <Link href="/admin">
                            <Button
                              variant="ghost"
                              className="w-full flex-col gap-1 h-auto py-2 text-primary-foreground hover:bg-primary-foreground/10"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              <span className="text-xs">Dashboard</span>
                            </Button>
                          </Link>
                          <Link href="/admin/events">
                            <Button
                              variant="ghost"
                              className="w-full flex-col gap-1 h-auto py-2 text-primary-foreground hover:bg-primary-foreground/10"
                            >
                              <Calendar className="h-4 w-4" />
                              <span className="text-xs">Events</span>
                            </Button>
                          </Link>
                          <Link href="/admin/gallery">
                            <Button
                              variant="ghost"
                              className="w-full flex-col gap-1 h-auto py-2 text-primary-foreground hover:bg-primary-foreground/10"
                            >
                              <Image className="h-4 w-4" />
                              <span className="text-xs">Gallery</span>
                            </Button>
                          </Link>
                          <Link href="/admin/news">
                            <Button
                              variant="ghost"
                              className="w-full flex-col gap-1 h-auto py-2 text-primary-foreground hover:bg-primary-foreground/10"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="text-xs">News</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
