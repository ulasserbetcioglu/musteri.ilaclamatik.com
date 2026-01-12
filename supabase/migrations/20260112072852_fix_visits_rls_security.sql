/*
  # Fix Visits RLS Security Issue
  
  ## Critical Security Fix
  
  This migration fixes a severe security vulnerability where all users could see all visits
  regardless of their customer/branch association.
  
  ## Changes
  
  1. Drop the insecure public policy that allows everyone to see all visits
  2. Add secure policies for customers to see only their visits
  3. Add secure policies for branches to see only their visits
  
  ## Security Policies
  
  - Customers can only SELECT visits where visit.customer_id matches their customer record
  - Branches can only SELECT visits where visit.branch_id matches their branch record
  - Admin and operators retain their existing access
*/

-- Drop the dangerous public read policy that allows everyone to see everything
DROP POLICY IF EXISTS "Enable public read access to visits by customer or branch" ON visits;

-- Drop the insecure public insert policy
DROP POLICY IF EXISTS "Allow public insert on visits" ON visits;

-- Create secure policy for customers to read only their own visits
CREATE POLICY "Customers can view their own visits"
  ON visits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM customers c
      WHERE c.auth_id = auth.uid()
        AND c.id = visits.customer_id
    )
  );

-- Create secure policy for branches to read only their own visits
CREATE POLICY "Branches can view their own visits"
  ON visits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM branches b
      WHERE b.auth_id = auth.uid()
        AND b.id = visits.branch_id
    )
  );
