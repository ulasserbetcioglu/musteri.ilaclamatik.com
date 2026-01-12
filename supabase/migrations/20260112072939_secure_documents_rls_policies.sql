/*
  # Secure Documents RLS Policies
  
  ## Security Issue
  
  The "Allow authenticated users to read all documents" policy with USING (true) 
  allows any authenticated user to see all documents, including private visit photos.
  
  ## Changes
  
  1. Drop the insecure "read all documents" policy
  2. Add specific policies for different document types:
     - Public/general MSDS and license documents (accessible to all authenticated users)
     - Visit photos (only accessible to the customer/branch that owns the visit)
  
  ## Security Policies
  
  - MSDS and license documents marked as 'public' or 'general' are visible to all authenticated users
  - Visit photos are only visible to the customer/branch associated with that visit
  - Admin retains full access
*/

-- Drop the insecure policy that allows all authenticated users to read all documents
DROP POLICY IF EXISTS "Allow authenticated users to read all documents" ON documents;

-- Policy for public/general MSDS and license documents
CREATE POLICY "Authenticated users can view public MSDS and license documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    document_type IN ('msds', 'license', 'ruhsat')
    AND entity_type IN ('public', 'general')
  );

-- Policy for customers to view visit photos from their own visits
CREATE POLICY "Customers can view photos from their visits"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    document_type = 'report_photo'
    AND entity_type = 'visit'
    AND EXISTS (
      SELECT 1
      FROM visits v
      INNER JOIN customers c ON c.id = v.customer_id
      WHERE v.id = documents.entity_id
        AND c.auth_id = auth.uid()
    )
  );

-- Policy for branches to view visit photos from their own visits
CREATE POLICY "Branches can view photos from their visits"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    document_type = 'report_photo'
    AND entity_type = 'visit'
    AND EXISTS (
      SELECT 1
      FROM visits v
      INNER JOIN branches b ON b.id = v.branch_id
      WHERE v.id = documents.entity_id
        AND b.auth_id = auth.uid()
    )
  );

-- Admin can still view all documents (existing policies remain)
