import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, Shield, MessageSquare, Pin, ScrollText } from 'lucide-react'
import { Layout } from '../components/layout'
import { ActorBadge, ContentEndMarker } from '../components/common'
import { getClubById, getClubThreadsByClub, getUserById } from '../data'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function ClubViewPage() {
  const { clubId } = useParams<{ clubId: string }>()
  const club = clubId ? getClubById(clubId) : undefined
  const threads = club ? getClubThreadsByClub(club.id) : []

  if (!club) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-gray-500">Club not found</p>
          <Link to="/clubs" className="text-teal-600 hover:underline mt-2 inline-block">
            Return to Clubs
          </Link>
        </div>
      </Layout>
    )
  }

  const moderators = club.moderators.map(id => getUserById(id)).filter(Boolean)
  const pinnedThread = threads.find(t => t.isPinned)
  const regularThreads = threads.filter(t => !t.isPinned)

  return (
    <Layout>
      {/* Back navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <Link
          to="/clubs"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clubs
        </Link>
      </div>

      {/* Club header */}
      <div className="bg-teal-50 px-4 py-6">
        <span className="text-xs text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
          {club.category}
        </span>

        <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2">
          {club.name}
        </h1>

        <p className="text-gray-600 mb-4">
          {club.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{club.memberCount.toLocaleString()} members</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{threads.length} threads</span>
          </div>
        </div>

        {/* Join button */}
        <button className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
          Join Club
        </button>
      </div>

      {/* Main content */}
      <div className="px-4 py-6 space-y-6">
        {/* Community rules */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Community Rules</h2>
          </div>
          <div className="p-4">
            <ol className="space-y-2">
              {club.rules.map((rule, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 font-medium">{i + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Moderators */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" />
            Moderators
          </h3>
          <div className="space-y-2">
            {moderators.map(mod => mod && (
              <ActorBadge key={mod.id} user={mod} size="sm" />
            ))}
          </div>
        </div>

        {/* Pinned thread */}
        {pinnedThread && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden">
            <div className="px-4 py-2 bg-amber-100 border-b border-amber-200 flex items-center gap-2 text-amber-800">
              <Pin className="w-4 h-4" />
              <span className="text-sm font-medium">Pinned</span>
            </div>
            <Link to={`/clubs/${club.id}/thread/${pinnedThread.id}`} className="block p-4 hover:bg-amber-100/50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-1">{pinnedThread.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{pinnedThread.content.substring(0, 150)}...</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span>{pinnedThread.replyCount} replies</span>
                <span>·</span>
                <span>Updated {formatDate(pinnedThread.updatedAt)}</span>
              </div>
            </Link>
          </div>
        )}

        {/* Threads */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Discussions</h2>

          {regularThreads.length > 0 ? (
            <div className="space-y-3">
              {regularThreads.map(thread => {
                const author = getUserById(thread.authorId)
                return (
                  <Link
                    key={thread.id}
                    to={`/clubs/${club.id}/thread/${thread.id}`}
                    className="block bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{thread.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {thread.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between">
                      {author && <ActorBadge user={author} size="sm" />}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {thread.replyCount}
                        </span>
                        <span>{formatDate(thread.updatedAt)}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No discussions yet</p>
            </div>
          )}

          {/* Start new thread button */}
          <button className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            Start a new discussion
          </button>

          <ContentEndMarker message="All discussions shown" />
        </div>
      </div>
    </Layout>
  )
}
