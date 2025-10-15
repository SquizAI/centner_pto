/**
 * Facebook OAuth Initiation
 * GET /api/social-media/facebook/auth
 * Redirects user to Facebook OAuth authorization page
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacebookAuthUrl } from '@/lib/social-media-api';
import { createClient } from '@/lib/supabase/server';

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

    // Get redirect URI from environment or construct from request
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const redirectUri = `${baseUrl}/api/social-media/facebook/callback`;

    // Generate Facebook auth URL
    const authUrl = getFacebookAuthUrl(redirectUri);

    // Redirect to Facebook OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Facebook auth error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate Facebook authentication',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
