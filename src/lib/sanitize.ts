/**
 * HTML Sanitization Utilities
 *
 * IMPORTANT: This is a basic implementation. For production use,
 * install and use DOMPurify or similar library:
 *
 * npm install isomorphic-dompurify
 *
 * Then use:
 * import DOMPurify from 'isomorphic-dompurify';
 * export const sanitizeHtml = (html: string) => DOMPurify.sanitize(html);
 */

/**
 * Basic HTML sanitization - strips potentially dangerous tags and attributes
 * This is NOT production-ready. Use DOMPurify for production.
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is for now
    // In production, use isomorphic-dompurify
    return html;
  }

  // Client-side basic sanitization
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Strips all HTML tags, leaving only text content
 */
export function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Basic server-side tag removal
    return html.replace(/<[^>]*>/g, '');
  }

  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

/**
 * Truncates HTML content to a specific length while preserving words
 */
export function truncateHtml(html: string, maxLength: number): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Allowed HTML tags for blog content
 * These are considered safe for rendering
 */
export const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span',
];

/**
 * Allowed HTML attributes
 */
export const ALLOWED_ATTRIBUTES = [
  'href', 'src', 'alt', 'title', 'class', 'id',
  'width', 'height', 'style',
];
