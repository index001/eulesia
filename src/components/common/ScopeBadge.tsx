import { MapPin, Building2, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Scope } from '../../types'

interface ScopeBadgeProps {
  scope: Scope
  municipalityName?: string
  municipalityId?: string
  countryName?: string
}

const scopeConfig = {
  local: {
    icon: MapPin,
    label: 'Paikallinen',
    color: 'text-blue-700 bg-blue-50'
  },
  national: {
    icon: Building2,
    label: 'Valtakunnallinen',
    color: 'text-amber-700 bg-amber-50'
  },
  european: {
    icon: Globe,
    label: 'EU',
    color: 'text-emerald-700 bg-emerald-50'
  }
}

export function ScopeBadge({ scope, municipalityName, municipalityId, countryName }: ScopeBadgeProps) {
  const config = scopeConfig[scope]
  const Icon = config.icon

  // Determine display label
  let displayLabel = config.label
  if (scope === 'local' && municipalityName) {
    displayLabel = municipalityName
  } else if (scope === 'national' && countryName) {
    displayLabel = countryName
  }

  const content = (
    <>
      <Icon className="w-3 h-3" />
      <span>{displayLabel}</span>
    </>
  )

  // If municipality is specified for local scope, make it a clickable link
  if (scope === 'local' && municipalityId) {
    return (
      <Link
        to={`/kunnat/${municipalityId}`}
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.color} hover:opacity-80 transition-opacity`}
      >
        {content}
      </Link>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.color}`}>
      {content}
    </span>
  )
}
