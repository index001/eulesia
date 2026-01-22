import { MapPin, Map, Globe } from 'lucide-react'
import type { Scope } from '../../types'

interface ScopeBadgeProps {
  scope: Scope
  municipalityName?: string
}

const scopeConfig = {
  municipal: {
    icon: MapPin,
    label: 'Municipal',
    color: 'text-blue-700 bg-blue-50'
  },
  regional: {
    icon: Map,
    label: 'Regional',
    color: 'text-amber-700 bg-amber-50'
  },
  national: {
    icon: Globe,
    label: 'National',
    color: 'text-emerald-700 bg-emerald-50'
  }
}

export function ScopeBadge({ scope, municipalityName }: ScopeBadgeProps) {
  const config = scopeConfig[scope]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.color}`}>
      <Icon className="w-3 h-3" />
      <span>{municipalityName || config.label}</span>
    </span>
  )
}
