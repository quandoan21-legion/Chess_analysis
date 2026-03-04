# Chess Improvement App

AI-powered chess analysis platform that analyzes your Chess.com games and provides personalized improvement recommendations with user authentication.

## Features

- **User Authentication**: Secure login and registration with Supabase Auth
- **Chess.com Integration**: Fetch and analyze your recent games
- **Stockfish Analysis**: Deep chess engine analysis of every move
- **Pattern Detection**: Identify recurring weaknesses in your gameplay
- **Personalized Training**: Get actionable recommendations based on your weaknesses
- **Game Statistics**: Track your performance across multiple games
- **Modern UI**: Clean, responsive design with dark theme

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase Client
- Chess.com Public API

**Backend**
- Python 3.9+
- FastAPI
- python-chess
- Stockfish engine
- Supabase Python Client

**Database**
- Supabase (PostgreSQL)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Python Backend Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install Stockfish Engine

**macOS:**
```bash
brew install stockfish
```

**Ubuntu/Debian:**
```bash
sudo apt-get install stockfish
```

**Windows:**
Download from [stockfishchess.org](https://stockfishchess.org/download/)

### 4. Start the Backend Server

```bash
python backend/main.py
```

The backend API will run on `http://localhost:8000`

### 5. Start the Frontend Development Server

In a new terminal:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## How to Use

1. **Create an Account**: Click "Sign In" and create a new account
2. **Enter Username**: Enter your Chess.com username
3. **Select Games**: Choose how many recent games to analyze (1-50)
4. **Configure Analysis**: Set the Stockfish depth (higher = more accurate but slower)
5. **Analyze**: Click "Analyze Games" and wait for results
6. **Review**: View your weaknesses, game statistics, and personalized training plan

## Analysis Features

### Weakness Categories

- **Opening Weakness**: Errors in the first 10 moves
- **Tactical Blindness**: Missed tactical opportunities (forks, pins, skewers)
- **Endgame Weakness**: Poor technique in simplified positions
- **Positional Weakness**: Gradual position deterioration
- **Time Pressure**: Errors when time is running low

### Move Quality Classification

- **Good Move**: Less than 50 centipawn loss
- **Inaccuracy**: 50-99 centipawn loss
- **Mistake**: 100-299 centipawn loss
- **Blunder**: 300+ centipawn loss

## Project Structure

```
chess-improvement-app/
├── src/
│   ├── components/         # React components
│   ├── services/          # API services
│   └── types.ts           # TypeScript types
├── backend/
│   ├── main.py            # FastAPI server
│   ├── analyzer.py        # Stockfish analysis
│   ├── chess_client.py    # Chess.com API client
│   ├── weakness_detector.py # Pattern detection
│   └── supabase_client.py # Database operations
├── supabase/
│   └── migrations/        # Database migrations
└── package.json
```

## Environment Variables

The `.env` file contains:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Building for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory.

## Troubleshooting

**Backend won't start:**
- Ensure Python 3.9+ is installed
- Check that Stockfish is installed and in your PATH
- Verify all Python dependencies are installed

**Frontend errors:**
- Run `npm install` to ensure all dependencies are installed
- Clear browser cache and reload
- Check that backend is running on port 8000

**Analysis fails:**
- Verify the Chess.com username is correct
- Ensure the user has played games on Chess.com
- Check backend logs for Stockfish errors

## License

MIT
