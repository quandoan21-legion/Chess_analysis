const CHESS_API_BASE = 'https://api.chess.com/pub'

export interface ChessGame {
  url: string
  pgn: string
  time_control: string
  end_time: number
  rated: boolean
  white: {
    username: string
    rating: number
  }
  black: {
    username: string
    rating: number
  }
  time_class: string
}

export interface MonthlyArchive {
  year: number
  month: number
  games: ChessGame[]
}

const fetchChessAPI = async (endpoint: string) => {
  const response = await fetch(`${CHESS_API_BASE}${endpoint}`)
  if (!response.ok) {
    throw new Error(`Chess.com API error: ${response.statusText}`)
  }
  return response.json()
}

export const fetchRecentGames = async (username: string, limit: number = 10): Promise<ChessGame[]> => {
  try {
    const archivesData = await fetchChessAPI(`/player/${username}/games/archives`)

    if (!archivesData.archives || archivesData.archives.length === 0) {
      throw new Error('No game archives found')
    }

    const archives = archivesData.archives
    const recentGames: ChessGame[] = []

    for (let i = archives.length - 1; i >= 0 && recentGames.length < limit; i--) {
      const archiveUrl = archives[i]
      const parts = archiveUrl.split('/')
      const year = parseInt(parts[parts.length - 2])
      const month = parseInt(parts[parts.length - 1])

      const gamesData = await fetchChessAPI(`/player/${username}/games/${year}/${month}`)

      if (gamesData.games) {
        const games = gamesData.games
          .sort((a: ChessGame, b: ChessGame) => b.end_time - a.end_time)
          .slice(0, limit - recentGames.length)

        recentGames.push(...games)
      }
    }

    return recentGames.slice(0, limit)
  } catch (error) {
    console.error('Error fetching games:', error)
    throw error
  }
}

export const fetchPlayerProfile = async (username: string) => {
  try {
    return await fetchChessAPI(`/player/${username}`)
  } catch (error) {
    console.error('Error fetching player profile:', error)
    throw error
  }
}

export const fetchPlayerStats = async (username: string) => {
  try {
    return await fetchChessAPI(`/player/${username}/stats`)
  } catch (error) {
    console.error('Error fetching player stats:', error)
    throw error
  }
}
