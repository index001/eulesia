import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { EulesiaMap, LocationDetails } from '../components/map'
import type { MapPoint } from '../lib/api'
import { DEFAULT_FILTERS, type MapFilterState } from '../components/map/types'

export function MapPage() {
  const { t: _t } = useTranslation('map')
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null)
  const [filters, setFilters] = useState<MapFilterState>(DEFAULT_FILTERS)

  const handlePointClick = (point: MapPoint) => {
    setSelectedPoint(point)
  }

  const handleCloseDetails = () => {
    setSelectedPoint(null)
  }

  return (
    <Layout fullWidth showFooter={false}>
      <div className="fixed inset-0 top-14 bottom-16">
        <EulesiaMap
          filters={filters}
          onFiltersChange={setFilters}
          onPointClick={handlePointClick}
        />

        {selectedPoint && (
          <LocationDetails
            point={selectedPoint}
            onClose={handleCloseDetails}
          />
        )}
      </div>
    </Layout>
  )
}
