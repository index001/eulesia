import { Shield, Bell, Eye, Database, LogOut, ChevronRight, Info, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { useAuth } from '../hooks/useAuth'

export function ProfilePage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!currentUser) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-gray-500">Please log in to view your profile</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Profile header */}
      <div className="bg-white px-4 py-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">{currentUser.avatarInitials}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{currentUser.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                <Shield className="w-3 h-3" />
                Verified Identity
              </span>
              {currentUser.municipality && (
                <span className="text-xs text-gray-500">
                  {currentUser.municipality.charAt(0).toUpperCase() + currentUser.municipality.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Identity section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Identity
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">EUDI Wallet Connected</p>
                <p className="text-xs text-gray-500">European Digital Identity</p>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Your identity is verified through the EU Digital Identity framework.
                This ensures one-person-one-account in Eulesia.
              </p>
            </div>
          </div>
        </div>

        {/* Notification preferences */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              Notifications
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Replies to your posts</p>
                <p className="text-xs text-gray-500">When someone replies to your discussions</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Direct mentions</p>
                <p className="text-xs text-gray-500">When someone mentions you</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Official updates</p>
                <p className="text-xs text-gray-500">From institutions you follow</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              No "growth" nudges. Only meaningful notifications.
            </p>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              Privacy & Data
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium">Your data is not the product</p>
              <p className="text-xs text-green-700 mt-1">
                Eulesia does not collect behavioral data for advertising.
                We do not sell your data or use it to manipulate your attention.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Data stored</span>
                </div>
                <Link to="/profile/data" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  View
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Profile information (name, municipality)</p>
                <p>• Your posts and comments</p>
                <p>• Club memberships</p>
                <p>• Notification preferences</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Export my data
              </button>
            </div>
          </div>
        </div>

        {/* About Eulesia */}
        <Link
          to="/about"
          className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-800 font-bold">E</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">About Eulesia</p>
                <p className="text-xs text-gray-500">Governance, foundation, open source</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 py-3"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </Layout>
  )
}
