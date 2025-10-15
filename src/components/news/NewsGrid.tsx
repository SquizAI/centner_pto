'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

import { NewsCard, NewsCardSkeleton } from './NewsCard';
import { cn } from '@/lib/utils';
import { NewsPost } from '@/types/news.types';

interface NewsGridProps {
  posts: NewsPost[];
  className?: string;
  columns?: 1 | 2 | 3;
}

export function NewsGrid({ posts, className, columns = 3 }: NewsGridProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }[columns];

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No news posts available at this time.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('grid gap-6', gridClass, className)}
    >
      {posts.map((post, index) => (
        <NewsCard
          key={post.id}
          post={post}
          priority={index < 3} // Prioritize loading first 3 images
        />
      ))}
    </motion.div>
  );
}

// Loading skeleton for news grid
interface NewsGridSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function NewsGridSkeleton({ count = 6, columns = 3, className }: NewsGridSkeletonProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }[columns];

  return (
    <div className={cn('grid gap-6', gridClass, className)}>
      {[...Array(count)].map((_, index) => (
        <NewsCardSkeleton key={index} />
      ))}
    </div>
  );
}
