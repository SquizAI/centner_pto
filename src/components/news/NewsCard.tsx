'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { NewsPost, CAMPUS_CONFIG, Campus } from '@/types/news.types';

interface NewsCardProps {
  post: NewsPost;
  className?: string;
  priority?: boolean;
}

export function NewsCard({ post, className, priority = false }: NewsCardProps) {
  const campusConfig = CAMPUS_CONFIG[post.campus as Campus];
  const publishDate = post.publish_date ? new Date(post.publish_date) : new Date(post.created_at || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={cn('h-full', className)}
    >
      <Link href={`/news/${post.slug}`} className="block h-full">
        <Card className="h-full overflow-hidden transition-shadow duration-300 hover:shadow-lg">
          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <Image
                src={post.featured_image_url}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
              />

              {/* Campus Badge Overlay */}
              <div className="absolute top-3 left-3">
                <Badge
                  className={cn(
                    'font-semibold shadow-md',
                    campusConfig.bgColor,
                    campusConfig.textColor,
                    'border-none'
                  )}
                >
                  {campusConfig.label}
                </Badge>
              </div>
            </div>
          )}

          <CardHeader className="space-y-2">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <time dateTime={publishDate.toISOString()}>
                {format(publishDate, 'MMMM d, yyyy')}
              </time>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold leading-tight tracking-tight line-clamp-2 hover:text-primary transition-colors">
              {post.title}
            </h3>
          </CardHeader>

          <CardContent>
            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-start gap-3">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2" role="list" aria-label="Article tags">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs font-normal"
                    role="listitem"
                  >
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    +{post.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Read More Link */}
            <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
              <span>Read More</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

// Export a skeleton loading state for better UX
export function NewsCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <div className="aspect-video w-full bg-muted animate-pulse" />
      <CardHeader className="space-y-2">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-6 w-full bg-muted animate-pulse rounded" />
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
}
