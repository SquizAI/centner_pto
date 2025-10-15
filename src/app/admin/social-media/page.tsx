/**
 * Social Media Management Page
 * Admin page for connecting and managing social media accounts
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SocialMediaClient from './social-media-client';

export const metadata = {
  title: 'Social Media Integration - Admin',
  description: 'Connect and manage Instagram and Facebook accounts for photo imports',
};

export default async function SocialMediaPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/admin/social-media');
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/admin?error=Admin access required');
  }

  // Fetch connections
  const { data: connections } = await supabase
    .from('social_media_connections')
    .select('*')
    .eq('user_id', user.id)
    .order('connected_at', { ascending: false });

  // Fetch albums for import
  const { data: albums } = await supabase
    .from('photo_albums')
    .select('id, title, slug, campus, event_date')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Media Integration</h1>
        <p className="text-muted-foreground">
          Connect your Instagram and Facebook accounts to import photos into the gallery.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <SocialMediaClient
          initialConnections={connections || []}
          albums={albums || []}
        />
      </Suspense>
    </div>
  );
}
