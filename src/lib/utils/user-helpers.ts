/**
 * Get user initials from name for avatar display
 * This is a client-safe utility function
 */
export function getUserInitials(name: string | null | undefined): string {
  if (!name) return 'U'

  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
