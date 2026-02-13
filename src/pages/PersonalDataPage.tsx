import { ArrowLeft, Download, Loader2, Database, MessageSquare, Users, Bell, FileText, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Layout } from '../components/layout'
import { api } from '../lib/api'

export function PersonalDataPage() {
  const { t } = useTranslation('profile')

  const { data, isLoading } = useQuery({
    queryKey: ['personal-data'],
    queryFn: () => api.exportData() as Promise<{
      exportedAt: string
      user: { name: string; email: string; createdAt: string }
      threads: unknown[]
      comments: unknown[]
      clubMemberships: unknown[]
      rooms: unknown[]
      roomMessages: unknown[]
      notifications: unknown[]
      subscriptions: unknown[]
    }>
  })

  const exportMutation = useMutation({
    mutationFn: () => api.exportData(),
    onSuccess: (result) => {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'eulesia-my-data.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  })

  const categories = data ? [
    { icon: <FileText className="w-4 h-4" />, label: t('personalData.threads'), count: data.threads.length },
    { icon: <MessageSquare className="w-4 h-4" />, label: t('personalData.comments'), count: data.comments.length },
    { icon: <Users className="w-4 h-4" />, label: t('personalData.clubMemberships'), count: data.clubMemberships.length },
    { icon: <Home className="w-4 h-4" />, label: t('personalData.rooms'), count: data.rooms.length },
    { icon: <MessageSquare className="w-4 h-4" />, label: t('personalData.roomMessages'), count: data.roomMessages.length },
    { icon: <Bell className="w-4 h-4" />, label: t('personalData.notifications'), count: data.notifications.length },
    { icon: <Database className="w-4 h-4" />, label: t('personalData.subscriptions'), count: data.subscriptions.length },
  ] : []

  return (
    <Layout>
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('personalData.back')}
        </Link>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('personalData.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('personalData.description')}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  {t('personalData.storedData')}
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {categories.map((cat, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{cat.icon}</span>
                      <span className="text-sm text-gray-700">{cat.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-800 mb-3">{t('personalData.exportInfo')}</p>
              <button
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {exportMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {t('privacy.exportData')}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
