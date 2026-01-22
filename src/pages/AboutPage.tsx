import { ArrowLeft, Building, Globe, Code, Users, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout'

export function AboutPage() {
  return (
    <Layout>
      {/* Back navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
      </div>

      {/* Header */}
      <div className="bg-blue-900 px-4 py-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <span className="text-blue-900 font-bold text-xl">E</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Eulesia</h1>
            <p className="text-blue-200 text-sm">European Civic Digital Infrastructure</p>
          </div>
        </div>
        <p className="text-blue-100 leading-relaxed">
          Eulesia is a social platform designed as civic infrastructure rather than commercial media.
          Public space, not private platform.
        </p>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Foundation */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              Eulesia Foundation
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-700">
              Eulesia is operated by an independent, non-profit foundation based in Helsinki, Finland.
              The foundation's mission is to provide civic digital infrastructure for the public good.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">Not for profit</p>
                <p className="text-xs text-gray-500 mt-1">No shareholders, no profit motive</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">Independent</p>
                <p className="text-xs text-gray-500 mt-1">Free from commercial pressures</p>
              </div>
            </div>
          </div>
        </div>

        {/* Governance model */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              Three-Layer Governance
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Infrastructure Layer</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Identity and protocols aligned with EU Digital Public Infrastructure frameworks (EUDI Wallet).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building className="w-4 h-4 text-violet-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Platform Layer</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Governed by the Eulesia Foundation. Open, transparent, and accountable to the public.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Community Layer</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Clubs are self-governed by their members with community-set rules and elected moderators.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What we're not */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">What Eulesia is NOT</h2>
          </div>
          <div className="p-4">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✕</span>
                <span>Not shareholder-accountable (unlike Meta, X)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✕</span>
                <span>Not advertiser-dependent (unlike all commercial platforms)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✕</span>
                <span>Not subject to unilateral policy changes by private actors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✕</span>
                <span>Not optimized for engagement, attention, or addiction</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Open source */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              Open Source
            </h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700 mb-3">
              Eulesia's code is open source. Anyone can inspect, audit, and contribute to the platform.
              Transparency is a core principle.
            </p>
            <button className="text-sm text-blue-600 hover:underline">
              View on GitHub →
            </button>
          </div>
        </div>

        {/* EU alignment */}
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <span className="text-3xl">🇪🇺</span>
          <div>
            <p className="font-medium text-blue-900">European Digital Public Infrastructure</p>
            <p className="text-sm text-blue-700 mt-1">
              Aligned with EU values: privacy, dignity, democratic governance
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
