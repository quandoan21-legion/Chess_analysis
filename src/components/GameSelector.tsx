import { useState } from 'react'
import { ChevronDown, Calendar, Clock, Trophy } from 'lucide-react'
import { ChessGame } from '../services/chessService'

interface GameSelectorProps {
  games: ChessGame[]
  selectedGames: string[]
  onSelectionChange: (gameUrls: string[]) => void
  username: string
}

export default function GameSelector({ games, selectedGames, onSelectionChange, username }: GameSelectorProps) {
  const [expanded, setExpanded] = useState(true)

  const toggleGame = (gameUrl: string) => {
    if (selectedGames.includes(gameUrl)) {
      onSelectionChange(selectedGames.filter(url => url !== gameUrl))
    } else {
      onSelectionChange([...selectedGames, gameUrl])
    }
  }

  const selectAll = () => {
    onSelectionChange(games.map(g => g.url))
  }

  const deselectAll = () => {
    onSelectionChange([])
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTimeControl = (timeControl: string) => {
    return timeControl.replace('+', ' + ')
  }

  const getPlayerColor = (game: ChessGame): 'white' | 'black' => {
    return game.white.username.toLowerCase() === username.toLowerCase() ? 'white' : 'black'
  }

  const getOpponent = (game: ChessGame) => {
    const color = getPlayerColor(game)
    return color === 'white' ? game.black : game.white
  }

  return (
    <div className="glass rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
          >
            <ChevronDown className={`w-5 h-5 text-blue-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <h3 className="text-lg font-semibold">
            Select Games ({selectedGames.length} of {games.length})
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-4 py-2 rounded-lg bg-dark-hover hover:bg-dark-card transition-colors text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {games.map((game, index) => {
            const isSelected = selectedGames.includes(game.url)
            const playerColor = getPlayerColor(game)
            const opponent = getOpponent(game)
            const playerRating = playerColor === 'white' ? game.white.rating : game.black.rating

            return (
              <div
                key={game.url}
                onClick={() => toggleGame(game.url)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/30'
                    : 'bg-dark-hover border-white/10 hover:border-blue-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{username}</span>
                        <span className="text-gray-400">({playerRating})</span>
                        <span className="text-gray-500">vs</span>
                        <span className="font-semibold">{opponent.username}</span>
                        <span className="text-gray-400">({opponent.rating})</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(game.end_time)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTimeControl(game.time_control)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          {game.time_class}
                        </div>
                        {game.rated && (
                          <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                            Rated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-dark"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
