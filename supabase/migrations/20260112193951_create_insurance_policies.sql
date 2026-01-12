/*
  # Create insurance policies table

  1. New Tables
    - `insurance_policies`
      - `id` (uuid, primary key)
      - `policy_no` (text) - Policy number
      - `sigorta_sirketi` (text) - Insurance company
      - `baslangic_tarihi` (date) - Start date
      - `bitis_tarihi` (date) - End date
      - `teminat_tutari` (text) - Coverage amount
      - `para_birimi` (text) - Currency (TL, USD, EUR)
      - `kapsam` (text) - Coverage details
      - `broker_adi` (text, optional) - Broker name
      - `notlar` (text, optional) - Additional notes
      - `is_active` (boolean) - Active status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `insurance_policies` table
    - Add policies for authenticated users (company-wide info)

  Note: Insurance is typically company-wide, not customer-specific
*/

CREATE TABLE IF NOT EXISTS insurance_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_no text DEFAULT '' NOT NULL,
  sigorta_sirketi text DEFAULT '' NOT NULL,
  baslangic_tarihi date DEFAULT CURRENT_DATE NOT NULL,
  bitis_tarihi date DEFAULT CURRENT_DATE NOT NULL,
  teminat_tutari text DEFAULT '0',
  para_birimi text DEFAULT 'TL',
  kapsam text DEFAULT '',
  broker_adi text DEFAULT '',
  notlar text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view insurance policies"
  ON insurance_policies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert insurance policies"
  ON insurance_policies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update insurance policies"
  ON insurance_policies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete insurance policies"
  ON insurance_policies
  FOR DELETE
  TO authenticated
  USING (true);

-- Add index for active policies
CREATE INDEX IF NOT EXISTS idx_insurance_policies_active ON insurance_policies(is_active, bitis_tarihi DESC);