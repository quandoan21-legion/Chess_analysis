export interface AnalysisSession {
  id: string
  username: string
  status: string
  games_analyzed: number
  overall_accuracy: number
  created_at: string
  completed_at: string | null
}

export interface GameAnalysis {
  id: string
  session_id: string
  game_url: string
  pgn: string
  result: string
  player_color: string
  accuracy: number
  blunders: number
  mistakes: number
  inaccuracies: number
  analyzed_at: string
}

export interface Weakness {
  id: string
  session_id: string
  weakness_type: string
  severity: string
  description: string
  recommendation: string
  detected_at: string
}

export interface AnalysisData {
  session: AnalysisSession
  games: GameAnalysis[]
  weaknesses: Weakness[]
  training_plan: string[]
}

export interface AnalysisRequest {
  username: string
  depth: number
  max_games: number
}

export interface AnalysisResponse {
  session_id: string
  status: string
  message: string
}
