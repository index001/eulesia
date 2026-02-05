import { useState, useRef, useEffect } from 'react'
import { MapPin, Hash, Plus, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { useCreateThread } from '../../hooks/useApi'

interface InlineThreadFormProps {
  locationId: string
  locationName: string
  onSuccess: (threadId: string) => void
}

// Common tags for quick selection
const suggestedTags = [
  'liikenne', 'koulutus', 'terveys', 'ympäristö', 'asuminen',
  'kulttuuri', 'talous', 'turvallisuus', 'sosiaalipalvelut', 'infrastruktuuri'
]

export function InlineThreadForm({ locationId, locationName, onSuccess }: InlineThreadFormProps) {
  const createThreadMutation = useCreateThread()
  const formRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Focus title input when expanded
  useEffect(() => {
    if (isExpanded && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isExpanded])

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleAddCustomTag = () => {
    const tag = customTag.trim().toLowerCase()
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag])
      setCustomTag('')
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Otsikko ja sisältö ovat pakollisia')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createThreadMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        scope: 'local',
        country: 'FI',
        locationId,
        tags: selectedTags.length > 0 ? selectedTags : undefined
      })

      // Reset form
      setTitle('')
      setContent('')
      setSelectedTags([])
      setIsExpanded(false)

      onSuccess(result.id)
    } catch (err) {
      setError('Keskustelun luominen epäonnistui. Yritä uudelleen.')
      console.error('Failed to create thread:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setContent('')
    setSelectedTags([])
    setError(null)
    setIsExpanded(false)
  }

  return (
    <div ref={formRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all">
      {/* Collapsed state */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Plus className="w-4 h-4 text-blue-600" />
          </div>
          <span className="flex-1 text-gray-500">Aloita uusi keskustelu...</span>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      ) : (
        /* Expanded state */
        <div className="p-4 space-y-4">
          {/* Header with location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-700">{locationName}</span>
            </div>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronUp className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Title */}
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Otsikko"
            className="w-full px-0 py-1 border-0 border-b border-gray-200 text-lg font-medium placeholder-gray-400 focus:ring-0 focus:border-blue-500"
            maxLength={500}
          />

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Kerro tarkemmin aiheesta..."
            rows={4}
            className="w-full px-0 py-1 border-0 text-gray-700 placeholder-gray-400 focus:ring-0 resize-none"
          />

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {suggestedTags.slice(0, 6).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                </button>
              ))}
              {/* Custom tag input inline */}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-full">
                <Hash className="w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                  placeholder="muu..."
                  className="w-16 bg-transparent border-0 p-0 text-xs focus:ring-0 focus:outline-none"
                />
              </div>
            </div>
            {/* Selected custom tags */}
            {selectedTags.filter(t => !suggestedTags.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.filter(t => !suggestedTags.includes(t)).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-600 text-white rounded-full text-xs"
                  >
                    <Hash className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="hover:bg-teal-700 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Peruuta
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Julkaistaan...' : 'Julkaise'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
