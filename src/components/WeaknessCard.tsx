import { AlertCircle, BookOpen, Zap, Crown, Brain, Clock } from 'lucide-react'
import { Weakness } from '../types'

interface WeaknessCardProps {
  weakness: Weakness
}

export default function WeaknessCard({ weakness }: WeaknessCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Opening':
        return BookOpen
      case 'Tactical':
        return Zap
      case 'Endgame':
        return Crown
      case 'Positional':
        return Brain
      case 'Time':
        return Clock
      default:
        return AlertCircle
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/50',
          text: 'text-red-400',
          badge: 'bg-red-500/20'
        }
      case 'Medium':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/50',
          text: 'text-orange-400',
          badge: 'bg-orange-500/20'
        }
      default:
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          badge: 'bg-yellow-500/20'
        }
    }
  }

  const Icon = getIcon(weakness.weakness_type)
  const colors = getSeverityColor(weakness.severity)

  return (
    <div className={`glass glass-hover rounded-xl p-6 border ${colors.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <h3 className="text-lg font-semibold">{weakness.weakness_type} Weakness</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge} ${colors.text}`}>
          {weakness.severity}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Analysis</h4>
          <p className="text-gray-300 leading-relaxed">{weakness.description}</p>
        </div>

        <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Recommendation</h4>
          <p className={`${colors.text} leading-relaxed`}>{weakness.recommendation}</p>
        </div>
      </div>
    </div>
  )
}
