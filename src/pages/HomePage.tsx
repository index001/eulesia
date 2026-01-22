import { Lock, Users, ChevronRight, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout'
import { ActorBadge, ContentEndMarker } from '../components/common'
import { getConversations, getUserGroups, getUserById } from '../data'
import { useAuth } from '../hooks/useAuth'

function formatMessageDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-GB', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
}

export function HomePage() {
  const { currentUser } = useAuth()
  const userId = currentUser?.id || 'current-user'

  const conversations = getConversations(userId)
  const groups = getUserGroups(userId)

  return (
    <Layout>
      {/* Page header - different color to signal private space */}
      <div className="bg-purple-900 px-4 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-5 h-5 text-purple-300" />
          <h1 className="text-xl font-bold text-white">Home</h1>
        </div>
        <p className="text-sm text-purple-200">
          Private messages — end-to-end encrypted
        </p>
      </div>

      {/* E2EE explanation banner */}
      <div className="bg-purple-100 border-b border-purple-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-purple-700" />
          </div>
          <div>
            <p className="text-sm text-purple-900 font-medium">Your private space</p>
            <p className="text-xs text-purple-700 mt-0.5">
              Messages here are end-to-end encrypted. Only you and your conversation partners can read them.
              This space is not part of the public Agora.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Private groups */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Groups
          </h2>
          <div className="space-y-2">
            {groups.map(group => (
              <Link
                key={group.id}
                to={`/home/group/${group.id}`}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    <p className="text-xs text-gray-500">{group.members.length} members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Direct messages */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Messages
          </h2>
          <div className="space-y-2">
            {conversations.map(({ partnerId, lastMessage }) => {
              const partner = getUserById(partnerId)
              if (!partner) return null

              return (
                <Link
                  key={partnerId}
                  to={`/home/chat/${partnerId}`}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ActorBadge user={partner} showName={false} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{partner.name}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage.senderId === userId ? 'You: ' : ''}
                        {lastMessage.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3">
                    <span className="text-xs text-gray-500">
                      {formatMessageDate(lastMessage.createdAt)}
                    </span>
                    <Lock className="w-3 h-3 text-purple-400" />
                  </div>
                </Link>
              )
            })}
          </div>

          {conversations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet</p>
            </div>
          )}
        </div>

        {/* New message button */}
        <button className="w-full bg-purple-800 text-white px-4 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">
          Start new conversation
        </button>

        <ContentEndMarker message="All conversations shown" />
      </div>
    </Layout>
  )
}
