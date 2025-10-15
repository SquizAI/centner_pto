/**
 * Social Media API Integration
 *
 * Wrappers for Meta Graph API (Instagram & Facebook)
 * Handles OAuth flows and fetching posts/photos
 */

import { decryptToken } from './encryption';

// Meta Graph API Base URL
const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface InstagramPost {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
  like_count?: number;
  comments_count?: number;
  children?: { data: InstagramPost[] }; // For carousel albums
}

export interface FacebookPhoto {
  id: string;
  created_time: string;
  name?: string; // Caption
  link: string; // Permalink to photo
  images: Array<{
    height: number;
    width: number;
    source: string;
  }>;
  picture?: string; // Thumbnail URL
  likes?: { data: any[]; summary: { total_count: number } };
}

export interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
}

export interface FacebookPage {
  id: string;
  name: string;
  username?: string;
  picture?: { data: { url: string } };
  fan_count?: number;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface LongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// =====================================================
// INSTAGRAM GRAPH API
// =====================================================

/**
 * Get Instagram authorization URL
 */
export function getInstagramAuthUrl(redirectUri: string): string {
  const appId = process.env.INSTAGRAM_APP_ID;
  if (!appId) {
    throw new Error('INSTAGRAM_APP_ID not configured');
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: 'instagram_basic,instagram_manage_insights,pages_read_engagement',
    response_type: 'code',
    state: generateState(),
  });

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeInstagramCode(
  code: string,
  redirectUri: string
): Promise<OAuthTokenResponse> {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Instagram credentials not configured');
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`,
    { method: 'POST' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to exchange code: ${error.error?.message || 'Unknown error'}`);
  }

  return response.json();
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
export async function getInstagramLongLivedToken(
  shortLivedToken: string
): Promise<LongLivedTokenResponse> {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Instagram credentials not configured');
  }

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get long-lived token: ${error.error?.message || 'Unknown error'}`
    );
  }

  return response.json();
}

/**
 * Get Instagram Business Account info
 */
export async function getInstagramAccount(accessToken: string): Promise<InstagramAccount> {
  // First, get user's Facebook pages
  const pagesResponse = await fetch(
    `${GRAPH_API_BASE}/me/accounts?access_token=${accessToken}`
  );

  if (!pagesResponse.ok) {
    throw new Error('Failed to fetch Facebook pages');
  }

  const pagesData = await pagesResponse.json();

  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error('No Facebook pages found. Instagram Business account requires a Facebook page.');
  }

  // Get Instagram Business Account from the first page
  const pageId = pagesData.data[0].id;
  const pageAccessToken = pagesData.data[0].access_token;

  const igResponse = await fetch(
    `${GRAPH_API_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
  );

  if (!igResponse.ok) {
    throw new Error('Failed to fetch Instagram Business account');
  }

  const igData = await igResponse.json();

  if (!igData.instagram_business_account) {
    throw new Error('No Instagram Business account linked to this Facebook page');
  }

  const igAccountId = igData.instagram_business_account.id;

  // Get Instagram account details
  const accountResponse = await fetch(
    `${GRAPH_API_BASE}/${igAccountId}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${pageAccessToken}`
  );

  if (!accountResponse.ok) {
    throw new Error('Failed to fetch Instagram account details');
  }

  return accountResponse.json();
}

/**
 * Fetch recent Instagram posts
 */
export async function fetchInstagramPosts(
  encryptedToken: string,
  limit: number = 25
): Promise<InstagramPost[]> {
  const accessToken = decryptToken(encryptedToken);

  // Get Instagram Business Account ID first
  const account = await getInstagramAccount(accessToken);

  // Fetch media
  const response = await fetch(
    `${GRAPH_API_BASE}/${account.id}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp,permalink,like_count,comments_count,children{media_type,media_url,thumbnail_url}&limit=${limit}&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch posts: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Get Instagram media details by ID
 */
export async function getInstagramMedia(
  mediaId: string,
  accessToken: string
): Promise<InstagramPost> {
  const response = await fetch(
    `${GRAPH_API_BASE}/${mediaId}?fields=id,media_type,media_url,thumbnail_url,caption,timestamp,permalink,like_count,comments_count&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch media details');
  }

  return response.json();
}

// =====================================================
// FACEBOOK GRAPH API
// =====================================================

/**
 * Get Facebook authorization URL
 */
export function getFacebookAuthUrl(redirectUri: string): string {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    throw new Error('FACEBOOK_APP_ID not configured');
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: 'pages_show_list,pages_read_engagement,pages_manage_posts',
    response_type: 'code',
    state: generateState(),
  });

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange Facebook authorization code for access token
 */
export async function exchangeFacebookCode(
  code: string,
  redirectUri: string
): Promise<OAuthTokenResponse> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Facebook credentials not configured');
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to exchange code: ${error.error?.message || 'Unknown error'}`);
  }

  return response.json();
}

/**
 * Get Facebook long-lived token
 */
export async function getFacebookLongLivedToken(
  shortLivedToken: string
): Promise<LongLivedTokenResponse> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Facebook credentials not configured');
  }

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get long-lived token: ${error.error?.message || 'Unknown error'}`
    );
  }

  return response.json();
}

/**
 * Get Facebook Page info
 */
export async function getFacebookPage(accessToken: string): Promise<FacebookPage> {
  const response = await fetch(
    `${GRAPH_API_BASE}/me/accounts?fields=id,name,username,picture,fan_count&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Facebook pages');
  }

  const data = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error('No Facebook pages found');
  }

  // Return the first page
  return data.data[0];
}

/**
 * Fetch recent Facebook photos
 */
export async function fetchFacebookPhotos(
  encryptedToken: string,
  limit: number = 25
): Promise<FacebookPhoto[]> {
  const accessToken = decryptToken(encryptedToken);

  // Get page info to get page ID
  const page = await getFacebookPage(accessToken);

  // Fetch photos from page
  const response = await fetch(
    `${GRAPH_API_BASE}/${page.id}/photos?type=uploaded&fields=id,created_time,name,link,images,picture,likes.summary(true)&limit=${limit}&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch photos: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Get Facebook photo details by ID
 */
export async function getFacebookPhoto(
  photoId: string,
  accessToken: string
): Promise<FacebookPhoto> {
  const response = await fetch(
    `${GRAPH_API_BASE}/${photoId}?fields=id,created_time,name,link,images,picture,likes.summary(true)&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch photo details');
  }

  return response.json();
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Generate random state parameter for OAuth security
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Download image from URL and return as Buffer
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Get image dimensions from Buffer
 */
export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  // This is a simplified version. In production, use a library like 'sharp' or 'image-size'
  // For now, we'll return placeholder dimensions
  return { width: 1080, height: 1080 };
}

/**
 * Validate token expiration
 */
export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() >= expiresAt;
}

/**
 * Calculate token expiration date from expires_in seconds
 */
export function calculateTokenExpiration(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000);
}
