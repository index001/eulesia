import { Shield, Fingerprint, CheckCircle, Lock, Users, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = () => {
    login()
    navigate('/agora')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-blue-800 font-bold text-xl">E</span>
          </div>
          <span className="text-white font-semibold text-2xl">Eulesia</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col justify-center px-6 pb-12">
        <div className="max-w-md mx-auto w-full">
          {/* Tagline */}
          <h1 className="text-white text-3xl font-bold mb-3">
            Civic space for the digital age
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            Public infrastructure, not private platform. Real identity, not anonymity.
            Deliberation, not distraction.
          </p>

          {/* EUDI Wallet Login */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-blue-800" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Sign in with EU Digital Identity</h2>
                <p className="text-sm text-gray-500">EUDI Wallet</p>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-blue-800 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Continue with EUDI Wallet
            </button>

            {/* Simulated - for prototype */}
            <p className="text-xs text-gray-400 text-center mt-3">
              Prototype: Click to simulate verified login
            </p>
          </div>

          {/* Identity explanation */}
          <div className="mt-6 bg-blue-800/50 rounded-xl p-4 border border-blue-700">
            <h3 className="text-white font-medium flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              Identity as infrastructure
            </h3>
            <p className="text-blue-200 text-sm">
              Eulesia uses the European Digital Identity framework. One person, one account.
              Verified identity enables accountable civic discourse — not surveillance.
            </p>
          </div>
        </div>
      </main>

      {/* Feature highlights */}
      <div className="bg-white px-6 py-8">
        <div className="max-w-md mx-auto">
          <h3 className="text-gray-900 font-semibold mb-4 text-center">
            What makes Eulesia different
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-700" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">No attention economy</h4>
                <p className="text-gray-500 text-sm">
                  No algorithmic feed, no infinite scroll, no engagement metrics. Your time is yours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-violet-700" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Institutions as participants</h4>
                <p className="text-gray-500 text-sm">
                  Public institutions join as civic actors, not advertisers or "verified brands."
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Social, not surveillance</h4>
                <p className="text-gray-500 text-sm">
                  Connect with communities and neighbors. No data harvesting, no ad targeting.
                </p>
              </div>
            </div>
          </div>

          {/* EU alignment */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="text-lg">🇪🇺</span>
            <span>European Digital Public Infrastructure</span>
          </div>
        </div>
      </div>
    </div>
  )
}
