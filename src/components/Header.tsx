import { Crown } from 'lucide-react'

export default function Header() {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
        <Crown className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold gradient-text">
          AI Chess Improvement Coach
        </h1>
        <p className="text-gray-400 text-xs mt-0.5">
          Powered by Stockfish Engine
        </p>
      </div>
    </div>
  )
}
