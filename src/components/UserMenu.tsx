import { LogOut, Trophy } from 'lucide-react'

interface UserMenuProps {
  user: {
    email: string
    chessUsername?: string
  }
  onSignOut: () => void
}

export default function UserMenu({ user, onSignOut }: UserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="glass px-4 py-2 rounded-lg flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <div className="text-sm">
          <div className="text-gray-400">Signed in as</div>
          <div className="font-semibold">{user.chessUsername || user.email}</div>
        </div>
      </div>

      <button
        onClick={onSignOut}
        className="glass px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-500/20 hover:border-red-500/30 transition-all group"
      >
        <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
        <span className="text-sm font-medium group-hover:text-red-400 transition-colors">
          Sign Out
        </span>
      </button>
    </div>
  )
}
