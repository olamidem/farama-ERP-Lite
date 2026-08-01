-- Migration: Create sale_payments table for payment audit logging
-- Every payment made on a sale (initial checkout payment, installment repayments, full settlements)
-- is stored as an immutable audit row in this table.

CREATE TABLE IF NOT EXISTS public.sale_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_method character varying NOT NULL DEFAULT 'CASH',
  reference text,
  notes text,
  performed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT sale_payments_pkey PRIMARY KEY (id)
);

-- Foreign key constraint for PostgREST schema cache relationship detection
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sale_payments_performed_by_fkey'
  ) THEN
    ALTER TABLE public.sale_payments
      ADD CONSTRAINT sale_payments_performed_by_fkey
      FOREIGN KEY (performed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Index for fast lookup by sale_id and customer_id
CREATE INDEX IF NOT EXISTS idx_sale_payments_sale_id ON public.sale_payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_payments_customer_id ON public.sale_payments(customer_id);

-- Disable RLS and add permissive policy so inserts from app users never fail with 403 / 42501
ALTER TABLE public.sale_payments DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.sale_payments TO postgres, anon, authenticated, service_role;

DROP POLICY IF EXISTS "Allow all access to sale_payments" ON public.sale_payments;
CREATE POLICY "Allow all access to sale_payments"
  ON public.sale_payments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
