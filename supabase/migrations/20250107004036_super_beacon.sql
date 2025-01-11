/*
  # Initial Club Management Schema

  1. New Tables
    - `members`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text)
      - `points` (integer)
      - `level` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `workshops`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `points` (integer)
      - `min_level` (integer)
      - `date` (timestamp)
      - `created_at` (timestamp)
    
    - `attendances`
      - `id` (uuid, primary key)
      - `member_id` (uuid, references members)
      - `workshop_id` (uuid, references workshops)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for admin users

  3. Functions
    - Function to calculate member levels based on points
*/

-- Create tables
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

CREATE TABLE workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  points integer DEFAULT 10,
  min_level integer DEFAULT 1,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members NOT NULL,
  workshop_id uuid REFERENCES workshops NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(member_id, workshop_id)
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- Create admin role
CREATE ROLE admin;

-- Policies for members table
CREATE POLICY "Members can view their own data"
  ON members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all members"
  ON members
  FOR ALL
  TO admin
  USING (true);

-- Policies for workshops table
CREATE POLICY "Anyone can view workshops"
  ON workshops
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage workshops"
  ON workshops
  FOR ALL
  TO admin
  USING (true);

-- Policies for attendances table
CREATE POLICY "Members can view their own attendance"
  ON attendances
  FOR SELECT
  TO authenticated
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can mark their own attendance"
  ON attendances
  FOR INSERT
  TO authenticated
  WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage attendance"
  ON attendances
  FOR ALL
  TO admin
  USING (true);

-- Function to update member level based on points
CREATE OR REPLACE FUNCTION update_member_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := CASE
    WHEN NEW.points >= 1000 THEN 5
    WHEN NEW.points >= 500 THEN 4
    WHEN NEW.points >= 250 THEN 3
    WHEN NEW.points >= 100 THEN 2
    ELSE 1
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update level when points change
CREATE TRIGGER update_member_level_trigger
  BEFORE INSERT OR UPDATE OF points
  ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_member_level();
