/**
 * Fetch Instagram Posts
 * GET /api/social-media/instagram/posts?connectionId=xxx&limit=25
 * Fetches recent posts from a connected Instagram account
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { fetchInstagramPosts } from '@/lib/social-media-api';

const requestSchema = z.object({
  connectionId: z.string().uuid(),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated and admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      connectionId: searchParams.get('connectionId'),
      limit: searchParams.get('limit'),
    };

    const validated = requestSchema.parse(params);

    // Get connection from database
    const { data: connection, error: connectionError } = await supabase
      .from('social_media_connections')
      .select('*')
      .eq('id', validated.connectionId)
      .eq('user_id', user.id)
      .eq('platform', 'instagram')
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    if (!connection.is_active) {
      return NextResponse.json(
        { error: 'Connection is inactive. Please reconnect your account.' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (
      connection.token_expires_at &&
      new Date(connection.token_expires_at) <= new Date()
    ) {
      // Mark connection as inactive
      await supabase
        .from('social_media_connections')
        .update({
          is_active: false,
          last_error: 'Token expired',
        })
        .eq('id', connection.id);

      return NextResponse.json(
        { error: 'Token expired. Please reconnect your account.' },
        { status: 401 }
      );
    }

    // Fetch posts from Instagram
    try {
      const posts = await fetchInstagramPosts(
        connection.access_token,
        validated.limit
      );

      // Get list of already imported post IDs
      const { data: imports } = await supabase
        .from('social_media_imports')
        .select('post_id')
        .eq('connection_id', connection.id);

      const importedPostIds = new Set(imports?.map((i) => i.post_id) || []);

      // Mark which posts have been imported
      const postsWithImportStatus = posts.map((post) => ({
        ...post,
        isImported: importedPostIds.has(post.id),
      }));

      // Update last sync time
      await supabase
        .from('social_media_connections')
        .update({
          last_sync_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', connection.id);

      return NextResponse.json({
        success: true,
        posts: postsWithImportStatus,
        connection: {
          id: connection.id,
          platform: connection.platform,
          account_name: connection.account_name,
          account_username: connection.account_username,
        },
      });
    } catch (apiError) {
      console.error('Instagram API error:', apiError);

      // Update connection with error
      await supabase
        .from('social_media_connections')
        .update({
          last_error: apiError instanceof Error ? apiError.message : 'API error',
        })
        .eq('id', connection.id);

      return NextResponse.json(
        {
          error: 'Failed to fetch Instagram posts',
          details: apiError instanceof Error ? apiError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
