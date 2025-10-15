'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Upload, Eye, EyeOff, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PhotoUploadZone } from '@/components/gallery/PhotoUploadZone';
import { AlbumWithStats, PhotoUploadFile, GALLERY_CAMPUS_CONFIG } from '@/types/gallery.types';
import {
  createAlbum,
  uploadPhotos,
  deleteAlbum,
  updateAlbumPublishStatus,
} from '../actions';
import { cn } from '@/lib/utils';

interface AdminPageClientProps {
  albums: AlbumWithStats[];
}

export function AdminPageClient({ albums }: AdminPageClientProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = React.useState(false);
  const [uploadingAlbumId, setUploadingAlbumId] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{successMessage}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccessMessage(null)}
            className="h-auto p-0 hover:bg-transparent"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create Album Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Album
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAlbumForm
            isCreating={isCreating}
            onCreateStart={() => setIsCreating(true)}
            onCreateComplete={(success, slug) => {
              setIsCreating(false);
              if (success && slug) {
                setSuccessMessage('Album created successfully. You can now upload photos.');
                router.refresh();
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Albums List */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Manage Albums</h2>
        <div className="grid gap-6">
          {albums.map((album) => (
            <AlbumManagementCard
              key={album.id}
              album={album}
              isUploading={uploadingAlbumId === album.id}
              onUploadStart={() => setUploadingAlbumId(album.id)}
              onUploadComplete={() => {
                setUploadingAlbumId(null);
                router.refresh();
              }}
              onDelete={() => {
                router.refresh();
              }}
              onPublishToggle={() => {
                router.refresh();
              }}
            />
          ))}

          {albums.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No albums yet. Create your first album above.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Album Form Component
function CreateAlbumForm({
  isCreating,
  onCreateStart,
  onCreateComplete,
}: {
  isCreating: boolean;
  onCreateStart: () => void;
  onCreateComplete: (success: boolean, slug?: string) => void;
}) {
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    campus: 'all',
    published: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    onCreateStart();

    const result = await createAlbum(formData);

    if (result.success) {
      setFormData({
        title: '',
        description: '',
        event_date: '',
        location: '',
        campus: 'all',
        published: false,
      });
      onCreateComplete(true, result.slug);
    } else {
      setError(result.error || 'Failed to create album');
      onCreateComplete(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Album Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Spring Festival 2025"
            required
            disabled={isCreating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="campus">Campus *</Label>
          <Select
            value={formData.campus}
            onValueChange={(value) => setFormData({ ...formData, campus: value })}
            disabled={isCreating}
          >
            <SelectTrigger id="campus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campuses</SelectItem>
              <SelectItem value="preschool">Preschool</SelectItem>
              <SelectItem value="elementary">Elementary</SelectItem>
              <SelectItem value="middle-high">Middle & High School</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the event or album"
          rows={3}
          disabled={isCreating}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event_date">Event Date</Label>
          <Input
            id="event_date"
            type="date"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            disabled={isCreating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Main Courtyard"
            disabled={isCreating}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive flex items-start gap-2">
          <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Album'}
      </Button>
    </form>
  );
}

// Album Management Card Component
function AlbumManagementCard({
  album,
  isUploading,
  onUploadStart,
  onUploadComplete,
  onDelete,
  onPublishToggle,
}: {
  album: AlbumWithStats;
  isUploading: boolean;
  onUploadStart: () => void;
  onUploadComplete: () => void;
  onDelete: () => void;
  onPublishToggle: () => void;
}) {
  const [showUpload, setShowUpload] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [files, setFiles] = React.useState<PhotoUploadFile[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select photos to upload');
      return;
    }

    setError(null);
    setSuccess(null);
    onUploadStart();

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const result = await uploadPhotos(album.id, formData);

    if (result.success) {
      setSuccess(`${result.photoIds?.length || 0} photos uploaded successfully`);
      setFiles([]);
      setShowUpload(false);
      onUploadComplete();
    } else {
      setError(result.error || 'Failed to upload photos');
      onUploadComplete();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    const result = await deleteAlbum(album.id);

    if (result.success) {
      setShowDeleteDialog(false);
      onDelete();
    } else {
      setError(result.error || 'Failed to delete album');
    }
    setIsDeleting(false);
  };

  const handlePublishToggle = async () => {
    setIsTogglingPublish(true);
    setError(null);
    setSuccess(null);
    const result = await updateAlbumPublishStatus(album.id, !album.published);

    if (result.success) {
      setSuccess(`Album ${album.published ? 'unpublished' : 'published'} successfully`);
      onPublishToggle();
    } else {
      setError(result.error || 'Failed to update album');
    }
    setIsTogglingPublish(false);
  };

  // Handle both old (array) and new (string) campus schema
  const campusValue = Array.isArray(album.campus) ? album.campus[0] : album.campus;
  const campusConfig = GALLERY_CAMPUS_CONFIG[(campusValue || 'all') as keyof typeof GALLERY_CAMPUS_CONFIG];
  const eventDate = album.event_date ? new Date(album.event_date) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle>{album.title}</CardTitle>
              <Badge
                className={cn(
                  campusConfig.bgColor,
                  campusConfig.textColor,
                  'border-none'
                )}
              >
                {campusConfig.label}
              </Badge>
              {album.published ? (
                <Badge variant="default" className="bg-green-500">
                  <Eye className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Draft
                </Badge>
              )}
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              {eventDate && <span>{format(eventDate, 'MMM d, yyyy')}</span>}
              <span>{album.photo_count} photos</span>
            </div>
          </div>

          <div className="flex gap-2">
            {album.published && (
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <a href={`/gallery/${album.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handlePublishToggle}
              disabled={isTogglingPublish}
            >
              {album.published ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Album</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this album? This will permanently
                    delete all {album.photo_count} photos in this album. This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Album'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      {album.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{album.description}</p>
        </CardContent>
      )}

      <CardFooter className="flex-col items-stretch gap-4">
        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive flex items-start gap-2">
            <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <Button
          variant="outline"
          onClick={() => setShowUpload(!showUpload)}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {showUpload ? 'Hide Upload' : 'Upload Photos'}
        </Button>

        {showUpload && (
          <div className="space-y-4 pt-4 border-t">
            <PhotoUploadZone
              onFilesSelected={setFiles}
              maxFiles={50}
              disabled={isUploading}
            />
            {files.length > 0 && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? 'Uploading...' : `Upload ${files.length} Photo${files.length === 1 ? '' : 's'}`}
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
