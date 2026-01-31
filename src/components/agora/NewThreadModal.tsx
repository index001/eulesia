import { useState, useEffect } from 'react'
import { X, MapPin, Building2, Globe, Loader2, Hash, Plus } from 'lucide-react'
import { useCreateThread } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import { LocationSearch } from '../common/LocationSearch'
import type { Scope } from '../../types'
import type { LocationResult } from '../../lib/api'

interface NewThreadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (threadId: string) => void
  // Pre-filled context (e.g., from municipality/location page)
  prefilledMunicipalityId?: string
  prefilledMunicipalityName?: string
  prefilledLocation?: LocationResult
}

const scopeOptions: { value: Scope; icon: React.ElementType; label: string; description: string }[] = [
  {
    value: 'local',
    icon: MapPin,
    label: 'Paikallinen',
    description: 'Kunta, kylä tai alue'
  },
  {
    value: 'national',
    icon: Building2,
    label: 'Valtakunnallinen',
    description: 'Koko Suomi'
  },
  {
    value: 'european',
    icon: Globe,
    label: 'EU',
    description: 'Euroopan laajuinen'
  }
]

// Common tags for quick selection
const suggestedTags = [
  'liikenne', 'koulutus', 'terveys', 'ympäristö', 'asuminen',
  'kulttuuri', 'talous', 'turvallisuus', 'sosiaalipalvelut', 'infrastruktuuri'
]

export function NewThreadModal({
  isOpen,
  onClose,
  onSuccess,
  prefilledMunicipalityId,
  prefilledMunicipalityName,
  prefilledLocation
}: NewThreadModalProps) {
  const { currentUser } = useAuth()
  const createThreadMutation = useCreateThread()

  // Form state
  const [scope, setScope] = useState<Scope>('local')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set prefilled values
  useEffect(() => {
    if (prefilledLocation) {
      setSelectedLocation(prefilledLocation)
      setScope('local')
    } else if (prefilledMunicipalityId && prefilledMunicipalityName) {
      // Legacy municipality support - convert to LocationResult format
      setSelectedLocation({
        id: prefilledMunicipalityId,
        osmId: 0,
        osmType: 'relation',
        name: prefilledMunicipalityName,
        nameFi: null,
        nameSv: null,
        nameEn: null,
        displayName: prefilledMunicipalityName,
        type: 'municipality',
        adminLevel: 7,
        country: 'FI',
        latitude: 0,
        longitude: 0,
        bounds: null,
        population: null,
        status: 'active',
        contentCount: 0,
        parent: null
      })
      setScope('local')
    }
  }, [prefilledLocation, prefilledMunicipalityId, prefilledMunicipalityName])

  const handleScopeChange = (newScope: Scope) => {
    setScope(newScope)
    // Clear location if switching to european
    if (newScope === 'european') {
      setSelectedLocation(null)
    }
  }

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
      // Build location data based on selected location status
      const locationData = scope === 'local' && selectedLocation
        ? selectedLocation.status === 'active' && selectedLocation.id
          ? { locationId: selectedLocation.id }
          : { locationOsmId: selectedLocation.osmId, locationOsmType: selectedLocation.osmType }
        : {}

      const result = await createThreadMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        scope,
        country: 'FI', // TODO: Make dynamic based on user's country
        ...locationData,
        tags: selectedTags.length > 0 ? selectedTags : undefined
      })

      onSuccess(result.id)
      handleClose()
    } catch (err) {
      setError('Keskustelun luominen epäonnistui. Yritä uudelleen.')
      console.error('Failed to create thread:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setContent('')
    setScope('local')
    setSelectedTags([])
    setCustomTag('')
    setError(null)
    if (!prefilledMunicipalityId && !prefilledLocation) {
      setSelectedLocation(null)
    }
    onClose()
  }

  if (!isOpen) return null

  const isPrefilled = !!(prefilledMunicipalityId || prefilledLocation)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Aloita keskustelu</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Scope selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minkä tason keskustelu?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {scopeOptions.map(({ value, icon: Icon, label, description }) => (
                <button
                  key={value}
                  onClick={() => handleScopeChange(value)}
                  disabled={isPrefilled && value !== 'local'}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    scope === value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isPrefilled && value !== 'local' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className={`w-6 h-6 mb-1 ${scope === value ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${scope === value ? 'text-blue-700' : 'text-gray-700'}`}>
                    {label}
                  </span>
                  <span className="text-xs text-gray-500 text-center mt-0.5">
                    {description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Location field (for local and national) */}
          {scope !== 'european' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {scope === 'local' ? 'Sijainti' : 'Maa'}
              </label>
              {scope === 'local' ? (
                <div className="relative">
                  {isPrefilled ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedLocation?.name}</span>
                    </div>
                  ) : (
                    <LocationSearch
                      value={selectedLocation}
                      onChange={setSelectedLocation}
                      country="FI"
                      types={['municipality', 'village', 'city']}
                      placeholder="Hae kuntaa, kaupunkia tai kylää..."
                    />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-lg">🇫🇮</span>
                  <span className="text-gray-700">Suomi</span>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Otsikko
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mistä haluaisit keskustella?"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
            <div className="mt-1 text-xs text-gray-400 text-right">
              {title.length}/500
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sisältö
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Kerro tarkemmin aiheesta..."
              rows={5}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="mt-1 text-xs text-gray-400">
              Tukee Markdown-muotoilua
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aiheet (valinnainen)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {suggestedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                </button>
              ))}
            </div>
            {/* Custom tag input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                placeholder="Lisää oma aihe..."
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddCustomTag}
                disabled={!customTag.trim()}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {/* Selected custom tags */}
            {selectedTags.filter(t => !suggestedTags.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedTags.filter(t => !suggestedTags.includes(t)).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-600 text-white rounded-full text-xs"
                  >
                    <Hash className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="ml-0.5 hover:bg-teal-700 rounded-full p-0.5"
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Peruuta
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Julkaistaan...' : 'Julkaise keskustelu'}
          </button>
        </div>
      </div>
    </div>
  )
}
