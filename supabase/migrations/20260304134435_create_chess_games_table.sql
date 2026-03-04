/*
  # Create chess_games table

  1. New Tables
    - `chess_games`
      - `id` (bigint, primary key, auto-increment)
      - `month` (integer) - Month of the game
      - `year` (integer) - Year of the game
      - `url` (text, unique) - Chess.com game URL
      - `pgn` (text) - Portable Game Notation of the game
      - `time_control` (text) - Time control settings
      - `rated` (boolean) - Whether the game was rated
      - `time_class` (text) - Time class (bullet, blitz, rapid, etc)
      - `rules` (text) - Game rules/variant
      - `white_rating` (integer) - White player's rating
      - `white_result` (text) - White player's result
      - `white_username` (text) - White player's username
      - `black_rating` (integer) - Black player's rating
      - `black_result` (text) - Black player's result
      - `black_username` (text) - Black player's username
      - `created_at` (timestamptz) - When the record was created

  2. Security
    - Enable RLS on `chess_games` table
    - Add policy for public read access (anyone can view games)
    - Add policy for service role to insert games (via Edge Function)

  3. Indexes
    - Index on `url` for fast lookups and duplicate prevention
    - Index on `year` and `month` for filtering
    - Index on `white_username` and `black_username` for player searches
*/

CREATE TABLE IF NOT EXISTS chess_games (
  id bigserial PRIMARY KEY,
  month integer NOT NULL,
  year integer NOT NULL,
  url text UNIQUE NOT NULL,
  pgn text NOT NULL,
  time_control text NOT NULL,
  rated boolean DEFAULT true,
  time_class text NOT NULL,
  rules text NOT NULL,
  white_rating integer NOT NULL,
  white_result text NOT NULL,
  white_username text NOT NULL,
  black_rating integer NOT NULL,
  black_result text NOT NULL,
  black_username text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chess_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chess games"
  ON chess_games
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can insert games"
  ON chess_games
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_chess_games_url ON chess_games(url);
CREATE INDEX IF NOT EXISTS idx_chess_games_year_month ON chess_games(year, month);
CREATE INDEX IF NOT EXISTS idx_chess_games_white_username ON chess_games(white_username);
CREATE INDEX IF NOT EXISTS idx_chess_games_black_username ON chess_games(black_username);
