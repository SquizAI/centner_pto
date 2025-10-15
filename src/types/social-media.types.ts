/**
 * Social Media Integration Types
 */

import { Tables } from './database.types';

// Database types
export type SocialMediaConnection = Tables<'social_media_connections'>;
export type SocialMediaImport = Tables<'social_media_imports'>;

// Platform types
export type SocialPlatform = 'instagram' | 'facebook';

// Extended connection with statistics
export interface ConnectionWithStats extends SocialMediaConnection {
  total_imports?: number;
  last_import_date?: string;
  total_photos_imported?: number;
}

// Post selection for import
export interface PostToImport {
  id: string;
  platform: SocialPlatform;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
  metadata?: Record<string, any>;
}

// Import result
export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: Array<{
    postId: string;
    error: string;
  }>;
}

// Connection form data
export interface ConnectionFormData {
  platform: SocialPlatform;
  account_id: string;
  account_name: string;
  account_username?: string;
  access_token: string;
  token_expires_at?: Date;
  refresh_token?: string;
  metadata?: Record<string, any>;
}

// Import form data
export interface ImportFormData {
  connectionId: string;
  albumId: string;
  postIds: string[];
  createNewAlbum?: boolean;
  newAlbumData?: {
    title: string;
    description?: string;
    event_date?: string;
    location?: string;
    campus: string;
  };
}

// Import progress tracking
export interface ImportProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
  status: 'idle' | 'importing' | 'completed' | 'failed';
}
