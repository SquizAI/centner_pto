'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

import { AlbumCard, AlbumCardSkeleton } from './AlbumCard';
import { cn } from '@/lib/utils';
import { AlbumWithStats } from '@/types/gallery.types';

interface AlbumGridProps {
  albums: AlbumWithStats[];
  className?: string;
  loading?: boolean;
}

export function AlbumGrid({ albums, className, loading = false }: AlbumGridProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <AlbumCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'flex flex-col items-center justify-center py-16 px-4',
          className
        )}
      >
        <div className="text-center max-w-md">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            No Albums Found
          </h3>
          <p className="text-muted-foreground">
            There are no photo albums to display at this time. Check back soon for
            new event photos!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {albums.map((album, index) => (
        <AlbumCard key={album.id} album={album} priority={index < 3} />
      ))}
    </div>
  );
}

// Container variant for staggered animation
export function AlbumGridAnimated({ albums, className }: AlbumGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  if (albums.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'flex flex-col items-center justify-center py-16 px-4',
          className
        )}
      >
        <div className="text-center max-w-md">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            No Albums Found
          </h3>
          <p className="text-muted-foreground">
            There are no photo albums to display at this time. Check back soon for
            new event photos!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {albums.map((album, index) => (
        <motion.div key={album.id} variants={itemVariants}>
          <AlbumCard album={album} priority={index < 3} />
        </motion.div>
      ))}
    </motion.div>
  );
}
