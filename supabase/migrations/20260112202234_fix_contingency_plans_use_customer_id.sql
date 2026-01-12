/*
  # Fix Contingency Plans to use customer_id instead of customer_document_id

  1. Changes
    - Drop customer_document_id column
    - Add customer_id column with reference to customers table
    - Update index

  2. Reason
    - Simplify data model to match other forms like WasteDisposal
    - Make it easier to query contingency plans by customer
*/

-- Drop old column and index
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'customer_document_id') THEN
    DROP INDEX IF EXISTS idx_contingency_plans_customer_document_id;
    ALTER TABLE contingency_plans DROP COLUMN customer_document_id;
  END IF;
END $$;

-- Add customer_id column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'customer_id') THEN
    ALTER TABLE contingency_plans ADD COLUMN customer_id uuid REFERENCES customers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create new index
CREATE INDEX IF NOT EXISTS idx_contingency_plans_customer_id 
  ON contingency_plans(customer_id);