import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Landmark, Users, MapPin, Building2, Settings } from 'lucide-react'
import type { MapFilterState, MapFilterType, TimePreset } from './types'
import { MapAdvancedFilters } from './MapAdvancedFilters'

interface MapFiltersProps {
  filters: MapFilterState
  onFiltersChange: (filters: MapFilterState) => void
}

const typeFilters: { type: MapFilterType; icon: typeof Landmark; labelKey: string; color: string }[] = [
  { type: 'municipalities', icon: Building2, labelKey: 'filters.cities', color: 'bg-blue-600' },
  { type: 'agora', icon: Landmark, labelKey: 'filters.agora', color: 'bg-purple-600' },
  { type: 'clubs', icon: Users, labelKey: 'filters.clubs', color: 'bg-green-600' },
  { type: 'places', icon: MapPin, labelKey: 'filters.places', color: 'bg-orange-600' }
]

const timePresets: { value: TimePreset; labelKey: string }[] = [
  { value: 'week', labelKey: 'filters.week' },
  { value: 'month', labelKey: 'filters.month' },
  { value: 'year', labelKey: 'filters.year' },
  { value: 'all', labelKey: 'filters.all' }
]

export function MapFilters({ filters, onFiltersChange }: MapFiltersProps) {
  const { t } = useTranslation('map')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleToggleType = (type: MapFilterType) => {
    const types = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    onFiltersChange({ ...filters, types })
  }

  const handleTimePreset = (preset: TimePreset) => {
    onFiltersChange({
      ...filters,
      timePreset: preset,
      dateFrom: undefined,
      dateTo: undefined
    })
  }

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
        {/* Type toggles */}
        <div className="flex gap-1">
          {typeFilters.map(({ type, icon: Icon, labelKey, color }) => {
            const isActive = filters.types.includes(type)
            return (
              <button
                key={type}
                onClick={() => handleToggleType(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? `${color} text-white`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={t(labelKey)}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t(labelKey)}</span>
              </button>
            )
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Time presets */}
        <div className="flex gap-1">
          {timePresets.map(({ value, labelKey }) => {
            const isActive = filters.timePreset === value && !filters.dateFrom && !filters.dateTo
            return (
              <button
                key={value}
                onClick={() => handleTimePreset(value)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t(labelKey)}
              </button>
            )
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Advanced filters button */}
        <button
          onClick={() => setShowAdvanced(true)}
          className={`p-1.5 rounded-md transition-colors ${
            (filters.scopes?.length || filters.languages?.length || filters.tags?.length || filters.dateFrom)
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={t('filters.advanced')}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {showAdvanced && (
        <MapAdvancedFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClose={() => setShowAdvanced(false)}
        />
      )}
    </>
  )
}
