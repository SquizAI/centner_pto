-- =====================================================
-- EVENT TICKETING SYSTEM
-- Migration: Add ticketing and payment capabilities
-- Created: October 16, 2025
-- =====================================================

-- Add ticketing fields to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS ticket_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ticket_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS ticket_quantity INTEGER,
ADD COLUMN IF NOT EXISTS tickets_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ticket_sales_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ticket_sales_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;

-- Create event_tickets table for tracking purchases
CREATE TABLE IF NOT EXISTS event_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Buyer information
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,

  -- Ticket details
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,

  -- Stripe payment info
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),

  -- Unique ticket codes for each ticket purchased
  ticket_codes TEXT[] NOT NULL,

  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_tickets_event ON event_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_user ON event_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_status ON event_tickets(status);
CREATE INDEX IF NOT EXISTS idx_event_tickets_email ON event_tickets(buyer_email);
CREATE INDEX IF NOT EXISTS idx_event_tickets_stripe_session ON event_tickets(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_events_ticket_enabled ON events(ticket_enabled) WHERE ticket_enabled = true;

-- Row Level Security for event_tickets
ALTER TABLE event_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets" ON event_tickets
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Anyone can create tickets (for guest checkout)
CREATE POLICY "Anyone can create tickets" ON event_tickets
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own tickets (for cancellations)
CREATE POLICY "Users can update their own tickets" ON event_tickets
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets" ON event_tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins can manage all tickets
CREATE POLICY "Admins can manage all tickets" ON event_tickets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Function to generate unique ticket codes
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM event_tickets
      WHERE code = ANY(ticket_codes)
    ) INTO exists;

    EXIT WHEN NOT exists;
  END LOOP;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update tickets_sold count when tickets are purchased
CREATE OR REPLACE FUNCTION update_tickets_sold()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'paid') THEN
    UPDATE events
    SET tickets_sold = tickets_sold + NEW.quantity
    WHERE id = NEW.event_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status != 'paid' AND NEW.status = 'paid') THEN
      -- Payment completed
      UPDATE events
      SET tickets_sold = tickets_sold + NEW.quantity
      WHERE id = NEW.event_id;
    ELSIF (OLD.status = 'paid' AND NEW.status IN ('cancelled', 'refunded')) THEN
      -- Ticket cancelled or refunded
      UPDATE events
      SET tickets_sold = tickets_sold - OLD.quantity
      WHERE id = NEW.event_id;
    END IF;
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'paid') THEN
    UPDATE events
    SET tickets_sold = tickets_sold - OLD.quantity
    WHERE id = OLD.event_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating tickets_sold
CREATE TRIGGER update_event_tickets_sold
AFTER INSERT OR UPDATE OR DELETE ON event_tickets
FOR EACH ROW
EXECUTE FUNCTION update_tickets_sold();

-- Trigger for updated_at
CREATE TRIGGER update_event_tickets_updated_at
BEFORE UPDATE ON event_tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to check ticket availability
CREATE OR REPLACE FUNCTION check_ticket_availability(
  p_event_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_ticket_quantity INTEGER;
  v_tickets_sold INTEGER;
BEGIN
  SELECT ticket_quantity, tickets_sold
  INTO v_ticket_quantity, v_tickets_sold
  FROM events
  WHERE id = p_event_id AND ticket_enabled = true;

  IF v_ticket_quantity IS NULL THEN
    RETURN false; -- Tickets not enabled
  END IF;

  RETURN (v_tickets_sold + p_quantity) <= v_ticket_quantity;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE event_tickets IS 'Stores ticket purchases for events with Stripe payment integration';
COMMENT ON COLUMN events.ticket_enabled IS 'Whether ticket sales are enabled for this event';
COMMENT ON COLUMN events.ticket_price IS 'Price per ticket in dollars';
COMMENT ON COLUMN events.ticket_quantity IS 'Total number of tickets available';
COMMENT ON COLUMN events.tickets_sold IS 'Number of tickets sold (auto-updated by trigger)';
COMMENT ON COLUMN events.requires_approval IS 'Whether RSVP requires admin approval (for free events)';
COMMENT ON FUNCTION generate_ticket_code() IS 'Generates unique 8-character ticket codes';
COMMENT ON FUNCTION check_ticket_availability(UUID, INTEGER) IS 'Checks if requested quantity of tickets is available';
