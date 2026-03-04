import { useState, useEffect } from 'react'
import { Search, Settings } from 'lucide-react'
import { AnalysisData } from '../types'

interface AnalysisFormProps {
  onAnalysisComplete: (data: AnalysisData | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  defaultUsername?: string
}

export default function AnalysisForm({ onAnalysisComplete, isLoading, setIsLoading, defaultUsername }: AnalysisFormProps) {
  const [username, setUsername] = useState(defaultUsername || '')

  useEffect(() => {
    if (defaultUsername) {
      setUsername(defaultUsername)
    }
  }, [defaultUsername])
  const [depth, setDepth] = useState(15)
  const [maxGames, setMaxGames] = useState(10)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Please enter a Chess.com username')
      return
    }

    setIsLoading(true)
    onAnalysisComplete(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          depth,
          max_games: maxGames,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start analysis')
      }

      const result = await response.json()
      const sessionId = result.session_id

      pollAnalysisStatus(sessionId)
    } catch (err) {
      setError('Failed to start analysis. Please check the username and try again.')
      setIsLoading(false)
    }
  }

  const pollAnalysisStatus = async (sessionId: string) => {
    const maxAttempts = 60
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/analysis/${sessionId}`)
        const data = await response.json()

        if (data.session.status === 'completed') {
          setIsLoading(false)
          onAnalysisComplete(data)
        } else if (data.session.status === 'failed') {
          setIsLoading(false)
          setError('Analysis failed. Please check the username or try again.')
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 3000)
        } else {
          setIsLoading(false)
          setError('Analysis timeout. Please try again.')
        }
      } catch (err) {
        setIsLoading(false)
        setError('Error retrieving analysis results.')
      }
    }

    poll()
  }

  return (
    <div className="glass rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Search className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold">Analyze Your Games</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chess.com Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., hikaru"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg bg-dark-hover border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Engine Depth
            </label>
            <select
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-dark-hover border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={10}>Depth 10 (Fast)</option>
              <option value={15}>Depth 15 (Recommended)</option>
              <option value={20}>Depth 20 (Accurate)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Games
            </label>
            <select
              value={maxGames}
              onChange={(e) => setMaxGames(Number(e.target.value))}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-dark-hover border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={5}>5 Games</option>
              <option value={10}>10 Games</option>
              <option value={15}>15 Games</option>
              <option value={20}>20 Games</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? 'Analyzing...' : 'Start Analysis'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-start gap-2 text-sm text-gray-400">
          <Settings className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Analysis uses Stockfish to evaluate every move and detect patterns in your play.
            Higher depth provides more accurate analysis but takes longer.
          </p>
        </div>
      </div>
    </div>
  )
}
