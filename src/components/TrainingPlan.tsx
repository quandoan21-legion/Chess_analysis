import { Target, CheckCircle2 } from 'lucide-react'

interface TrainingPlanProps {
  exercises: string[]
}

export default function TrainingPlan({ exercises }: TrainingPlanProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-green-500/20">
          <Target className="w-5 h-5 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">Personalized Training Plan</h2>
      </div>

      <div className="glass rounded-xl p-8 shadow-xl">
        <p className="text-gray-400 mb-6">
          Follow this training plan to address your weaknesses and improve your chess skills:
        </p>

        <div className="space-y-3">
          {exercises.map((exercise, index) => {
            const isPriority = exercise.includes('PRIORITY')
            const displayText = exercise.replace('PRIORITY: ', '')

            return (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                  isPriority
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-2 border-blue-500/50'
                    : 'bg-dark-hover border border-white/10'
                }`}
              >
                <div className={`flex-shrink-0 mt-0.5 ${isPriority ? 'text-blue-400' : 'text-green-400'}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`leading-relaxed ${isPriority ? 'font-semibold text-blue-300' : 'text-gray-300'}`}>
                    {displayText}
                  </p>
                  {isPriority && (
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-300">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
