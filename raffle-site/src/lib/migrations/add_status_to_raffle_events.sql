-- Add status column to raffle_events table
ALTER TABLE public.raffle_events
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';

-- Add check constraint for valid status values
ALTER TABLE public.raffle_events
ADD CONSTRAINT raffle_events_status_check 
CHECK (status IN ('draft', 'preview', 'active', 'completed'));

-- Add comment to explain the status values
COMMENT ON COLUMN public.raffle_events.status IS 'Event status: draft, preview, active, or completed'; 