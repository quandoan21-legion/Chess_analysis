# Chess Improvement Web App

AI-powered chess analysis platform that uses Stockfish to analyze your Chess.com games and provide personalized improvement recommendations.

## Features

- **Stockfish Analysis**: Analyze every move with the powerful Stockfish engine
- **Pattern Detection**: Identify recurring weaknesses in your play
- **Personalized Coaching**: Get actionable training recommendations
- **Beautiful UI**: Modern dark-mode dashboard with glassmorphism design
- **Real-time Progress**: Track analysis progress in real-time
- **Detailed Insights**: Game-by-game breakdown with accuracy metrics

## Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- Vite
- Lucide Icons

### Backend
- FastAPI
- python-chess
- Stockfish engine
- httpx

### Database
- Supabase (PostgreSQL)

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+
- Stockfish engine

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

### Backend Setup

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Install Stockfish:
   - **macOS**: `brew install stockfish`
   - **Ubuntu**: `apt-get install stockfish`
   - **Windows**: Download from https://stockfishchess.org/download/

3. Run the API server:
```bash
python main.py
```

The backend will run on http://localhost:8000

## Usage

1. Enter your Chess.com username
2. Select analysis depth (higher = more accurate but slower)
3. Choose number of games to analyze
4. Click "Start Analysis"
5. Wait for results (typically 2-5 minutes)
6. Review your weaknesses and training plan

## Analysis Categories

### Weakness Detection
- **Opening Weakness**: Early-game blunders and mistakes
- **Tactical Blindness**: Missing tactical opportunities
- **Endgame Weakness**: Poor endgame technique
- **Positional Weakness**: Gradual evaluation decline
- **Time Pressure**: Late-game errors

### Move Classification
- **Good**: < 50 centipawn loss
- **Inaccuracy**: 50-99 centipawn loss
- **Mistake**: 100-299 centipawn loss
- **Blunder**: ≥ 300 centipawn loss

## Environment Variables

Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Build for Production

```bash
npm run build
```

## License

MIT
