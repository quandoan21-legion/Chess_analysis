from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

from chess_client import ChessComClient
from analyzer import ChessAnalyzer
from weakness_detector import WeaknessDetector
from supabase_client import SupabaseClient

app = FastAPI(title="Chess Improvement API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    username: str
    depth: int = 15
    max_games: int = 10

class AnalysisResponse(BaseModel):
    session_id: str
    status: str
    message: str

supabase_client = SupabaseClient()

@app.get("/")
async def root():
    return {"message": "Chess Improvement API", "version": "1.0.0"}

@app.post("/api/analyze", response_model=AnalysisResponse)
async def start_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks):
    try:
        session = supabase_client.create_session(request.username)
        session_id = session['id']

        background_tasks.add_task(
            run_analysis,
            session_id,
            request.username,
            request.depth,
            request.max_games
        )

        return AnalysisResponse(
            session_id=session_id,
            status="analyzing",
            message=f"Analysis started for {request.username}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analysis/{session_id}")
async def get_analysis(session_id: str):
    try:
        result = supabase_client.get_full_analysis(session_id)
        if not result:
            raise HTTPException(status_code=404, detail="Analysis session not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_analysis(session_id: str, username: str, depth: int, max_games: int):
    try:
        supabase_client.update_session_status(session_id, "analyzing")

        chess_client = ChessComClient()
        games = chess_client.fetch_recent_games(username, limit=max_games)

        if not games:
            supabase_client.update_session_status(session_id, "failed")
            return

        analyzer = ChessAnalyzer(depth=depth)
        all_game_data = []

        for game in games:
            game_data = analyzer.analyze_game(game, username)
            if game_data:
                supabase_client.save_game_analysis(session_id, game_data)
                all_game_data.append(game_data)
                supabase_client.increment_games_analyzed(session_id)

        if all_game_data:
            detector = WeaknessDetector(all_game_data)
            weaknesses = detector.detect_weaknesses()
            training_plan = detector.generate_training_plan(weaknesses)
            overall_accuracy = detector.calculate_overall_accuracy()

            for weakness in weaknesses:
                supabase_client.save_weakness(session_id, weakness)

            for idx, exercise in enumerate(training_plan):
                supabase_client.save_training_plan(session_id, exercise, idx)

            supabase_client.complete_session(session_id, overall_accuracy)
        else:
            supabase_client.update_session_status(session_id, "failed")

    except Exception as e:
        print(f"Analysis error: {e}")
        supabase_client.update_session_status(session_id, "failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
