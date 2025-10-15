'use server';

/**
 * Social Media Server Actions
 * Handles social media connections and photo imports
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { downloadImage } from '@/lib/social-media-api';
import { decryptToken } from '@/lib/encryption';

// UUID validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// =====================================================
// CONNECTION MANAGEMENT
// =====================================================

/**
 * Get all social media connections for the current user
 */
export async function getConnections(): Promise<{
  success: boolean;
  connections?: any[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return { success: false, error: 'Admin access required' };
    }

    // Get connections with statistics
    const { data: connections, error: fetchError } = await supabase
      .from('social_media_connections')
      .select('*')
      .eq('user_id', user.id)
      .order('connected_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching connections:', fetchError);
      return { success: false, error: 'Failed to fetch connections' };
    }

    // Get import counts for each connection
    const connectionsWithStats = await Promise.all(
      (connections || []).map(async (conn) => {
        const { data: stats } = await supabase.rpc('get_connection_stats', {
          p_connection_id: conn.id,
        });

        return {
          ...conn,
          stats: stats?.[0] || { total_imports: 0, total_photos_imported: 0 },
        };
      })
    );

    return { success: true, connections: connectionsWithStats };
  } catch (error) {
    console.error('Error in getConnections:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Disconnect a social media account
 */
export async function disconnectAccount(
  connectionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!UUID_REGEX.test(connectionId)) {
      return { success: false, error: 'Invalid connection ID' };
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return { success: false, error: 'Admin access required' };
    }

    // Delete connection (cascade will handle imports)
    const { error: deleteError } = await supabase
      .from('social_media_connections')
      .delete()
      .eq('id', connectionId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting connection:', deleteError);
      return { success: false, error: 'Failed to disconnect account' };
    }

    revalidatePath('/admin/social-media');

    return { success: true };
  } catch (error) {
    console.error('Error in disconnectAccount:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Manually sync a social media account
 */
export async function syncAccount(
  connectionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!UUID_REGEX.test(connectionId)) {
      return { success: false, error: 'Invalid connection ID' };
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return { success: false, error: 'Admin access required' };
    }

    // Update last sync time
    const { error: updateError } = await supabase
      .from('social_media_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connectionId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error syncing account:', updateError);
      return { success: false, error: 'Failed to sync account' };
    }

    revalidatePath('/admin/social-media');

    return { success: true };
  } catch (error) {
    console.error('Error in syncAccount:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// =====================================================
// PHOTO IMPORT
// =====================================================

const importSchema = z.object({
  connectionId: z.string().uuid(),
  albumId: z.string().uuid(),
  posts: z.array(
    z.object({
      id: z.string(),
      media_url: z.string().url(),
      caption: z.string().optional(),
      timestamp: z.string(),
      permalink: z.string().url(),
      metadata: z.record(z.any()).optional(),
    })
  ),
});

/**
 * Import selected posts from social media to gallery
 */
export async function importPosts(data: {
  connectionId: string;
  albumId: string;
  posts: Array<{
    id: string;
    media_url: string;
    caption?: string;
    timestamp: string;
    permalink: string;
    metadata?: Record<string, any>;
  }>;
}): Promise<{
  success: boolean;
  imported?: number;
  failed?: number;
  errors?: string[];
  error?: string;
}> {
  try {
    // Validate input
    const validated = importSchema.parse(data);

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return { success: false, error: 'Admin access required' };
    }

    // Verify connection exists and belongs to user
    const { data: connection, error: connError } = await supabase
      .from('social_media_connections')
      .select('*')
      .eq('id', validated.connectionId)
      .eq('user_id', user.id)
      .single();

    if (connError || !connection) {
      return { success: false, error: 'Connection not found' };
    }

    // Verify album exists
    const { data: album, error: albumError } = await supabase
      .from('photo_albums')
      .select('id')
      .eq('id', validated.albumId)
      .single();

    if (albumError || !album) {
      return { success: false, error: 'Album not found' };
    }

    // Check which posts have already been imported
    const { data: existingImports } = await supabase
      .from('social_media_imports')
      .select('post_id')
      .eq('connection_id', validated.connectionId)
      .in(
        'post_id',
        validated.posts.map((p) => p.id)
      );

    const alreadyImportedIds = new Set(existingImports?.map((i) => i.post_id) || []);

    const postsToImport = validated.posts.filter((p) => !alreadyImportedIds.has(p.id));

    if (postsToImport.length === 0) {
      return {
        success: false,
        error: 'All selected posts have already been imported',
      };
    }

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    // Import each post
    for (const post of postsToImport) {
      try {
        // Download image from social media
        const imageBuffer = await downloadImage(post.media_url);

        // Generate unique file name
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const extension = post.media_url.split('.').pop()?.split('?')[0] || 'jpg';
        const fileName = `${validated.albumId}/${timestamp}-${random}.${extension}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-photos')
          .upload(fileName, imageBuffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: `image/${extension}`,
          });

        if (uploadError) {
          errors.push(`Post ${post.id}: Upload failed - ${uploadError.message}`);
          failed++;
          continue;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('event-photos').getPublicUrl(fileName);

        // Create photo record
        const { data: photo, error: photoError } = await supabase
          .from('photos')
          .insert({
            album_id: validated.albumId,
            storage_path: fileName,
            storage_bucket: 'event-photos',
            url: publicUrl,
            file_name: `${post.id}.${extension}`,
            file_size: imageBuffer.length,
            mime_type: `image/${extension}`,
            caption: post.caption,
            title: post.caption?.substring(0, 100),
            uploaded_by: user.id,
          })
          .select('id')
          .single();

        if (photoError) {
          errors.push(`Post ${post.id}: Failed to create photo record`);
          // Clean up uploaded file
          await supabase.storage.from('event-photos').remove([fileName]);
          failed++;
          continue;
        }

        // Create import record
        const { error: importError } = await supabase
          .from('social_media_imports')
          .insert({
            connection_id: validated.connectionId,
            album_id: validated.albumId,
            photo_id: photo.id,
            post_id: post.id,
            post_url: post.permalink,
            post_date: post.timestamp,
            imported_by: user.id,
            metadata: post.metadata || {},
          });

        if (importError) {
          console.error('Error creating import record:', importError);
          // Don't fail the import, just log it
        }

        imported++;
      } catch (error) {
        console.error(`Error importing post ${post.id}:`, error);
        errors.push(
          `Post ${post.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        failed++;
      }
    }

    // Revalidate pages
    revalidatePath('/gallery');
    revalidatePath(`/gallery/${validated.albumId}`);
    revalidatePath('/gallery/admin');
    revalidatePath('/admin/social-media');

    if (imported === 0) {
      return {
        success: false,
        imported: 0,
        failed,
        errors,
        error: 'All imports failed',
      };
    }

    return {
      success: true,
      imported,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Error in importPosts:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get recent imports for a connection
 */
export async function getRecentImports(
  connectionId: string,
  limit: number = 20
): Promise<{
  success: boolean;
  imports?: any[];
  error?: string;
}> {
  try {
    if (!UUID_REGEX.test(connectionId)) {
      return { success: false, error: 'Invalid connection ID' };
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: imports, error: fetchError } = await supabase.rpc(
      'get_recent_imports',
      {
        p_connection_id: connectionId,
        p_limit: limit,
      }
    );

    if (fetchError) {
      console.error('Error fetching recent imports:', fetchError);
      return { success: false, error: 'Failed to fetch imports' };
    }

    return { success: true, imports: imports || [] };
  } catch (error) {
    console.error('Error in getRecentImports:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
