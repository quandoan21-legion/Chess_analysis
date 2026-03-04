const ChessWebAPI = require('chess-web-api')

const chessAPI = new ChessWebAPI()

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

export const fetchRecentGames = async (username: string, limit: number = 10): Promise<ChessGame[]> => {
  try {
    const archivesResponse = await chessAPI.getPlayerMonthlyArchives(username)

    if (!archivesResponse.body || !archivesResponse.body.archives) {
      throw new Error('No game archives found')
    }

    const archives = archivesResponse.body.archives
    const recentGames: ChessGame[] = []

    for (let i = archives.length - 1; i >= 0 && recentGames.length < limit; i--) {
      const archiveUrl = archives[i]
      const parts = archiveUrl.split('/')
      const year = parseInt(parts[parts.length - 2])
      const month = parseInt(parts[parts.length - 1])

      const gamesResponse = await chessAPI.getPlayerCompleteMonthlyArchives(username, year, month)

      if (gamesResponse.body && gamesResponse.body.games) {
        const games = gamesResponse.body.games
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
    const response = await chessAPI.getPlayer(username)
    return response.body
  } catch (error) {
    console.error('Error fetching player profile:', error)
    throw error
  }
}

export const fetchPlayerStats = async (username: string) => {
  try {
    const response = await chessAPI.getPlayerStats(username)
    return response.body
  } catch (error) {
    console.error('Error fetching player stats:', error)
    throw error
  }
}
