'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NewsPost, CAMPUS_CONFIG, Campus } from '@/types/news.types';

interface NewsFeaturedProps {
  post: NewsPost;
  className?: string;
}

export function NewsFeatured({ post, className }: NewsFeaturedProps) {
  const campusConfig = CAMPUS_CONFIG[post.campus as Campus];
  const publishDate = post.publish_date ? new Date(post.publish_date) : new Date(post.created_at || '');

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={cn('relative overflow-hidden rounded-3xl', className)}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {post.featured_image_url && (
          <Image
            src={post.featured_image_url}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
            aria-hidden="true"
          />
        )}
        {/* Gradient Overlay - stronger for better text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: post.featured_image_url
              ? 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.4) 100%)'
              : campusConfig.color,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-16 md:px-12 md:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Campus Badge */}
            <div>
              <Badge
                className={cn(
                  'text-sm font-semibold shadow-lg backdrop-blur-sm',
                  campusConfig.bgColor,
                  campusConfig.textColor,
                  'border-none'
                )}
              >
                {campusConfig.label}
              </Badge>
            </div>

            {/* Featured Label */}
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Featured Story
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              {post.title}
            </h2>

            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <time dateTime={publishDate.toISOString()}>
                {format(publishDate, 'MMMM d, yyyy')}
              </time>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* CTA Button */}
            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="group bg-white text-foreground hover:bg-white/90 shadow-xl transition-all duration-300"
              >
                <Link
                  href={`/news/${post.slug}`}
                  className="inline-flex items-center gap-2"
                >
                  Read Full Story
                  <ArrowRight
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4" role="list" aria-label="Article tags">
                {post.tags.slice(0, 4).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-sm font-normal bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
                    role="listitem"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
    </motion.section>
  );
}

// Skeleton loading state for featured news
export function NewsFeaturedSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-muted">
      <div className="px-6 py-16 md:px-12 md:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-8 w-32 bg-muted-foreground/20 animate-pulse rounded-full" />
          <div className="h-8 w-40 bg-muted-foreground/20 animate-pulse rounded-full" />
          <div className="space-y-4">
            <div className="h-16 w-full bg-muted-foreground/20 animate-pulse rounded" />
            <div className="h-16 w-4/5 bg-muted-foreground/20 animate-pulse rounded" />
          </div>
          <div className="h-6 w-48 bg-muted-foreground/20 animate-pulse rounded" />
          <div className="space-y-3">
            <div className="h-6 w-full bg-muted-foreground/20 animate-pulse rounded" />
            <div className="h-6 w-full bg-muted-foreground/20 animate-pulse rounded" />
            <div className="h-6 w-3/4 bg-muted-foreground/20 animate-pulse rounded" />
          </div>
          <div className="h-12 w-48 bg-muted-foreground/20 animate-pulse rounded-lg" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-muted-foreground/20 animate-pulse rounded-full" />
            <div className="h-8 w-24 bg-muted-foreground/20 animate-pulse rounded-full" />
            <div className="h-8 w-16 bg-muted-foreground/20 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
