import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import AnalysisForm from './components/AnalysisForm'
import AnalysisResults from './components/AnalysisResults'
import Header from './components/Header'
import AuthModal from './components/AuthModal'
import UserMenu from './components/UserMenu'
import { AnalysisData, User } from './types'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function App() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email || '')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email || '')
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string, email: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (data) {
      setUser({
        id: userId,
        email: data.email,
        chessUsername: data.chess_com_username || undefined
      })
    } else {
      setUser({ id: userId, email })
    }
  }

  const handleAuth = async (email: string, password: string, chessUsername: string, isSignUp: boolean) => {
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          email,
          chess_com_username: chessUsername || null
        })
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAnalysisData(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark to-dark-card">
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent opacity-50" />

      <div className="relative z-10">
        <div className="border-b border-white/10 bg-dark/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 max-w-6xl">
            <div className="flex items-center justify-between">
              <Header />
              {user ? (
                <UserMenu user={user} onSignOut={handleSignOut} />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="glass px-6 py-2 rounded-lg font-semibold hover:bg-blue-500/20 hover:border-blue-500/30 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <AnalysisForm
            onAnalysisComplete={setAnalysisData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            defaultUsername={user?.chessUsername}
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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />
    </div>
  )
}

export default App
