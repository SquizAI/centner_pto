-- Add external_ticket_url column to events table
-- This allows admins to add links to external ticket sales platforms
-- (e.g., Eventbrite, Ticketmaster, etc.)

ALTER TABLE events
ADD COLUMN IF NOT EXISTS external_ticket_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN events.external_ticket_url IS 'URL link to external ticket sales platform (e.g., Eventbrite, Ticketmaster)';
