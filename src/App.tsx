import { useState } from 'react'
import AnalysisForm from './components/AnalysisForm'
import AnalysisResults from './components/AnalysisResults'
import Header from './components/Header'
import { AnalysisData } from './types'

function App() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark to-dark-card">
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent opacity-50" />

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <AnalysisForm
            onAnalysisComplete={setAnalysisData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />

          {isLoading && (
            <div className="mt-12 text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-400 text-lg">Analyzing your games with Stockfish...</p>
              <p className="mt-2 text-gray-500 text-sm">This may take a few minutes</p>
            </div>
          )}

          {analysisData && !isLoading && (
            <AnalysisResults data={analysisData} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
