# Chess Analyzer Setup Guide

This is a modern React/Vite web application for analyzing Chess.com games with a Supabase backend.

## Prerequisites

- Node.js 16+ installed
- A Supabase account and project

## Setup Instructions

### 1. Database Setup

Go to your Supabase project's SQL Editor and run the following migration:

```sql
/*
  # Chess Games Database Schema

  ## Overview
  Creates the database structure for storing and analyzing chess games from Chess.com.

  ## Tables Created

  ### chess_games
  Stores individual chess game records with complete game information.

  **Columns:**
  - id - Unique identifier (auto-increment)
  - month - Month the game was played (1-12)
  - year - Year the game was played
  - url - Chess.com URL to the game
  - pgn - Portable Game Notation (full game moves)
  - time_control - Time control format (e.g., "600+5")
  - rated - Whether the game was rated
  - time_class - Category: rapid, blitz, bullet, daily
  - rules - Game rules variant
  - white_rating - White player's rating
  - white_result - White player's result (win/loss/draw)
  - white_username - White player's username
  - black_rating - Black player's rating
  - black_result - Black player's result (win/loss/draw)
  - black_username - Black player's username
  - created_at - Record creation timestamp

  ## Security

  1. Row Level Security (RLS) is enabled
  2. Public read access - chess games are public data

  ## Performance

  Indexes are created on frequently queried columns:
  - year/month for time-based queries
  - usernames for player-specific analysis
  - time_class for filtering by game type
*/

-- Create chess_games table
CREATE TABLE IF NOT EXISTS chess_games (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    month integer,
    year integer,
    url text,
    pgn text,
    time_control text,
    rated boolean DEFAULT true,
    time_class text,
    rules text,
    white_rating integer,
    white_result text,
    white_username text,
    black_rating integer,
    black_result text,
    black_username text,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chess_games ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read the data (public chess game data)
CREATE POLICY "Anyone can read chess games"
    ON chess_games
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Create policy to allow authenticated users to insert games
CREATE POLICY "Authenticated users can insert chess games"
    ON chess_games
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chess_games_year_month ON chess_games (year, month);
CREATE INDEX IF NOT EXISTS idx_chess_games_white_username ON chess_games (white_username);
CREATE INDEX IF NOT EXISTS idx_chess_games_black_username ON chess_games (black_username);
CREATE INDEX IF NOT EXISTS idx_chess_games_time_class ON chess_games (time_class);
CREATE INDEX IF NOT EXISTS idx_chess_games_created_at ON chess_games (created_at DESC);
```

### 2. Import Existing Data (Optional)

If you have existing CSV data from the Streamlit version, you can import it:

1. Go to Supabase Dashboard > Table Editor
2. Select the `chess_games` table
3. Click "Insert" > "Import data from CSV"
4. Upload your `data.csv` file
5. Map the CSV columns to the database columns

### 3. Environment Variables

The `.env` file is already configured with your Supabase credentials:

```
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 6. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Features

- **Home Page**: Overview of the project with features and contributor info
- **Analysis Page**: Detailed analysis of games for the default user (CodingGambit)
- **User Analysis Page**: Search and analyze any Chess.com username
- **Interactive Charts**: Beautiful visualizations using Recharts
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- React 19
- Vite 7
- Supabase (Database & Authentication)
- Recharts (Data Visualization)
- Lucide React (Icons)

## Next Steps

To add more features, consider:

1. **Edge Function for Chess.com API**: Create a Supabase Edge Function to fetch games directly from Chess.com API
2. **Real-time Updates**: Use Supabase Realtime to show live game additions
3. **User Authentication**: Allow users to save favorite players and custom analyses
4. **Advanced Filters**: Add date ranges, rating ranges, and result filters
5. **Opening Analysis**: Analyze most common openings and their success rates

## License

MIT License - see LICENSE file for details
