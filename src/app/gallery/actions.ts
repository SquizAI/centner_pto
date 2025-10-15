'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { PhotoAlbum, Photo } from '@/types/gallery.types';

// UUID validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Upload photos to Supabase Storage and create photo records
 */
export async function uploadPhotos(
  albumId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; photoIds?: string[] }> {
  try {
    // Validate UUID format
    if (!UUID_REGEX.test(albumId)) {
      return {
        success: false,
        error: 'Invalid album ID format',
      };
    }

    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to upload photos',
      };
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return {
        success: false,
        error: 'You must be an admin to upload photos',
      };
    }

    // Verify album exists
    const { data: album, error: albumError } = await supabase
      .from('photo_albums')
      .select('id')
      .eq('id', albumId)
      .single();

    if (albumError || !album) {
      return {
        success: false,
        error: 'Album not found',
      };
    }

    // Get all files from FormData
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return {
        success: false,
        error: 'No files provided',
      };
    }

    const photoIds: string[] = [];
    const uploadErrors: string[] = [];

    // Upload each file
    for (const file of files) {
      try {
        // Generate unique file name
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const extension = file.name.split('.').pop();
        const fileName = `${albumId}/${timestamp}-${random}.${extension}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          uploadErrors.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('event-photos').getPublicUrl(fileName);

        // Get image dimensions (if browser supports it)
        let width: number | null = null;
        let height: number | null = null;

        // For images, try to read dimensions
        if (file.type.startsWith('image/')) {
          try {
            const bitmap = await createImageBitmap(file);
            width = bitmap.width;
            height = bitmap.height;
          } catch {
            // Ignore errors reading dimensions
          }
        }

        // Insert photo record
        const { data: photo, error: insertError } = await supabase
          .from('photos')
          .insert({
            album_id: albumId,
            storage_path: fileName,
            storage_bucket: 'event-photos',
            url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            width,
            height,
            uploaded_by: user.id,
          })
          .select('id')
          .single();

        if (insertError) {
          uploadErrors.push(`${file.name}: Failed to create photo record`);
          // Clean up uploaded file
          await supabase.storage.from('event-photos').remove([fileName]);
          continue;
        }

        if (photo) {
          photoIds.push(photo.id);
        }
      } catch (error) {
        uploadErrors.push(
          `${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Revalidate gallery pages
    revalidatePath('/gallery');
    revalidatePath(`/gallery/${albumId}`);
    revalidatePath('/gallery/admin');

    if (photoIds.length === 0) {
      return {
        success: false,
        error: `All uploads failed: ${uploadErrors.join(', ')}`,
      };
    }

    if (uploadErrors.length > 0) {
      return {
        success: true,
        photoIds,
        error: `Some uploads failed: ${uploadErrors.join(', ')}`,
      };
    }

    return {
      success: true,
      photoIds,
    };
  } catch (error) {
    console.error('Unexpected error in uploadPhotos:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Create a new photo album
 */
export async function createAlbum(data: {
  title: string;
  description?: string;
  event_date?: string;
  location?: string;
  campus: string;
  published?: boolean;
}): Promise<{ success: boolean; error?: string; albumId?: string; slug?: string }> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to create albums',
      };
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return {
        success: false,
        error: 'You must be an admin to create albums',
      };
    }

    // Generate slug from title using the database function
    const { data: slugData } = await supabase.rpc('generate_album_slug', {
      album_title: data.title,
    });

    const slug = slugData || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if slug already exists
    const { data: existingAlbum } = await supabase
      .from('photo_albums')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingAlbum) {
      return {
        success: false,
        error: 'An album with this title already exists. Please use a different title.',
      };
    }

    // Create album
    const { data: album, error: insertError } = await supabase
      .from('photo_albums')
      .insert({
        title: data.title,
        slug,
        description: data.description || null,
        event_date: data.event_date || null,
        location: data.location || null,
        campus: data.campus,
        published: data.published || false,
        publish_date: data.published ? new Date().toISOString() : null,
        created_by: user.id,
      })
      .select('id, slug')
      .single();

    if (insertError) {
      console.error('Error creating album:', insertError);
      return {
        success: false,
        error: 'Failed to create album. Please try again.',
      };
    }

    // Revalidate gallery pages
    revalidatePath('/gallery');
    revalidatePath('/gallery/admin');

    return {
      success: true,
      albumId: album.id,
      slug: album.slug,
    };
  } catch (error) {
    console.error('Unexpected error in createAlbum:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Delete an album and all associated photos
 */
export async function deleteAlbum(
  albumId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate UUID format
    if (!UUID_REGEX.test(albumId)) {
      return {
        success: false,
        error: 'Invalid album ID format',
      };
    }

    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to delete albums',
      };
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return {
        success: false,
        error: 'You must be an admin to delete albums',
      };
    }

    // Get all photos in the album to delete from storage
    const { data: photos } = await supabase
      .from('photos')
      .select('storage_path, storage_bucket')
      .eq('album_id', albumId);

    // Delete album (cascade will delete photos)
    const { error: deleteError } = await supabase
      .from('photo_albums')
      .delete()
      .eq('id', albumId);

    if (deleteError) {
      console.error('Error deleting album:', deleteError);
      return {
        success: false,
        error: 'Failed to delete album. Please try again.',
      };
    }

    // Delete files from storage
    if (photos && photos.length > 0) {
      const filePaths = photos.map((p) => p.storage_path);
      await supabase.storage.from('event-photos').remove(filePaths);
    }

    // Revalidate gallery pages
    revalidatePath('/gallery');
    revalidatePath('/gallery/admin');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteAlbum:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Update album publish status
 */
export async function updateAlbumPublishStatus(
  albumId: string,
  published: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate UUID format
    if (!UUID_REGEX.test(albumId)) {
      return {
        success: false,
        error: 'Invalid album ID format',
      };
    }

    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to update albums',
      };
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return {
        success: false,
        error: 'You must be an admin to update albums',
      };
    }

    // Update album
    const { error: updateError } = await supabase
      .from('photo_albums')
      .update({
        published,
        publish_date: published ? new Date().toISOString() : null,
      })
      .eq('id', albumId);

    if (updateError) {
      console.error('Error updating album:', updateError);
      return {
        success: false,
        error: 'Failed to update album. Please try again.',
      };
    }

    // Revalidate gallery pages
    revalidatePath('/gallery');
    revalidatePath('/gallery/admin');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateAlbumPublishStatus:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Delete a photo
 */
export async function deletePhoto(
  photoId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate UUID format
    if (!UUID_REGEX.test(photoId)) {
      return {
        success: false,
        error: 'Invalid photo ID format',
      };
    }

    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to delete photos',
      };
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return {
        success: false,
        error: 'You must be an admin to delete photos',
      };
    }

    // Get photo to delete from storage
    const { data: photo } = await supabase
      .from('photos')
      .select('storage_path, storage_bucket, album_id')
      .eq('id', photoId)
      .single();

    if (!photo) {
      return {
        success: false,
        error: 'Photo not found',
      };
    }

    // Delete photo record
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (deleteError) {
      console.error('Error deleting photo:', deleteError);
      return {
        success: false,
        error: 'Failed to delete photo. Please try again.',
      };
    }

    // Delete file from storage
    await supabase.storage.from(photo.storage_bucket).remove([photo.storage_path]);

    // Revalidate gallery pages
    revalidatePath('/gallery');
    revalidatePath('/gallery/admin');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deletePhoto:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
