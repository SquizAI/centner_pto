'use client';

/**
 * Post Selector Component
 * Reusable grid component for selecting social media posts/photos
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Heart, MessageCircle, ThumbsUp } from 'lucide-react';

interface Post {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  isImported?: boolean;
  likes?: number;
  comments?: number;
  timestamp?: string;
}

interface Props {
  posts: Post[];
  selectedPosts: Set<string>;
  onToggle: (postId: string) => void;
  platform: 'instagram' | 'facebook';
}

export default function PostSelector({ posts, selectedPosts, onToggle, platform }: Props) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No posts available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isSelected={selectedPosts.has(post.id)}
          onToggle={onToggle}
          platform={platform}
        />
      ))}
    </div>
  );
}

function PostCard({
  post,
  isSelected,
  onToggle,
  platform,
}: {
  post: Post;
  isSelected: boolean;
  onToggle: (postId: string) => void;
  platform: 'instagram' | 'facebook';
}) {
  const imageUrl = post.thumbnailUrl || post.imageUrl;
  const isDisabled = post.isImported;

  return (
    <div
      className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}`}
      onClick={() => !isDisabled && onToggle(post.id)}
    >
      {/* Image */}
      <div className="aspect-square relative bg-muted">
        <img
          src={imageUrl}
          alt={post.caption || 'Social media post'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Caption Overlay (on hover) */}
      {post.caption && (
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
          <p className="text-white text-xs line-clamp-4">{post.caption}</p>
        </div>
      )}

      {/* Selection Checkbox */}
      {!isDisabled && (
        <div className="absolute top-2 left-2 z-10 bg-white rounded-md shadow-sm">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(post.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Imported Badge */}
      {isDisabled && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="h-3 w-3" />
            Imported
          </Badge>
        </div>
      )}

      {/* Engagement Stats */}
      {!isDisabled && (post.likes !== undefined || post.comments !== undefined) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-2">
          <div className="flex items-center gap-3 text-white text-xs font-medium">
            {post.likes !== undefined && post.likes > 0 && (
              <div className="flex items-center gap-1">
                {platform === 'instagram' ? (
                  <Heart className="h-3 w-3" />
                ) : (
                  <ThumbsUp className="h-3 w-3" />
                )}
                <span>{formatNumber(post.likes)}</span>
              </div>
            )}
            {post.comments !== undefined && post.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{formatNumber(post.comments)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date Badge */}
      {post.timestamp && !isDisabled && (
        <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {formatDate(post.timestamp)}
        </div>
      )}
    </div>
  );
}

// Utility functions
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}w ago`;
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}mo ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
