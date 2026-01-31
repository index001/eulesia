import { useState, useMemo, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { ThreadCard, FeedFilters, FeedOnboarding, NewThreadModal } from '../components/agora'
import { ContentEndMarker } from '../components/common'
import { useThreads, useTags, useMunicipalities, useVoteThread, useSubscriptions } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import type { Thread as ApiThread, UserSummary, FeedScope, SortBy, TopPeriod } from '../lib/api'

// Transform API thread to component format
function transformThread(thread: ApiThread) {
  return {
    id: thread.id,
    title: thread.title,
    scope: thread.scope,
    municipalityId: thread.municipality?.id,
    municipalityName: thread.municipality?.name,
    tags: thread.tags,
    authorId: thread.author.id,
    content: thread.content,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    replyCount: thread.replyCount,
    score: thread.score,
    userVote: thread.userVote,
    institutionalContext: thread.institutionalContext,
    source: thread.source,
    sourceUrl: thread.sourceUrl,
    aiGenerated: thread.aiGenerated
  }
}

// Transform API user to component format
function transformAuthor(author: UserSummary) {
  return {
    id: author.id,
    name: author.name,
    role: author.role,
    verified: true,
    avatarInitials: author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    institutionType: author.institutionType as 'municipality' | 'agency' | 'ministry' | undefined,
    institutionName: author.institutionName
  }
}

export function AgoraPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  // Feed state
  const [feedScope, setFeedScope] = useState<FeedScope>('all')
  const [sortBy, setSortBy] = useState<SortBy>('recent')
  const [topPeriod, setTopPeriod] = useState<TopPeriod>('week')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | undefined>()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: tagsData } = useTags()
  const { data: municipalitiesData } = useMunicipalities()
  const { data: subscriptionsData } = useSubscriptions()

  // Build filters for the API
  const filters = useMemo(() => ({
    feedScope,
    sortBy,
    topPeriod: sortBy === 'top' ? topPeriod : undefined,
    municipalityId: selectedMunicipality,
    tags: selectedTags.length > 0 ? selectedTags : undefined
  }), [feedScope, sortBy, topPeriod, selectedMunicipality, selectedTags])

  const { data: threadsData, isLoading, error } = useThreads(filters)
  const voteThreadMutation = useVoteThread(filters)

  // Determine if user has subscriptions
  const hasSubscriptions = useMemo(() => {
    if (!subscriptionsData) return false
    return subscriptionsData.length > 0
  }, [subscriptionsData])

  // Set default feed scope based on subscriptions
  useEffect(() => {
    if (currentUser && subscriptionsData !== undefined) {
      if (hasSubscriptions) {
        setFeedScope('following')
      } else {
        setFeedScope('all')
      }
    }
  }, [currentUser, subscriptionsData, hasSubscriptions])

  // Show onboarding when following feed is empty
  useEffect(() => {
    if (
      feedScope === 'following' &&
      !isLoading &&
      threadsData?.hasSubscriptions === false
    ) {
      setShowOnboarding(true)
    }
  }, [feedScope, isLoading, threadsData?.hasSubscriptions])

  const availableTags = useMemo(() => {
    return tagsData?.map(t => t.tag) || []
  }, [tagsData])

  const threads = useMemo(() => {
    if (!threadsData?.items) return []
    return threadsData.items.map(transformThread)
  }, [threadsData])

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleVote = (threadId: string, value: number) => {
    if (!currentUser) return
    voteThreadMutation.mutate({ threadId, value })
  }

  const handleThreadCreated = (threadId: string) => {
    navigate(`/agora/${threadId}`)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  return (
    <Layout>
      {/* Page header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Agora</h1>
            <p className="text-sm text-gray-600 mt-1">
              Julkiset kansalaiskeskustelut
            </p>
          </div>
          {currentUser && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Uusi keskustelu
            </button>
          )}
        </div>
      </div>

      {/* New Thread Modal */}
      <NewThreadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleThreadCreated}
      />

      {/* Filters */}
      <FeedFilters
        feedScope={feedScope}
        onFeedScopeChange={setFeedScope}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        topPeriod={topPeriod}
        onTopPeriodChange={setTopPeriod}
        selectedTags={selectedTags}
        availableTags={availableTags}
        onTagToggle={handleTagToggle}
        municipalities={municipalitiesData}
        selectedMunicipality={selectedMunicipality}
        onMunicipalityChange={setSelectedMunicipality}
        hasSubscriptions={hasSubscriptions}
      />

      {/* Thread list */}
      <div className="px-4 py-4">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-600">
            <p>Keskustelujen lataaminen epäonnistui</p>
            <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Tuntematon virhe'}</p>
          </div>
        )}

        {/* Onboarding for empty following feed */}
        {!isLoading && !error && showOnboarding && feedScope === 'following' && (
          <div className="py-8">
            <FeedOnboarding onComplete={handleOnboardingComplete} />
          </div>
        )}

        {/* Thread list */}
        {!isLoading && !error && !showOnboarding && threads.length > 0 && (
          <div className="space-y-3">
            {threadsData?.items.map(thread => (
              <ThreadCard
                key={thread.id}
                thread={transformThread(thread)}
                author={transformAuthor(thread.author)}
                onVote={handleVote}
                isVoting={voteThreadMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Empty state (not onboarding) */}
        {!isLoading && !error && !showOnboarding && threads.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Ei keskusteluja valituilla suodattimilla</p>
            {feedScope === 'following' && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Muokkaa seuraamisia
              </button>
            )}
          </div>
        )}

        {/* End marker */}
        {!isLoading && !showOnboarding && threads.length > 0 && (
          <ContentEndMarker />
        )}
      </div>
    </Layout>
  )
}
