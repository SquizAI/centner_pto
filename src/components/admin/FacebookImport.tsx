'use client';

/**
 * Facebook Import Component
 * Fetch and import Facebook photos into photo gallery
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
import { Download, Image as ImageIcon, CheckCircle2, ThumbsUp } from 'lucide-react';
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

interface FacebookPhoto {
  id: string;
  created_time: string;
  name?: string;
  link: string;
  images: Array<{
    height: number;
    width: number;
    source: string;
  }>;
  picture?: string;
  likes?: {
    data: any[];
    summary: { total_count: number };
  };
  isImported?: boolean;
}

interface Props {
  connections: Connection[];
  albums: Album[];
}

export default function FacebookImport({ connections, albums }: Props) {
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');
  const [photos, setPhotos] = useState<FacebookPhoto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPhotos = async () => {
    if (!selectedConnection) return;

    setLoading(true);
    setMessage(null);
    setPhotos([]);
    setSelectedPhotos(new Set());

    try {
      const response = await fetch(
        `/api/social-media/facebook/posts?connectionId=${selectedConnection}&limit=50`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch photos');
      }

      setPhotos(data.photos || []);
      setMessage({ type: 'success', text: `Loaded ${data.photos.length} photos` });
    } catch (error) {
      console.error('Error fetching photos:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to fetch photos',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePhoto = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const availablePhotos = photos.filter((p) => !p.isImported);
    setSelectedPhotos(new Set(availablePhotos.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedPhotos(new Set());
  };

  const handleImport = async () => {
    if (!selectedAlbum || selectedPhotos.size === 0) return;

    setImporting(true);
    setProgress(0);
    setMessage(null);

    const photosToImport = photos
      .filter((p) => selectedPhotos.has(p.id))
      .map((p) => {
        // Get the highest resolution image
        const highestRes = p.images.reduce((prev, current) =>
          prev.width * prev.height > current.width * current.height ? prev : current
        );

        return {
          id: p.id,
          media_url: highestRes.source,
          caption: p.name,
          timestamp: p.created_time,
          permalink: p.link,
          metadata: {
            likes: p.likes?.summary?.total_count || 0,
            width: highestRes.width,
            height: highestRes.height,
          },
        };
      });

    try {
      const result = await importPosts({
        connectionId: selectedConnection,
        albumId: selectedAlbum,
        posts: photosToImport,
      });

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully imported ${result.imported} photo(s)${
            result.failed ? `. ${result.failed} failed.` : ''
          }`,
        });

        // Mark imported photos
        setPhotos((prev) =>
          prev.map((p) =>
            selectedPhotos.has(p.id) ? { ...p, isImported: true } : p
          )
        );
        setSelectedPhotos(new Set());
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Import failed',
        });
      }
    } catch (error) {
      console.error('Error importing photos:', error);
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
          <CardTitle>Import from Facebook</CardTitle>
          <CardDescription>
            Select a page and album, then choose photos to import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Facebook Page</label>
            <Select value={selectedConnection} onValueChange={setSelectedConnection}>
              <SelectTrigger>
                <SelectValue placeholder="Select a page" />
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
            onClick={fetchPhotos}
            disabled={!selectedConnection || loading}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Fetch Photos'}
          </Button>
        </CardContent>
      </Card>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {photos.length > 0 && (
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
                {selectedPhotos.size} selected
              </span>
            </div>
            <Button
              onClick={handleImport}
              disabled={!selectedAlbum || selectedPhotos.size === 0 || importing}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {importing ? 'Importing...' : `Import ${selectedPhotos.size} Photo(s)`}
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

          {/* Photos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => {
              const thumbnail = photo.picture || photo.images[0]?.source;
              const likes = photo.likes?.summary?.total_count || 0;

              return (
                <div
                  key={photo.id}
                  className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden ${
                    selectedPhotos.has(photo.id) ? 'border-primary' : 'border-transparent'
                  } ${photo.isImported ? 'opacity-50' : ''}`}
                  onClick={() => !photo.isImported && togglePhoto(photo.id)}
                >
                  <img
                    src={thumbnail}
                    alt={photo.name || 'Facebook photo'}
                    className="w-full aspect-square object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <p className="text-white text-xs line-clamp-3">
                      {photo.name || 'No caption'}
                    </p>
                  </div>

                  {/* Selection Checkbox */}
                  {!photo.isImported && (
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox checked={selectedPhotos.has(photo.id)} />
                    </div>
                  )}

                  {/* Imported Badge */}
                  {photo.isImported && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Imported
                      </Badge>
                    </div>
                  )}

                  {/* Likes */}
                  {likes > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <div className="flex items-center gap-1 text-white text-xs">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{likes}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
