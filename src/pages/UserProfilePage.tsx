import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Shield, Building2, Calendar, MessageSquare } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '../components/layout'
import { FollowButton } from '../components/common'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

interface UserThread {
  id: string
  title: string
  content: string
  scope: 'municipal' | 'regional' | 'national'
  replyCount: number
  score: number
  createdAt: string
  municipalityName?: string
  tags: string[]
}

interface UserProfile {
  id: string
  name: string
  avatarUrl?: string
  role: 'citizen' | 'institution' | 'admin'
  institutionType?: string
  institutionName?: string
  identityVerified: boolean
  createdAt: string
  threads: UserThread[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fi-FI', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getAvatarInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { currentUser } = useAuth()

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/${userId}`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.data as UserProfile
    },
    enabled: !!userId
  })

  const isOwnProfile = currentUser?.id === userId

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (error || !user) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-gray-500">Kayttajaa ei loytynyt</p>
          <Link to="/agora" className="text-blue-600 hover:underline mt-2 inline-block">
            Takaisin Agoraan
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Back navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Takaisin
        </button>
      </div>

      {/* Profile header */}
      <div className="bg-gradient-to-b from-blue-50 to-white px-4 py-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-bold">
                {getAvatarInitials(user.name)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{user.name}</h1>

            {user.role === 'institution' && user.institutionName && (
              <div className="flex items-center gap-1.5 text-sm text-teal-700 mt-1">
                <Building2 className="w-4 h-4" />
                <span>{user.institutionName}</span>
              </div>
            )}

            {user.identityVerified && (
              <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full w-fit mt-2">
                <Shield className="w-3 h-3" />
                <span>Vahvistettu</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
              <Calendar className="w-3 h-3" />
              <span>Liittynyt {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Follow button (not shown for own profile) */}
        {!isOwnProfile && userId && (
          <div className="mt-4">
            <FollowButton entityType="user" entityId={userId} />
          </div>
        )}

        {/* Edit profile link for own profile */}
        {isOwnProfile && (
          <Link
            to="/profile"
            className="mt-4 inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Muokkaa profiilia
          </Link>
        )}
      </div>

      {/* User's threads */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Keskustelut ({user.threads.length})
        </h2>

        {user.threads.length > 0 ? (
          <div className="space-y-3">
            {user.threads.map(thread => (
              <Link
                key={thread.id}
                to={`/agora/${thread.id}`}
                className="block bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 line-clamp-2">{thread.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {thread.content.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  {thread.municipalityName && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {thread.municipalityName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {thread.replyCount}
                  </span>
                  <span>{formatDate(thread.createdAt)}</span>
                </div>
                {thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {thread.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Ei julkisia keskusteluja</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
