-- Create function to generate order number
-- This function generates sequential order numbers in the format YYYY-NNNNNN,
-- where:
--   YYYY   = Current year (e.g. 2024)
--   NNNNNN = 6-digit sequential number (e.g. 000001)
--
-- Example outputs: 2024-000001, 2024-000002, 2024-000003, etc.
-- Numbers reset each year, so after 2024-999999 comes 2025-000001
--
-- The function is triggered automatically before INSERT on the orders table
CREATE
OR REPLACE FUNCTION public.generate_order_number() RETURNS TRIGGER AS $$
DECLARE
    year TEXT;
    last_order_number TEXT;
    new_number INTEGER;
BEGIN
    -- Get current year (e.g. '2024')
    year := TO_CHAR(CURRENT_DATE, 'YYYY');

    -- Find the most recent order number for this year
    -- e.g. if year is 2024, looks for latest '2024-NNNNNN'
    SELECT
        order_number INTO last_order_number
    FROM
        public.orders
    WHERE
        order_number LIKE year || '-%'
    ORDER BY
        order_number DESC
    LIMIT
        1;

    -- Extract the number part and increment
    IF last_order_number IS NULL THEN new_number := 1;

    ELSE new_number := CAST(SPLIT_PART(last_order_number, '-', 2) AS INTEGER) + 1;

    END IF;

    -- Set the new order number with 6 digits
    NEW.order_number := year || '-' || LPAD(new_number :: TEXT, 6, '0');

    RETURN NEW;

END;

$$ LANGUAGE plpgsql;

-- Create trigger to automatically set order number
DROP TRIGGER IF EXISTS set_order_number ON public.orders;

CREATE TRIGGER set_order_number BEFORE
INSERT
    ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();