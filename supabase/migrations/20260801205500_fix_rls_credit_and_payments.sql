-- Migration: Fix Row-Level Security (RLS) 403 Forbidden errors (42501)
-- Enables full access for authenticated and anonymous users on customer_credit_transactions and sale_payments.

-- 1. Table: customer_credit_transactions
ALTER TABLE public.customer_credit_transactions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.customer_credit_transactions TO postgres, anon, authenticated, service_role;

DROP POLICY IF EXISTS "Allow all access to customer_credit_transactions" ON public.customer_credit_transactions;
CREATE POLICY "Allow all access to customer_credit_transactions"
  ON public.customer_credit_transactions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 2. Table: sale_payments
ALTER TABLE public.sale_payments DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.sale_payments TO postgres, anon, authenticated, service_role;

DROP POLICY IF EXISTS "Allow all access to sale_payments" ON public.sale_payments;
CREATE POLICY "Allow all access to sale_payments"
  ON public.sale_payments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
