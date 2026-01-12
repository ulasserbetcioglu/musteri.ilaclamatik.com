/*
  # Create waste disposal records table

  1. New Tables
    - `waste_disposal_records`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key to customers)
      - `tarih` (date) - Disposal date
      - `atik_turu` (text) - Waste type
      - `miktar` (text) - Amount
      - `bertaraf_firmasi` (text) - Disposal company
      - `belge_no` (text) - Document number
      - `notlar` (text, optional) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `waste_disposal_records` table
    - Add policy for authenticated users to read all records
    - Add policy for authenticated users to insert/update records
*/

CREATE TABLE IF NOT EXISTS waste_disposal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  tarih date DEFAULT CURRENT_DATE NOT NULL,
  atik_turu text DEFAULT '' NOT NULL,
  miktar text DEFAULT '',
  bertaraf_firmasi text DEFAULT '',
  belge_no text DEFAULT '',
  notlar text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE waste_disposal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view waste disposal records"
  ON waste_disposal_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert waste disposal records"
  ON waste_disposal_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update waste disposal records"
  ON waste_disposal_records
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete waste disposal records"
  ON waste_disposal_records
  FOR DELETE
  TO authenticated
  USING (true);

-- Add index for faster customer lookups
CREATE INDEX IF NOT EXISTS idx_waste_disposal_customer_id ON waste_disposal_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_waste_disposal_tarih ON waste_disposal_records(tarih DESC);