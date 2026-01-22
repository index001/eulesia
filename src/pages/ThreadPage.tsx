import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Layout } from '../components/layout'
import { ActorBadge, ScopeBadge, TagList, ContentEndMarker } from '../components/common'
import { InstitutionalContextBox } from '../components/agora/InstitutionalContextBox'
import { CommentThread } from '../components/agora/CommentThread'
import { getThreadById, getCommentsByThread, getUserById } from '../data'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>()
  const thread = threadId ? getThreadById(threadId) : undefined
  const author = thread ? getUserById(thread.authorId) : undefined
  const comments = thread ? getCommentsByThread(thread.id) : []

  if (!thread || !author) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-gray-500">Thread not found</p>
          <Link to="/agora" className="text-blue-600 hover:underline mt-2 inline-block">
            Return to Agora
          </Link>
        </div>
      </Layout>
    )
  }

  const isInstitutional = author.role === 'institution'

  return (
    <Layout>
      {/* Back navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <Link
          to="/agora"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agora
        </Link>
      </div>

      {/* Thread header */}
      <div className={`px-4 py-6 ${isInstitutional ? 'bg-violet-50' : 'bg-white'}`}>
        {/* Institutional indicator */}
        {isInstitutional && (
          <div className="flex items-center gap-1.5 text-sm text-violet-700 mb-3">
            <Building2 className="w-4 h-4" />
            <span className="font-medium">Official channel</span>
          </div>
        )}

        {/* Scope and meta */}
        <div className="flex items-center gap-3 mb-3">
          <ScopeBadge
            scope={thread.scope}
            municipalityName={thread.municipalityId ? `${thread.municipalityId.charAt(0).toUpperCase()}${thread.municipalityId.slice(1)}` : undefined}
          />
          <span className="text-xs text-gray-500">
            Posted {formatDate(thread.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {thread.title}
        </h1>

        {/* Tags */}
        <div className="mb-4">
          <TagList tags={thread.tags} size="md" />
        </div>

        {/* Author */}
        <div className="pt-4 border-t border-gray-200">
          <ActorBadge user={author} />
        </div>
      </div>

      {/* Main content area */}
      <div className="px-4 py-6 space-y-6">
        {/* Institutional context box - if applicable */}
        {thread.institutionalContext && (
          <InstitutionalContextBox context={thread.institutionalContext} />
        )}

        {/* Thread content */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="prose prose-gray max-w-none">
            {thread.content.split('\n').map((paragraph, i) => {
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <h3 key={i} className="font-semibold text-gray-900 mt-4 first:mt-0">
                    {paragraph.replace(/\*\*/g, '')}
                  </h3>
                )
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <li key={i} className="ml-4 text-gray-700">
                    {paragraph.replace('- ', '')}
                  </li>
                )
              }
              if (paragraph.trim() === '') {
                return <br key={i} />
              }
              return (
                <p key={i} className="text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              )
            })}
          </div>
        </div>

        {/* Discussion section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Discussion ({comments.length} {comments.length === 1 ? 'reply' : 'replies'})
          </h2>

          {/* Comment input */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
            <textarea
              placeholder="Share your thoughts..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Post reply
              </button>
            </div>
          </div>

          {/* Comments */}
          {comments.length > 0 ? (
            <CommentThread comments={comments} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No replies yet. Be the first to contribute to this discussion.</p>
            </div>
          )}

          {/* End marker */}
          <ContentEndMarker message="End of discussion" />
        </div>
      </div>
    </Layout>
  )
}
