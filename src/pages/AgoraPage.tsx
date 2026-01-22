import { useState, useMemo } from 'react'
import { Layout } from '../components/layout'
import { ThreadCard, AgoraFilters } from '../components/agora'
import { ContentEndMarker } from '../components/common'
import { threads, getAllTags, getUserById } from '../data'
import type { Scope } from '../types'

export function AgoraPage() {
  const [selectedScope, setSelectedScope] = useState<Scope | 'all'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const availableTags = useMemo(() => getAllTags(), [])

  const filteredThreads = useMemo(() => {
    return threads.filter(thread => {
      // Scope filter
      if (selectedScope !== 'all' && thread.scope !== selectedScope) {
        return false
      }

      // Tag filter - show if any selected tag matches
      if (selectedTags.length > 0 && !selectedTags.some(tag => thread.tags.includes(tag))) {
        return false
      }

      return true
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [selectedScope, selectedTags])

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleClearFilters = () => {
    setSelectedScope('all')
    setSelectedTags([])
  }

  return (
    <Layout>
      {/* Page header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Agora</h1>
        <p className="text-sm text-gray-600 mt-1">
          Public civic discussions — sorted by most recent activity
        </p>
      </div>

      {/* Filters */}
      <AgoraFilters
        selectedScope={selectedScope}
        onScopeChange={setSelectedScope}
        selectedTags={selectedTags}
        availableTags={availableTags}
        onTagToggle={handleTagToggle}
        onClearFilters={handleClearFilters}
      />

      {/* Thread list */}
      <div className="px-4 py-4">
        {filteredThreads.length > 0 ? (
          <div className="space-y-3">
            {filteredThreads.map(thread => {
              const author = getUserById(thread.authorId)
              if (!author) return null

              return (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  author={author}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No discussions match your filters</p>
            <button
              onClick={handleClearFilters}
              className="mt-2 text-blue-600 hover:underline text-sm"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* End marker - no infinite scroll */}
        {filteredThreads.length > 0 && (
          <ContentEndMarker />
        )}
      </div>
    </Layout>
  )
}
