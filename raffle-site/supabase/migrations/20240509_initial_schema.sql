-- Create updated_at trigger function
CREATE
OR REPLACE FUNCTION public.handle_updated_at () RETURNS TRIGGER AS $ $ BEGIN NEW.updated_at = NOW ();

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

-- Create user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users (id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    phone_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'USA',
    role TEXT DEFAULT 'user' CHECK (
        role IN (
            'user',
            'admin'
        )
    ),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW (),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW ()
);

-- Create updated_at trigger for user_profiles
CREATE TRIGGER set_updated_at_user_profiles BEFORE
UPDATE
    ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at ();

-- Enable RLS
ALTER TABLE
    public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR
SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR
UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR
INSERT
    WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE
OR REPLACE FUNCTION public.handle_new_user () RETURNS TRIGGER AS $ $ BEGIN
INSERT INTO
    public.user_profiles (id, email, full_name)
VALUES
    (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.email
        )
    );

RETURN NEW;

END;

$ $ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER
INSERT
    ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user ();

-- Create index for role-based queries
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

-- Create raffle_events table
CREATE TABLE IF NOT EXISTS public.raffle_events (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'preview',
            'active',
            'completed'
        )
    ),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW (),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW ()
);

-- Create raffle_items table
CREATE TABLE IF NOT EXISTS public.raffle_items (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    event_id UUID REFERENCES public.raffle_events (id) ON DELETE CASCADE,
    item_number TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL (10, 2) NOT NULL,
    image_url TEXT,
    image_urls TEXT [] DEFAULT ARRAY [] :: TEXT [],
    category TEXT NOT NULL,
    sponsor TEXT,
    item_value DECIMAL (10, 2),
    is_over_21 BOOLEAN NOT NULL DEFAULT false,
    is_local_pickup_only BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    draw_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW (),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW ()
);

-- Create storage bucket for raffle item images
INSERT INTO
    storage.buckets (id, name, public)
VALUES
    (
        'raffle-items',
        'raffle-items',
        true
    ) ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for raffle items bucket
CREATE POLICY "Allow public read access" ON storage.objects FOR
SELECT
    USING (bucket_id = 'raffle-items');

CREATE POLICY "Allow authenticated users to upload images" ON storage.objects FOR
INSERT
    WITH CHECK (
        bucket_id = 'raffle-items'
        AND auth.role () = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to update their images" ON storage.objects FOR
UPDATE
    USING (
        bucket_id = 'raffle-items'
        AND auth.role () = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to delete their images" ON storage.objects FOR DELETE USING (
    bucket_id = 'raffle-items'
    AND auth.role () = 'authenticated'
);

-- Add updated_at triggers to tables
CREATE TRIGGER set_updated_at_raffle_events BEFORE
UPDATE
    ON public.raffle_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at ();

CREATE TRIGGER set_updated_at_raffle_items BEFORE
UPDATE
    ON public.raffle_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at ();

-- Add RLS policies
ALTER TABLE
    public.raffle_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    public.raffle_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.raffle_events FOR
SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON public.raffle_items FOR
SELECT
    USING (true);

-- Add admin policies for raffle_events
CREATE POLICY "Enable insert for authenticated users only" ON public.raffle_events FOR INSER (
    SELECT
        1
    WHERE
        id = auth.uid ()
        AND role = 'admin'
)
);

CREATE POLICY "Enable update for authenticated users only" ON public.raffle_events FOR
UPDATE
    USING (
        EXISTS (
            SELECT
                1
            FROM
                user_profiles
            WHERE
                id = auth.uid()
                AND role = 'admin'
        )
    );

CREATE POLICY "Enable delete for authenticated users only" ON public.raffle_events FOR DELETE USING (
    EXISTS (
        SELECT
            1
        FROM
            user_profiles
        WHERE
            id = auth.uid()
            AND role = 'admin'
    )
);

-- Add admin policies for raffle_items
CREATE POLICY "Enable insert for admin users only" ON public.raffle_items FOR INSER (
    SELECT
        1
    WHERE
        id = auth.uid ()
        AND role = 'admin'
)
);

CREATE POLICY "Enable update for admin users only" ON public.raffle_items FOR
UPDATE
    USING (
        EXISTS (
            SELECT
                1
            FROM
                user_profiles
            WHERE
                id = auth.uid()
                AND role = 'admin'
        )
    );

CREATE POLICY "Enable delete for admin users only" ON public.raffle_items FOR DELETE USING (
    EXISTS (
        SELECT
            1
        FROM
            user_profiles
        WHERE
            id = auth.uid()
            AND role = 'admin'
    )
);

-- Create indexes
CREATE INDEX idx_raffle_items_event_id ON public.raffle_items(event_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    event_id UUID REFERENCES public.raffle_events (id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    customer_city TEXT,
    customer_state TEXT,
    customer_zip TEXT,
    total_amount DECIMAL (10, 2) NOT NULL,
    total_tickets INTEGER NOT NULL,
    customer_country TEXT,
    is_international BOOLEAN DEFAULT false,
    age_confirmed BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'paid',
            'cancelled',
            'refunded'
        )
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW (),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW ()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    order_id UUID REFERENCES public.orders (id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.raffle_items (id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL (10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW ()
);

-- Add updated_at trigger for orders
CREATE TRIGGER set_updated_at_orders BEFORE
UPDATE
    ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at ();

-- Enable RLS for orders and order_items
ALTER TABLE
    public.orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    public.order_items ENABLE ROW LEVEL SECURITY;

-- Read access for all users (customize as needed)
CREATE POLICY "Enable read access for all users" ON public.orders FOR
SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON public.orders FOR
INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for admin users only" ON public.orders FOR
UPDATE
    USING (
        EXISTS (
            SELECT
                1
            FROM
                user_profiles
            WHERE
                id = auth.uid()
                AND role = 'admin'
        )
    );

CREATE POLICY "Enable delete for admin users only" ON public.orders FOR DELETE USING (
    EXISTS (
        SELECT
            1
        FROM
            user_profiles
        WHERE
            id = auth.uid()
            AND role = 'admin'
    )
);

CREATE POLICY "Enable read access for all users" ON public.order_items FOR
SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON public.order_items FOR
INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for admin users only" ON public.order_items FOR
UPDATE
    USING (
        EXISTS (
            SELECT
                1
            FROM
                user_profiles
            WHERE
                id = auth.uid()
                AND role = 'admin'
        )
    );

CREATE POLICY "Enable delete for admin users only" ON public.order_items FOR DELETE USING (
    EXISTS (
        SELECT
            1
        FROM
            user_profiles
        WHERE
            id = auth.uid()
            AND role = 'admin'
    )
);