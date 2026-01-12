/*
  # Update Contingency Plans Table Structure

  1. Changes
    - Drop old columns
    - Add document_id reference to customer_documents
    - Add date field
    - Add entries jsonb field to store multiple contingency plan entries
    - Update indexes and constraints

  2. Security
    - Maintain existing RLS policies
*/

-- Drop old columns
DO $$ 
BEGIN
  -- Drop columns if they exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'customer_id') THEN
    ALTER TABLE contingency_plans DROP COLUMN IF EXISTS customer_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'scenario_number') THEN
    ALTER TABLE contingency_plans DROP COLUMN IF EXISTS scenario_number;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'danger_description') THEN
    ALTER TABLE contingency_plans DROP COLUMN IF EXISTS danger_description;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'detection_method') THEN
    ALTER TABLE contingency_plans DROP COLUMN IF EXISTS detection_method;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'critical_limit') THEN
    ALTER TABLE contingency_plans DROP COLUMN IF EXISTS critical_limit;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'responsible_party') THEN
    ALTER TABLE contingency_plans DROP COLUMN IF EXISTS responsible_party;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'corrective_actions') THEN
    ALTER TABLE contingency_plans DROP COLUMN IF EXISTS corrective_actions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'record_type') THEN
    ALTER TABLE contingency_plans DROP COLUMN IF EXISTS record_type;
  END IF;
END $$;

-- Add new columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'customer_document_id') THEN
    ALTER TABLE contingency_plans ADD COLUMN customer_document_id uuid REFERENCES customer_documents(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'date') THEN
    ALTER TABLE contingency_plans ADD COLUMN date date DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contingency_plans' AND column_name = 'entries') THEN
    ALTER TABLE contingency_plans ADD COLUMN entries jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contingency_plans_customer_document_id 
  ON contingency_plans(customer_document_id);