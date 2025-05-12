-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for admin users only" ON public.raffle_events;
DROP POLICY IF EXISTS "Enable update for admin users only" ON public.raffle_events;

-- Enable RLS
ALTER TABLE public.raffle_events ENABLE ROW LEVEL SECURITY;

-- Create policy for insert
CREATE POLICY "Enable insert for admin users only" 
ON public.raffle_events
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profile 
    WHERE auth.uid() = id 
    AND role = 'admin'
  )
);

-- Create policy for update
CREATE POLICY "Enable update for admin users only" 
ON public.raffle_events
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profile 
    WHERE auth.uid() = id 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profile 
    WHERE auth.uid() = id 
    AND role = 'admin'
  )
); 