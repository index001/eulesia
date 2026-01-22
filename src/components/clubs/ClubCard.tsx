import { Users, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Club } from '../../types'

interface ClubCardProps {
  club: Club
}

export function ClubCard({ club }: ClubCardProps) {
  return (
    <Link
      to={`/clubs/${club.id}`}
      className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Category badge */}
          <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
            {club.category}
          </span>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 mt-2 mb-1">
            {club.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {club.description}
          </p>

          {/* Member count - acceptable in community layer */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{club.memberCount.toLocaleString()} members</span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-6" />
      </div>
    </Link>
  )
}
