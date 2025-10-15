/**
 * Social Media Integration Types
 */

// Database types (defined manually until migration is applied)
export interface SocialMediaConnection {
  id: string;
  platform: 'instagram' | 'facebook';
  account_id: string;
  account_name: string;
  account_username?: string;
  access_token_encrypted: string;
  refresh_token_encrypted?: string;
  token_expires_at?: string;
  is_active: boolean;
  connected_at: string;
  last_sync_at?: string;
  last_error?: string;
  metadata?: Record<string, any>;
  created_by: string;
}

export interface SocialMediaImport {
  id: string;
  connection_id: string;
  album_id: string;
  post_id: string;
  platform: 'instagram' | 'facebook';
  media_url: string;
  imported_photo_id?: string;
  import_status: 'pending' | 'completed' | 'failed';
  error_message?: string;
  imported_at?: string;
  metadata?: Record<string, any>;
}

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
