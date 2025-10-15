'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Images } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlbumWithStats,
  GALLERY_CAMPUS_CONFIG,
  GalleryCampus,
} from '@/types/gallery.types';

interface AlbumCardProps {
  album: AlbumWithStats;
  className?: string;
  priority?: boolean;
}

export function AlbumCard({ album, className, priority = false }: AlbumCardProps) {
  const campusConfig = GALLERY_CAMPUS_CONFIG[album.campus as GalleryCampus];
  const eventDate = album.event_date ? new Date(album.event_date) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={cn('h-full', className)}
    >
      <Link href={`/gallery/${album.slug}`} className="block h-full">
        <Card className="h-full overflow-hidden transition-shadow duration-300 hover:shadow-lg group">
          {/* Cover Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            {album.cover_photo_url ? (
              <Image
                src={album.cover_photo_url}
                alt={album.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Images className="h-16 w-16 text-muted-foreground/30" aria-hidden="true" />
              </div>
            )}

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

            {/* Photo Count Badge */}
            {album.photo_count > 0 && (
              <div className="absolute bottom-3 right-3">
                <Badge
                  variant="secondary"
                  className="font-semibold shadow-md backdrop-blur-sm bg-background/80 flex items-center gap-1.5"
                >
                  <Images className="h-3.5 w-3.5" aria-hidden="true" />
                  {album.photo_count} {album.photo_count === 1 ? 'photo' : 'photos'}
                </Badge>
              </div>
            )}
          </div>

          <CardHeader className="space-y-2">
            {/* Date */}
            {eventDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <time dateTime={eventDate.toISOString()}>
                  {format(eventDate, 'MMMM d, yyyy')}
                </time>
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
              {album.title}
            </h3>
          </CardHeader>

          {album.description && (
            <CardContent>
              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {album.description}
              </p>
            </CardContent>
          )}

          {album.location && (
            <CardFooter className="pt-2">
              <p className="text-xs text-muted-foreground line-clamp-1">
                <span className="font-medium">Location:</span> {album.location}
              </p>
            </CardFooter>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}

// Export a skeleton loading state for better UX
export function AlbumCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <div className="aspect-[4/3] w-full bg-muted animate-pulse" />
      <CardHeader className="space-y-2">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-6 w-full bg-muted animate-pulse rounded" />
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
