import httpx
from typing import List, Dict, Optional
import time

class ChessComClient:
    BASE_URL = "https://api.chess.com/pub"

    def __init__(self):
        self.client = httpx.Client(timeout=30.0)

    def fetch_recent_games(self, username: str, limit: int = 10) -> List[Dict]:
        try:
            archives_url = f"{self.BASE_URL}/player/{username}/games/archives"
            response = self.client.get(archives_url)
            response.raise_for_status()

            archives = response.json().get('archives', [])
            if not archives:
                return []

            latest_archive = archives[-1]
            games_response = self.client.get(latest_archive)
            games_response.raise_for_status()

            games = games_response.json().get('games', [])

            filtered_games = [
                game for game in games[-limit:]
                if game.get('rules') == 'chess' and game.get('pgn')
            ]

            return filtered_games

        except Exception as e:
            print(f"Error fetching games: {e}")
            return []

    def __del__(self):
        self.client.close()
