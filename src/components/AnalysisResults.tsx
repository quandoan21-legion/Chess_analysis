import { Trophy, AlertTriangle } from 'lucide-react'
import { AnalysisData } from '../types'
import WeaknessCard from './WeaknessCard'
import TrainingPlan from './TrainingPlan'
import GameStats from './GameStats'

interface AnalysisResultsProps {
  data: AnalysisData
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  const { session, games, weaknesses, training_plan } = data

  const getStrengthCategory = (accuracy: number) => {
    if (accuracy >= 90) return { label: 'Advanced', color: 'text-green-400', bgColor: 'bg-green-500/20' }
    if (accuracy >= 75) return { label: 'Intermediate', color: 'text-blue-400', bgColor: 'bg-blue-500/20' }
    return { label: 'Beginner', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
  }

  const strength = getStrengthCategory(session.overall_accuracy)

  const totalBlunders = games.reduce((sum, game) => sum + game.blunders, 0)
  const totalMistakes = games.reduce((sum, game) => sum + game.mistakes, 0)
  const totalInaccuracies = games.reduce((sum, game) => sum + game.inaccuracies, 0)

  return (
    <div className="mt-12 space-y-8 animate-fade-in">
      <div className="glass rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Analysis Complete</h2>
              <p className="text-gray-400 text-sm mt-1">
                Analyzed {session.games_analyzed} games for {session.username}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/30">
            <div className="text-5xl font-bold gradient-text mb-2">
              {session.overall_accuracy.toFixed(1)}%
            </div>
            <div className="text-gray-400 mb-3">Overall Accuracy</div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${strength.bgColor}`}>
              <span className={`font-semibold ${strength.color}`}>
                {strength.label} Player
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <span className="text-gray-300">Total Blunders</span>
              <span className="text-2xl font-bold text-red-400">{totalBlunders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <span className="text-gray-300">Total Mistakes</span>
              <span className="text-2xl font-bold text-orange-400">{totalMistakes}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <span className="text-gray-300">Total Inaccuracies</span>
              <span className="text-2xl font-bold text-yellow-400">{totalInaccuracies}</span>
            </div>
          </div>
        </div>
      </div>

      {weaknesses.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold">Detected Weaknesses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weaknesses.map((weakness) => (
              <WeaknessCard key={weakness.id} weakness={weakness} />
            ))}
          </div>
        </div>
      )}

      {training_plan.length > 0 && (
        <TrainingPlan exercises={training_plan} />
      )}

      <GameStats games={games} />
    </div>
  )
}
