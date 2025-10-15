import { Tables } from './database.types';

// Database types from Supabase
export type PhotoAlbum = Tables<'photo_albums'>;
export type Photo = Tables<'photos'>;

// Campus type for gallery
export type GalleryCampus = 'all' | 'preschool' | 'elementary' | 'middle-high';

// Extended types with computed fields
export interface AlbumWithStats extends PhotoAlbum {
  photo_count: number;
  total_size?: number;
}

// Campus configuration for styling and labels
export const GALLERY_CAMPUS_CONFIG: Record<
  GalleryCampus,
  { label: string; bgColor: string; textColor: string }
> = {
  all: {
    label: 'All Campuses',
    bgColor: 'bg-primary',
    textColor: 'text-primary-foreground',
  },
  preschool: {
    label: 'Preschool',
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
  },
  elementary: {
    label: 'Elementary',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
  },
  'middle-high': {
    label: 'Middle & High School',
    bgColor: 'bg-teal-500',
    textColor: 'text-white',
  },
};

// Upload file validation
export interface PhotoUploadFile extends File {
  preview?: string;
}

export interface PhotoUploadError {
  file: string;
  error: string;
}

export const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Lightbox navigation
export interface LightboxPhoto {
  id: string;
  url: string;
  title?: string | null;
  caption?: string | null;
  alt_text?: string | null;
  width?: number | null;
  height?: number | null;
}
