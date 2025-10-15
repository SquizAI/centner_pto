'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, Home, ChevronRight, Share2, Facebook, Twitter, Mail } from 'lucide-react';
import { format } from 'date-fns';
import DOMPurify from 'isomorphic-dompurify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NewsPost, CAMPUS_CONFIG, Campus } from '@/types/news.types';

interface BlogPostContentProps {
  post: NewsPost;
  authorName?: string;
  className?: string;
}

export function BlogPostContent({ post, authorName = 'Centner PTO', className }: BlogPostContentProps) {
  const campusConfig = CAMPUS_CONFIG[post.campus as Campus];
  const publishDate = post.publish_date ? new Date(post.publish_date) : new Date(post.created_at || '');
  const [shareOpen, setShareOpen] = React.useState(false);

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = React.useMemo(() => {
    return DOMPurify.sanitize(post.content, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 'strike',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
    });
  }, [post.content]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post.title;

  const handleShare = (platform: 'facebook' | 'twitter' | 'email') => {
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`;
        break;
    }

    if (url) {
      window.open(url, platform === 'email' ? '_self' : '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article className={cn('mx-auto max-w-4xl', className)}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/"
              className="flex items-center hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
          </li>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <li>
            <Link
              href="/news"
              className="hover:text-foreground transition-colors"
            >
              News
            </Link>
          </li>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <li className="text-foreground font-medium truncate" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      {/* Hero Image */}
      {post.featured_image_url && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl shadow-xl"
        >
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </motion.div>
      )}

      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 space-y-4"
      >
        {/* Campus Badge */}
        <Badge
          className={cn(
            'text-sm font-semibold',
            campusConfig.bgColor,
            campusConfig.textColor,
            'border-none'
          )}
        >
          {campusConfig.label}
        </Badge>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" aria-hidden="true" />
            <span>By <span className="font-medium text-foreground">{authorName}</span></span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <time dateTime={publishDate.toISOString()}>
              {format(publishDate, 'MMMM d, yyyy')}
            </time>
          </div>

          {/* Share Button */}
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(!shareOpen)}
              aria-expanded={shareOpen}
              aria-label="Share article"
            >
              <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Share
            </Button>
          </div>
        </div>

        {/* Share Options */}
        {shareOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 border rounded-lg p-4 bg-muted/50"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('facebook')}
              aria-label="Share on Facebook"
            >
              <Facebook className="h-4 w-4 mr-2" aria-hidden="true" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
              aria-label="Share on Twitter"
            >
              <Twitter className="h-4 w-4 mr-2" aria-hidden="true" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('email')}
              aria-label="Share via Email"
            >
              <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
              Email
            </Button>
          </motion.div>
        )}
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="prose prose-lg max-w-none mb-12"
      >
        {/* Sanitized HTML content rendered safely */}
        <div
          className="
            [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:tracking-tight
            [&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3
            [&>h4]:text-xl [&>h4]:font-semibold [&>h4]:mt-6 [&>h4]:mb-2
            [&>p]:text-base [&>p]:leading-relaxed [&>p]:mb-4 [&>p]:text-foreground/90
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul]:space-y-2
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol]:space-y-2
            [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6
            [&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:mb-4
            [&>code]:bg-muted [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm
            [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary/80
            [&>img]:rounded-lg [&>img]:my-6
          "
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </motion.div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border-t pt-6"
        >
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Article tags">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-sm font-normal"
                role="listitem"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </motion.footer>
      )}

      {/* Back to News Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-12 border-t pt-6"
      >
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" aria-hidden="true" />
          Back to all news
        </Link>
      </motion.div>
    </article>
  );
}

// Loading skeleton for blog post content
export function BlogPostContentSkeleton() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </div>

      {/* Hero image skeleton */}
      <div className="aspect-video w-full bg-muted animate-pulse rounded-2xl mb-8" />

      {/* Header skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-6 w-32 bg-muted animate-pulse rounded-full" />
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="h-12 w-3/4 bg-muted animate-pulse rounded" />
        <div className="flex gap-4 border-b pb-4">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-3 mb-12">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-4 w-full bg-muted animate-pulse rounded" />
        ))}
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
      </div>

      {/* Tags skeleton */}
      <div className="border-t pt-6">
        <div className="h-4 w-16 bg-muted animate-pulse rounded mb-3" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
          <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
          <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
