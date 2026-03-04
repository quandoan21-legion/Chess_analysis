from typing import List, Dict

class WeaknessDetector:
    def __init__(self, game_analyses: List[Dict]):
        self.game_analyses = game_analyses

    def detect_weaknesses(self) -> List[Dict]:
        weaknesses = []

        opening_weakness = self._detect_opening_weakness()
        if opening_weakness:
            weaknesses.append(opening_weakness)

        tactical_weakness = self._detect_tactical_weakness()
        if tactical_weakness:
            weaknesses.append(tactical_weakness)

        endgame_weakness = self._detect_endgame_weakness()
        if endgame_weakness:
            weaknesses.append(endgame_weakness)

        positional_weakness = self._detect_positional_weakness()
        if positional_weakness:
            weaknesses.append(positional_weakness)

        return weaknesses

    def _detect_opening_weakness(self) -> Optional[Dict]:
        opening_blunders = 0
        opening_mistakes = 0
        opening_inaccuracies = 0
        total_games = len(self.game_analyses)

        for game in self.game_analyses:
            moves = game.get('move_analysis', [])
            opening_moves = moves[:10]

            for move in opening_moves:
                if move['classification'] == 'Blunder':
                    opening_blunders += 1
                elif move['classification'] == 'Mistake':
                    opening_mistakes += 1
                elif move['classification'] == 'Inaccuracy':
                    opening_inaccuracies += 1

        opening_errors = opening_blunders + opening_mistakes
        avg_errors_per_game = opening_errors / total_games if total_games > 0 else 0

        if opening_blunders >= 3 or avg_errors_per_game >= 1.5:
            severity = "High" if opening_blunders >= 5 else "Medium"
            return {
                'type': 'Opening',
                'severity': severity,
                'description': f'Frequent early-game errors detected. You made {opening_blunders} blunders and {opening_mistakes} mistakes in the opening phase across {total_games} games.',
                'recommendation': 'Study mainline theory in your most played openings. Focus on understanding key opening principles: control the center, develop pieces quickly, and ensure king safety.'
            }

        return None

    def _detect_tactical_weakness(self) -> Optional[Dict]:
        total_blunders = sum(game.get('blunders', 0) for game in self.game_analyses)
        total_games = len(self.game_analyses)
        avg_blunders = total_blunders / total_games if total_games > 0 else 0

        large_cp_losses = 0
        for game in self.game_analyses:
            moves = game.get('move_analysis', [])
            large_cp_losses += sum(1 for m in moves if m['cp_loss'] >= 300)

        if avg_blunders >= 2 or large_cp_losses >= 5:
            severity = "High" if avg_blunders >= 3 else "Medium"
            return {
                'type': 'Tactical',
                'severity': severity,
                'description': f'Tactical blindness detected. Average of {avg_blunders:.1f} blunders per game, with {large_cp_losses} severe tactical mistakes across all games.',
                'recommendation': 'Practice tactical puzzles daily (20-30 puzzles). Focus on pattern recognition for forks, pins, skewers, and discovered attacks. Use puzzle rush or similar tools.'
            }

        return None

    def _detect_endgame_weakness(self) -> Optional[Dict]:
        endgame_errors = 0
        endgame_moves_count = 0

        for game in self.game_analyses:
            moves = game.get('move_analysis', [])
            total_moves = game.get('total_moves', 0)

            if total_moves > 30:
                endgame_moves = moves[30:]
                endgame_moves_count += len(endgame_moves)

                for move in endgame_moves:
                    if move['classification'] in ['Blunder', 'Mistake']:
                        endgame_errors += 1

        if endgame_moves_count > 0:
            error_rate = endgame_errors / endgame_moves_count

            if error_rate >= 0.25:
                severity = "High" if error_rate >= 0.35 else "Medium"
                return {
                    'type': 'Endgame',
                    'severity': severity,
                    'description': f'Endgame weakness identified. You made errors in {error_rate*100:.1f}% of endgame moves, indicating difficulty converting winning positions.',
                    'recommendation': 'Study fundamental endgames: king and pawn endgames, rook endgames, and basic piece vs pawns. Practice endgame positions daily on endgame trainers.'
                }

        return None

    def _detect_positional_weakness(self) -> Optional[Dict]:
        total_inaccuracies = sum(game.get('inaccuracies', 0) for game in self.game_analyses)
        total_games = len(self.game_analyses)
        avg_inaccuracies = total_inaccuracies / total_games if total_games > 0 else 0

        gradual_decline_games = 0
        for game in self.game_analyses:
            moves = game.get('move_analysis', [])
            small_errors = sum(1 for m in moves if 50 <= m['cp_loss'] < 100)

            if small_errors >= 5:
                gradual_decline_games += 1

        if avg_inaccuracies >= 4 or gradual_decline_games >= total_games * 0.5:
            severity = "Medium" if avg_inaccuracies >= 5 else "Low"
            return {
                'type': 'Positional',
                'severity': severity,
                'description': f'Positional play needs improvement. Average of {avg_inaccuracies:.1f} inaccuracies per game suggests weak understanding of strategic concepts.',
                'recommendation': 'Study pawn structures, piece activity, and strategic plans. Analyze master games with annotations. Focus on concepts like weak squares, outposts, and space advantage.'
            }

        return None

    def generate_training_plan(self, weaknesses: List[Dict]) -> List[str]:
        plan = []

        weakness_types = {w['type'] for w in weaknesses}
        high_severity = [w for w in weaknesses if w['severity'] == 'High']

        if 'Tactical' in weakness_types:
            plan.append('Solve 25-30 tactical puzzles daily (focus on pattern recognition)')

        if 'Opening' in weakness_types:
            plan.append('Study your top 3 most played openings for 15 minutes daily')
            plan.append('Review opening mistakes after each game')

        if 'Endgame' in weakness_types:
            plan.append('Practice basic endgame positions (K+P, rook endgames) for 20 minutes daily')
            plan.append('Study one instructional endgame video per week')

        if 'Positional' in weakness_types:
            plan.append('Analyze one annotated master game per week')
            plan.append('Study pawn structures and strategic themes')

        plan.append('Play slower time controls to reduce blunders (15+10 or longer)')
        plan.append('Review all your games with engine analysis')

        if high_severity:
            plan.insert(0, f'PRIORITY: Focus on {high_severity[0]["type"]} skills - this is your biggest weakness')

        return plan

    def calculate_overall_accuracy(self) -> float:
        if not self.game_analyses:
            return 0.0

        total_accuracy = sum(game.get('accuracy', 0) for game in self.game_analyses)
        return round(total_accuracy / len(self.game_analyses), 2)

from typing import Optional
