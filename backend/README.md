# Chess Improvement API Backend

FastAPI backend for analyzing chess games using Stockfish engine.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install Stockfish:
   - **macOS**: `brew install stockfish`
   - **Ubuntu/Debian**: `apt-get install stockfish`
   - **Windows**: Download from https://stockfishchess.org/download/

3. Set environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SUPABASE_ANON_KEY=your_supabase_key
```

4. Run the server:
```bash
python main.py
```

The API will be available at http://localhost:8000

## API Endpoints

### POST /api/analyze
Start a new analysis for a Chess.com username.

Request body:
```json
{
  "username": "hikaru",
  "depth": 15,
  "max_games": 10
}
```

Response:
```json
{
  "session_id": "uuid",
  "status": "analyzing",
  "message": "Analysis started"
}
```

### GET /api/analysis/{session_id}
Get analysis results for a session.

Response includes:
- Session metadata
- Game analyses
- Detected weaknesses
- Training plan

## Analysis Process

1. Fetch recent games from Chess.com
2. Parse PGN and extract moves
3. Analyze each move with Stockfish
4. Calculate centipawn loss
5. Classify moves (Good, Inaccuracy, Mistake, Blunder)
6. Detect patterns across games
7. Generate personalized recommendations
