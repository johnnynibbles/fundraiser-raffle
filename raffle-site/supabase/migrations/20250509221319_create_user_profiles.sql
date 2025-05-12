-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    phone_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'USA',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for user_profiles
CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create index for role-based queries
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role); 


CREATE POLICY "Enable insert for authenticated users only" ON public.raffle_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS(
            SELECT 1 FROM user_profiles WHERE auth.uid() = id AND role = 'admin'
            )
        );

CREATE POLICY "Enable update for authenticated users only" ON public.raffle_events
    FOR UPDATE
    TO authenticated
    WITH CHECK (
        EXISTS(
            SELECT 1 FROM user_profiles WHERE auth.uid() = id AND role = 'admin'
            )
        );

CREATE POLICY "Enable delete for authenticated users only" ON public.raffle_events
    FOR DELETE
    TO authenticated
    USING (
        EXISTS(
            SELECT 1 FROM user_profiles WHERE auth.uid() = id AND role = 'admin'
            )
        );
CREATE POLICY "Enable insert for authenticated users only" ON public.raffle_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS(
            SELECT 1 FROM user_profiles WHERE auth.uid() = id AND role = 'admin'
            )
        );

CREATE POLICY "Enable update for authenticated users only" ON public.raffle_items
    FOR UPDATE
    TO authenticated
    WITH CHECK (
        EXISTS(
            SELECT 1 FROM user_profiles WHERE auth.uid() = id AND role = 'admin'
            )
        );

CREATE POLICY "Enable delete for authenticated users only" ON public.raffle_items
    FOR DELETE
    TO authenticated
    USING (
        EXISTS(
            SELECT 1 FROM user_profiles WHERE auth.uid() = id AND role = 'admin'
            )
        );
