import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Layout } from '../components/layout'
import { ClubCard } from '../components/clubs'
import { ContentEndMarker } from '../components/common'
import { clubs, getClubCategories } from '../data'

export function ClubsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => getClubCategories(), [])

  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      // Category filter
      if (selectedCategory && club.category !== selectedCategory) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          club.name.toLowerCase().includes(query) ||
          club.description.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [searchQuery, selectedCategory])

  return (
    <Layout>
      {/* Page header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Clubs</h1>
        <p className="text-sm text-gray-600 mt-1">
          Community spaces for shared interests — citizen self-organization
        </p>
      </div>

      {/* Search and filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-14 z-40">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Club list */}
      <div className="px-4 py-4">
        {filteredClubs.length > 0 ? (
          <div className="space-y-3">
            {filteredClubs.map(club => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No clubs match your search</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
              }}
              className="mt-2 text-teal-600 hover:underline text-sm"
            >
              Clear filters
            </button>
          </div>
        )}

        {filteredClubs.length > 0 && (
          <ContentEndMarker message="All clubs shown" />
        )}
      </div>
    </Layout>
  )
}
