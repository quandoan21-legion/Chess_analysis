/*
  # Add User Authentication and Profile Management

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `chess_com_username` (text) - Linked Chess.com username
      - `email` (text) - User email
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Changes to Existing Tables
    - Add `user_id` column to `analysis_sessions` to link sessions to users
  
  3. Security
    - Enable RLS on `user_profiles`
    - Users can only read and update their own profile
    - Update RLS policies on analysis tables to check user ownership
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  chess_com_username text,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE analysis_sessions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public can read analysis sessions" ON analysis_sessions;
DROP POLICY IF EXISTS "Public can insert analysis sessions" ON analysis_sessions;
DROP POLICY IF EXISTS "Public can update analysis sessions" ON analysis_sessions;

CREATE POLICY "Users can read own sessions"
  ON analysis_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anon can read sessions"
  ON analysis_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own sessions"
  ON analysis_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert sessions"
  ON analysis_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own sessions"
  ON analysis_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anon can update sessions"
  ON analysis_sessions FOR UPDATE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user ON analysis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(chess_com_username);
