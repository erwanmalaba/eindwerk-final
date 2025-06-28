/*
  # Create Schedule Items Table

  1. New Tables
    - `schedule_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `date` (date)
      - `time` (time)
      - `duration` (integer, in minutes)
      - `type` (text)
      - `completed` (boolean)
      - `reminder` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `schedule_items` table
    - Add policies for authenticated users to manage their own schedule items

  3. Indexes
    - Add indexes for better query performance
*/

-- Create schedule_items table
CREATE TABLE IF NOT EXISTS schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER DEFAULT 30, -- in minutes
  type TEXT DEFAULT 'General',
  completed BOOLEAN DEFAULT FALSE,
  reminder BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;

-- Create policies for schedule_items
CREATE POLICY "Users can manage own schedule items" 
ON schedule_items FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_schedule_items_user_date 
ON schedule_items(user_id, date ASC);

CREATE INDEX IF NOT EXISTS idx_schedule_items_user_type 
ON schedule_items(user_id, type);

CREATE INDEX IF NOT EXISTS idx_schedule_items_user_completed 
ON schedule_items(user_id, completed);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_schedule_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS schedule_items_updated_at ON schedule_items;
CREATE TRIGGER schedule_items_updated_at
  BEFORE UPDATE ON schedule_items
  FOR EACH ROW EXECUTE PROCEDURE update_schedule_items_updated_at();