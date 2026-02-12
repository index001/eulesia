import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'eulesia_cookie_consent'

export function CookieConsent() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Small delay so it doesn't flash immediately on load
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  const dismiss = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'dismissed')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4 animate-in slide-in-from-bottom duration-500 sm:bottom-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mt-0.5">
            <Cookie className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('cookies.message')}
              {' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                {t('cookies.learnMore')}
              </Link>
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={accept}
                className="px-4 py-1.5 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('cookies.accept')}
              </button>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('actions.close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
