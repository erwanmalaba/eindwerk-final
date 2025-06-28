/*
  # Create Progress Metrics Table

  1. New Tables
    - `progress_metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `metric_type` (text)
      - `current_value` (decimal)
      - `previous_value` (decimal)
      - `target_value` (decimal)
      - `unit` (text)
      - `recorded_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `progress_metrics` table
    - Add policy for authenticated users to manage their own progress data
*/

-- Create progress_metrics table
CREATE TABLE IF NOT EXISTS progress_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  current_value DECIMAL(10,2) NOT NULL,
  previous_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  target_value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for progress_metrics
CREATE POLICY "Users can manage own progress metrics" 
ON progress_metrics FOR ALL 
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_progress_metrics_user_date 
ON progress_metrics(user_id, recorded_date DESC);

CREATE INDEX IF NOT EXISTS idx_progress_metrics_user_type 
ON progress_metrics(user_id, metric_type);