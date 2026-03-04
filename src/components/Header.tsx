import { Crown } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-dark-card/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              AI Chess Improvement Coach
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Powered by Stockfish Engine
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
