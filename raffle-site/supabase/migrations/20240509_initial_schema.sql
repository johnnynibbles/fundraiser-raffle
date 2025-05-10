-- Create raffle_events table
CREATE TABLE IF NOT EXISTS public.raffle_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create raffle_items table
CREATE TABLE IF NOT EXISTS public.raffle_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.raffle_events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create raffle_tickets table
CREATE TABLE IF NOT EXISTS public.raffle_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.raffle_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables
CREATE TRIGGER set_updated_at_raffle_events
    BEFORE UPDATE ON public.raffle_events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_raffle_items
    BEFORE UPDATE ON public.raffle_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add RLS policies
ALTER TABLE public.raffle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.raffle_events
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.raffle_items
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.raffle_tickets
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.raffle_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_raffle_items_event_id ON public.raffle_items(event_id);
CREATE INDEX idx_raffle_tickets_item_id ON public.raffle_tickets(item_id);
CREATE INDEX idx_raffle_tickets_user_id ON public.raffle_tickets(user_id); 