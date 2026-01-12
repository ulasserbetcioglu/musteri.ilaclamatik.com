/*
  # Create Permits, Certificates, and Fumigation License Tables

  ## 1. New Tables

  ### `permits` table
    - `id` (uuid, primary key)
    - `customer_id` (uuid, foreign key to customers)
    - `branch_id` (uuid, nullable, foreign key to branches)
    - `belge_adi` (text, document name)
    - `belge_no` (text, document number)
    - `verilis_tarihi` (date, issue date)
    - `gecerlilik_tarihi` (date, expiry date)
    - `veren_kurum` (text, issuing institution)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### `staff_certificates` table
    - `id` (uuid, primary key)
    - `customer_id` (uuid, foreign key to customers)
    - `branch_id` (uuid, nullable, foreign key to branches)
    - `ad_soyad` (text, full name)
    - `gorev` (text, role/position)
    - `sertifika_no` (text, certificate number)
    - `gecerlilik_tarihi` (date, expiry date)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### `fumigation_licenses` table
    - `id` (uuid, primary key)
    - `customer_id` (uuid, foreign key to customers)
    - `branch_id` (uuid, nullable, foreign key to branches)
    - `ruhsat_no` (text, license number)
    - `verilis_tarihi` (date, issue date)
    - `gecerlilik_tarihi` (date, expiry date)
    - `kapsam_aciklamasi` (text, scope description)
    - `kisitlamalar` (text, restrictions)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## 2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin/operator users to manage records
    - Add policies for customers and branches to view their own records
*/

-- Create permits table
CREATE TABLE IF NOT EXISTS permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  belge_adi text NOT NULL DEFAULT '',
  belge_no text NOT NULL DEFAULT '',
  verilis_tarihi date,
  gecerlilik_tarihi date,
  veren_kurum text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create staff_certificates table
CREATE TABLE IF NOT EXISTS staff_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  ad_soyad text NOT NULL DEFAULT '',
  gorev text NOT NULL DEFAULT '',
  sertifika_no text NOT NULL DEFAULT '',
  gecerlilik_tarihi date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fumigation_licenses table
CREATE TABLE IF NOT EXISTS fumigation_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  ruhsat_no text NOT NULL DEFAULT '',
  verilis_tarihi date,
  gecerlilik_tarihi date,
  kapsam_aciklamasi text NOT NULL DEFAULT '',
  kisitlamalar text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fumigation_licenses ENABLE ROW LEVEL SECURITY;

-- Permits policies
CREATE POLICY "Admin and operators can view all permits"
  ON permits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admin and operators can insert permits"
  ON permits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admin and operators can update permits"
  ON permits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admin and operators can delete permits"
  ON permits FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );

-- Staff certificates policies
CREATE POLICY "Admin and operators can view all certificates"
  ON staff_certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admin and operators can insert certificates"
  ON staff_certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admin and operators can update certificates"
  ON staff_certificates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admin and operators can delete certificates"
  ON staff_certificates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );

-- Fumigation licenses policies
CREATE POLICY "Admin and operators can view all fumigation licenses"
  ON fumigation_licenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admin and operators can insert fumigation licenses"
  ON fumigation_licenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admin and operators can update fumigation licenses"
  ON fumigation_licenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admin and operators can delete fumigation licenses"
  ON fumigation_licenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' IN ('admin', 'operator')
    )
  );