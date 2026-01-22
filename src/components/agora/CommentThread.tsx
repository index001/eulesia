import type { Comment } from '../../types'
import { ActorBadge } from '../common/ActorBadge'
import { getUserById } from '../../data'

interface CommentItemProps {
  comment: Comment
  isReply?: boolean
}

function formatCommentDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function CommentItem({ comment, isReply = false }: CommentItemProps) {
  const author = getUserById(comment.authorId)
  if (!author) return null

  const isInstitution = author.role === 'institution'

  return (
    <div className={`${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className={`p-4 rounded-xl ${
        isInstitution
          ? 'bg-violet-50 border border-violet-200'
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <ActorBadge user={author} size="sm" />
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatCommentDate(comment.createdAt)}
          </span>
        </div>

        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </div>

        {/* Calm reaction area - no counters */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <button className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
            Reply
          </button>
          <span className="text-gray-300">|</span>
          <button className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  )
}

interface CommentThreadProps {
  comments: Comment[]
}

export function CommentThread({ comments }: CommentThreadProps) {
  // Group comments by parent
  const topLevel = comments.filter(c => !c.parentId)
  const replies = comments.filter(c => c.parentId)

  const getReplies = (parentId: string) =>
    replies.filter(r => r.parentId === parentId)

  return (
    <div className="space-y-4">
      {topLevel.map(comment => (
        <div key={comment.id}>
          <CommentItem comment={comment} />
          {getReplies(comment.id).map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      ))}
    </div>
  )
}
