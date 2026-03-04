/*
  # Chess Improvement App Database Schema

  1. New Tables
    - `analysis_sessions`
      - `id` (uuid, primary key)
      - `username` (text) - Chess.com username
      - `status` (text) - pending, analyzing, completed, failed
      - `games_analyzed` (integer) - Number of games processed
      - `overall_accuracy` (numeric) - Overall play accuracy percentage
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
    
    - `game_analyses`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `game_url` (text) - Chess.com game URL
      - `pgn` (text) - Full PGN notation
      - `result` (text) - Game result
      - `player_color` (text) - white or black
      - `accuracy` (numeric) - Game accuracy
      - `blunders` (integer)
      - `mistakes` (integer)
      - `inaccuracies` (integer)
      - `analyzed_at` (timestamptz)
    
    - `weaknesses`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `weakness_type` (text) - Opening, Tactical, Endgame, Positional, Time
      - `severity` (text) - Low, Medium, High
      - `description` (text)
      - `recommendation` (text)
      - `detected_at` (timestamptz)
    
    - `training_plans`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `exercise` (text)
      - `priority` (integer)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Public read access for demonstration purposes
*/

CREATE TABLE IF NOT EXISTS analysis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  games_analyzed integer DEFAULT 0,
  overall_accuracy numeric(5,2),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS game_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  game_url text,
  pgn text,
  result text,
  player_color text,
  accuracy numeric(5,2),
  blunders integer DEFAULT 0,
  mistakes integer DEFAULT 0,
  inaccuracies integer DEFAULT 0,
  analyzed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weaknesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  weakness_type text NOT NULL,
  severity text NOT NULL,
  description text NOT NULL,
  recommendation text NOT NULL,
  detected_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  exercise text NOT NULL,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE weaknesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read analysis sessions"
  ON analysis_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert analysis sessions"
  ON analysis_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update analysis sessions"
  ON analysis_sessions FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Public can read game analyses"
  ON game_analyses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert game analyses"
  ON game_analyses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read weaknesses"
  ON weaknesses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert weaknesses"
  ON weaknesses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read training plans"
  ON training_plans FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert training plans"
  ON training_plans FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_game_analyses_session ON game_analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_weaknesses_session ON weaknesses(session_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_session ON training_plans(session_id);
