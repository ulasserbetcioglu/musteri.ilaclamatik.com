/*
  # Add Customer and Branch View Policies for Documents
  
  ## Changes
  
  This migration adds policies so customers and branches can view their assigned documents.
  
  ## Security Policies
  
  1. Customers can view documents assigned to them
  2. Branches can view documents assigned to them
  3. Existing admin policies remain unchanged
*/

-- Allow customers to view their own documents
CREATE POLICY "Customers can view their assigned documents"
  ON customer_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM customers c
      WHERE c.auth_id = auth.uid()
        AND c.id = customer_documents.customer_id
    )
  );

-- Allow branches to view their assigned documents
CREATE POLICY "Branches can view their assigned documents"
  ON customer_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM branches b
      WHERE b.auth_id = auth.uid()
        AND b.id = customer_documents.branch_id
    )
  );
