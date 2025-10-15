/**
 * Instagram OAuth Callback
 * GET /api/social-media/instagram/callback
 * Handles OAuth callback from Instagram
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeInstagramCode,
  getInstagramLongLivedToken,
  getInstagramAccount,
  calculateTokenExpiration,
} from '@/lib/social-media-api';
import { encryptToken } from '@/lib/encryption';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Unknown error';
      return NextResponse.redirect(
        `/admin/social-media?error=${encodeURIComponent(errorDescription)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        '/admin/social-media?error=No authorization code received'
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated and admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect('/login?error=Unauthorized');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.redirect('/admin/social-media?error=Admin access required');
    }

    // Exchange code for access token
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const redirectUri = `${baseUrl}/api/social-media/instagram/callback`;

    const tokenResponse = await exchangeInstagramCode(code, redirectUri);

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedToken = await getInstagramLongLivedToken(tokenResponse.access_token);

    // Get Instagram account information
    const account = await getInstagramAccount(longLivedToken.access_token);

    // Encrypt token before storing
    const encryptedToken = encryptToken(longLivedToken.access_token);

    // Calculate token expiration
    const tokenExpiresAt = calculateTokenExpiration(longLivedToken.expires_in);

    // Store connection in database
    const { data: connection, error: insertError } = await supabase
      .from('social_media_connections')
      .upsert(
        {
          user_id: user.id,
          platform: 'instagram',
          account_id: account.id,
          account_name: account.name || account.username,
          account_username: account.username,
          access_token: encryptedToken,
          token_expires_at: tokenExpiresAt.toISOString(),
          is_active: true,
          metadata: {
            followers_count: account.followers_count,
            media_count: account.media_count,
            profile_picture_url: account.profile_picture_url,
          },
        },
        {
          onConflict: 'platform,account_id,user_id',
        }
      )
      .select()
      .single();

    if (insertError) {
      console.error('Error storing connection:', insertError);
      return NextResponse.redirect(
        `/admin/social-media?error=${encodeURIComponent('Failed to save connection')}`
      );
    }

    // Success - redirect to social media management page
    return NextResponse.redirect(
      `/admin/social-media?success=${encodeURIComponent('Instagram account connected successfully')}`
    );
  } catch (error) {
    console.error('Instagram callback error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to connect Instagram account';
    return NextResponse.redirect(
      `/admin/social-media?error=${encodeURIComponent(errorMessage)}`
    );
  }
}
