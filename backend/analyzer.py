import chess
import chess.pgn
from typing import Dict, List, Optional
from io import StringIO
from stockfish import Stockfish

class ChessAnalyzer:
    def __init__(self, depth: int = 15):
        self.depth = depth
        try:
            self.stockfish = Stockfish(depth=depth, parameters={
                "Threads": 2,
                "Hash": 128,
            })
        except Exception as e:
            print(f"Warning: Stockfish not available. Using mock analyzer. Error: {e}")
            self.stockfish = None

    def analyze_game(self, game_data: Dict, username: str) -> Optional[Dict]:
        try:
            pgn_text = game_data.get('pgn', '')
            pgn = StringIO(pgn_text)
            game = chess.pgn.read_game(pgn)

            if not game:
                return None

            white_player = game.headers.get('White', '').lower()
            black_player = game.headers.get('Black', '').lower()
            username_lower = username.lower()

            if username_lower not in white_player and username_lower not in black_player:
                return None

            player_color = 'white' if username_lower in white_player else 'black'

            move_analysis = self._analyze_moves(game, player_color)

            blunders = sum(1 for m in move_analysis if m['classification'] == 'Blunder')
            mistakes = sum(1 for m in move_analysis if m['classification'] == 'Mistake')
            inaccuracies = sum(1 for m in move_analysis if m['classification'] == 'Inaccuracy')

            total_moves = len(move_analysis)
            good_moves = total_moves - (blunders + mistakes + inaccuracies)
            accuracy = (good_moves / total_moves * 100) if total_moves > 0 else 0

            return {
                'game_url': game_data.get('url', ''),
                'pgn': pgn_text,
                'result': game.headers.get('Result', '*'),
                'player_color': player_color,
                'accuracy': round(accuracy, 2),
                'blunders': blunders,
                'mistakes': mistakes,
                'inaccuracies': inaccuracies,
                'move_analysis': move_analysis,
                'total_moves': total_moves
            }

        except Exception as e:
            print(f"Error analyzing game: {e}")
            return None

    def _analyze_moves(self, game: chess.pgn.Game, player_color: str) -> List[Dict]:
        board = game.board()
        moves = []
        move_number = 0

        for move in game.mainline_moves():
            current_player = 'white' if board.turn == chess.WHITE else 'black'

            if current_player == player_color:
                eval_before = self._get_evaluation(board)
                board.push(move)
                eval_after = self._get_evaluation(board)

                cp_loss = self._calculate_cp_loss(
                    eval_before,
                    eval_after,
                    player_color
                )

                classification = self._classify_move(cp_loss)

                moves.append({
                    'move_number': move_number,
                    'move': move.uci(),
                    'eval_before': eval_before,
                    'eval_after': eval_after,
                    'cp_loss': cp_loss,
                    'classification': classification
                })

                move_number += 1
            else:
                board.push(move)

        return moves

    def _get_evaluation(self, board: chess.Board) -> float:
        if not self.stockfish:
            return 0.0

        try:
            self.stockfish.set_fen_position(board.fen())
            eval_info = self.stockfish.get_evaluation()

            if eval_info['type'] == 'cp':
                return eval_info['value'] / 100.0
            elif eval_info['type'] == 'mate':
                mate_in = eval_info['value']
                return 100.0 if mate_in > 0 else -100.0

            return 0.0
        except:
            return 0.0

    def _calculate_cp_loss(self, eval_before: float, eval_after: float, color: str) -> int:
        if color == 'white':
            loss = eval_before - eval_after
        else:
            loss = eval_after - eval_before

        return max(0, int(loss * 100))

    def _classify_move(self, cp_loss: int) -> str:
        if cp_loss < 50:
            return 'Good'
        elif cp_loss < 100:
            return 'Inaccuracy'
        elif cp_loss < 300:
            return 'Mistake'
        else:
            return 'Blunder'
