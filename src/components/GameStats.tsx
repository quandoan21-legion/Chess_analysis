import { BarChart3 } from 'lucide-react'
import { GameAnalysis } from '../types'

interface GameStatsProps {
  games: GameAnalysis[]
}

export default function GameStats({ games }: GameStatsProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <BarChart3 className="w-5 h-5 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold">Game-by-Game Breakdown</h2>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-hover border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Game</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Color</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Result</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Accuracy</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Blunders</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Mistakes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Inaccuracies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {games.map((game, index) => (
                <tr key={game.id} className="hover:bg-dark-hover transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {game.game_url ? (
                      <a
                        href={game.game_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        Game {index + 1}
                      </a>
                    ) : (
                      `Game ${index + 1}`
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`capitalize ${game.player_color === 'white' ? 'text-gray-300' : 'text-gray-400'}`}>
                      {game.player_color}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-gray-300">{game.result}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-semibold text-blue-400">{game.accuracy.toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={game.blunders > 0 ? 'text-red-400 font-semibold' : 'text-gray-500'}>
                      {game.blunders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={game.mistakes > 0 ? 'text-orange-400 font-semibold' : 'text-gray-500'}>
                      {game.mistakes}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={game.inaccuracies > 0 ? 'text-yellow-400 font-semibold' : 'text-gray-500'}>
                      {game.inaccuracies}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
