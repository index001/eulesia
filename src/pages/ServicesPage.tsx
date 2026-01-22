import { Store, Calendar, BookOpen, Bus, Newspaper, Heart, ChevronRight, Info } from 'lucide-react'
import { Layout } from '../components/layout'
import { ContentEndMarker } from '../components/common'
import { services, getServiceCategories } from '../data'
import type { Service } from '../types'

const categoryIcons: Record<string, React.ElementType> = {
  'Recreation': Calendar,
  'Community': Heart,
  'Culture': BookOpen,
  'Transport': Bus,
  'Media': Newspaper
}

function ServiceCard({ service }: { service: Service }) {
  const Icon = categoryIcons[service.category] || Store

  return (
    <button className="w-full text-left bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{service.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{service.provider}</p>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{service.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
      </div>
    </button>
  )
}

export function ServicesPage() {
  const categories = getServiceCategories()

  const servicesByCategory = categories.reduce((acc, category) => {
    acc[category] = services.filter(s => s.category === category)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <Layout>
      {/* Page header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <Store className="w-5 h-5 text-gray-700" />
          <h1 className="text-xl font-bold text-gray-900">Services</h1>
        </div>
        <p className="text-sm text-gray-600">
          Useful integrations — optional, not the core
        </p>
      </div>

      {/* Explanation banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-900">
              Services complement Eulesia but don't define it. The civic core (Agora, Clubs, Home)
              operates independently. Services are optional integrations that respect your privacy.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {category}
            </h2>
            <div className="space-y-3">
              {servicesByCategory[category].map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        ))}

        {/* No attention economy note */}
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">
            No algorithmic recommendations. No engagement optimization.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Just useful services, when you need them.
          </p>
        </div>

        <ContentEndMarker message="All services shown" />
      </div>
    </Layout>
  )
}
