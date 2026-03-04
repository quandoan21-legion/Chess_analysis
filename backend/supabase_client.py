import os
from typing import Dict, List, Optional
from datetime import datetime

class SupabaseClient:
    def __init__(self):
        self.url = os.getenv('VITE_SUPABASE_URL', '')
        self.key = os.getenv('VITE_SUPABASE_SUPABASE_ANON_KEY', '')

        try:
            from supabase import create_client, Client
            self.client: Client = create_client(self.url, self.key)
        except Exception as e:
            print(f"Supabase client initialization error: {e}")
            self.client = None

    def create_session(self, username: str) -> Dict:
        if not self.client:
            raise Exception("Supabase client not initialized")

        result = self.client.table('analysis_sessions').insert({
            'username': username,
            'status': 'pending',
            'games_analyzed': 0
        }).execute()

        return result.data[0]

    def update_session_status(self, session_id: str, status: str):
        if not self.client:
            return

        self.client.table('analysis_sessions').update({
            'status': status
        }).eq('id', session_id).execute()

    def increment_games_analyzed(self, session_id: str):
        if not self.client:
            return

        session = self.client.table('analysis_sessions').select('games_analyzed').eq('id', session_id).single().execute()
        current = session.data.get('games_analyzed', 0)

        self.client.table('analysis_sessions').update({
            'games_analyzed': current + 1
        }).eq('id', session_id).execute()

    def complete_session(self, session_id: str, overall_accuracy: float):
        if not self.client:
            return

        self.client.table('analysis_sessions').update({
            'status': 'completed',
            'overall_accuracy': overall_accuracy,
            'completed_at': datetime.utcnow().isoformat()
        }).eq('id', session_id).execute()

    def save_game_analysis(self, session_id: str, game_data: Dict):
        if not self.client:
            return

        self.client.table('game_analyses').insert({
            'session_id': session_id,
            'game_url': game_data.get('game_url', ''),
            'pgn': game_data.get('pgn', ''),
            'result': game_data.get('result', ''),
            'player_color': game_data.get('player_color', ''),
            'accuracy': game_data.get('accuracy', 0),
            'blunders': game_data.get('blunders', 0),
            'mistakes': game_data.get('mistakes', 0),
            'inaccuracies': game_data.get('inaccuracies', 0)
        }).execute()

    def save_weakness(self, session_id: str, weakness: Dict):
        if not self.client:
            return

        self.client.table('weaknesses').insert({
            'session_id': session_id,
            'weakness_type': weakness['type'],
            'severity': weakness['severity'],
            'description': weakness['description'],
            'recommendation': weakness['recommendation']
        }).execute()

    def save_training_plan(self, session_id: str, exercise: str, priority: int):
        if not self.client:
            return

        self.client.table('training_plans').insert({
            'session_id': session_id,
            'exercise': exercise,
            'priority': priority
        }).execute()

    def get_full_analysis(self, session_id: str) -> Optional[Dict]:
        if not self.client:
            return None

        session = self.client.table('analysis_sessions').select('*').eq('id', session_id).single().execute()

        if not session.data:
            return None

        games = self.client.table('game_analyses').select('*').eq('session_id', session_id).execute()
        weaknesses = self.client.table('weaknesses').select('*').eq('session_id', session_id).execute()
        training = self.client.table('training_plans').select('*').eq('session_id', session_id).order('priority').execute()

        return {
            'session': session.data,
            'games': games.data,
            'weaknesses': weaknesses.data,
            'training_plan': [t['exercise'] for t in training.data]
        }
