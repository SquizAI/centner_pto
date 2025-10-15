'use client';

/**
 * Instagram Import Component
 * Fetch and import Instagram posts into photo gallery
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { importPosts } from '@/app/actions/social-media-actions';

interface Connection {
  id: string;
  account_name: string;
  account_username?: string;
}

interface Album {
  id: string;
  title: string;
  slug: string;
  campus: string;
  event_date?: string;
}

interface InstagramPost {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
  isImported?: boolean;
  like_count?: number;
  comments_count?: number;
}

interface Props {
  connections: Connection[];
  albums: Album[];
}

export default function InstagramImport({ connections, albums }: Props) {
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPosts = async () => {
    if (!selectedConnection) return;

    setLoading(true);
    setMessage(null);
    setPosts([]);
    setSelectedPosts(new Set());

    try {
      const response = await fetch(
        `/api/social-media/instagram/posts?connectionId=${selectedConnection}&limit=50`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      setPosts(data.posts || []);
      setMessage({ type: 'success', text: `Loaded ${data.posts.length} posts` });
    } catch (error) {
      console.error('Error fetching posts:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to fetch posts',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePost = (postId: string) => {
    setSelectedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const availablePosts = posts.filter((p) => !p.isImported);
    setSelectedPosts(new Set(availablePosts.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedPosts(new Set());
  };

  const handleImport = async () => {
    if (!selectedAlbum || selectedPosts.size === 0) return;

    setImporting(true);
    setProgress(0);
    setMessage(null);

    const postsToImport = posts
      .filter((p) => selectedPosts.has(p.id))
      .map((p) => ({
        id: p.id,
        media_url: p.media_url,
        caption: p.caption,
        timestamp: p.timestamp,
        permalink: p.permalink,
        metadata: {
          media_type: p.media_type,
          like_count: p.like_count,
          comments_count: p.comments_count,
        },
      }));

    try {
      const result = await importPosts({
        connectionId: selectedConnection,
        albumId: selectedAlbum,
        posts: postsToImport,
      });

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully imported ${result.imported} photo(s)${
            result.failed ? `. ${result.failed} failed.` : ''
          }`,
        });

        // Mark imported posts
        setPosts((prev) =>
          prev.map((p) =>
            selectedPosts.has(p.id) ? { ...p, isImported: true } : p
          )
        );
        setSelectedPosts(new Set());
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Import failed',
        });
      }
    } catch (error) {
      console.error('Error importing posts:', error);
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      });
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import from Instagram</CardTitle>
          <CardDescription>
            Select an account and album, then choose photos to import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Instagram Account</label>
            <Select value={selectedConnection} onValueChange={setSelectedConnection}>
              <SelectTrigger>
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((conn) => (
                  <SelectItem key={conn.id} value={conn.id}>
                    {conn.account_name} {conn.account_username && `(@${conn.account_username})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Album Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Album</label>
            <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
              <SelectTrigger>
                <SelectValue placeholder="Select an album" />
              </SelectTrigger>
              <SelectContent>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.title} ({album.campus})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fetch Button */}
          <Button
            onClick={fetchPosts}
            disabled={!selectedConnection || loading}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Fetch Posts'}
          </Button>
        </CardContent>
      </Card>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {posts.length > 0 && (
        <>
          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All Available
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedPosts.size} selected
              </span>
            </div>
            <Button
              onClick={handleImport}
              disabled={!selectedAlbum || selectedPosts.size === 0 || importing}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {importing ? 'Importing...' : `Import ${selectedPosts.size} Photo(s)`}
            </Button>
          </div>

          {/* Import Progress */}
          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Importing photos...
              </p>
            </div>
          )}

          {/* Posts Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden ${
                  selectedPosts.has(post.id) ? 'border-primary' : 'border-transparent'
                } ${post.isImported ? 'opacity-50' : ''}`}
                onClick={() => !post.isImported && togglePost(post.id)}
              >
                <img
                  src={post.thumbnail_url || post.media_url}
                  alt={post.caption || 'Instagram post'}
                  className="w-full aspect-square object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                  <p className="text-white text-xs line-clamp-3">
                    {post.caption || 'No caption'}
                  </p>
                </div>

                {/* Selection Checkbox */}
                {!post.isImported && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox checked={selectedPosts.has(post.id)} />
                  </div>
                )}

                {/* Imported Badge */}
                {post.isImported && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Imported
                    </Badge>
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="flex items-center gap-2 text-white text-xs">
                    {post.like_count !== undefined && <span>♥ {post.like_count}</span>}
                    {post.comments_count !== undefined && <span>💬 {post.comments_count}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
