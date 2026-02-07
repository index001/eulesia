import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'
import type { User } from '../../lib/api'

const languages = [
  { code: 'fi', label: 'Suomi' },
  { code: 'en', label: 'English' }
] as const

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact'
  className?: string
}

export function LanguageSwitcher({ variant = 'default', className = '' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const { currentUser } = useAuth()

  const handleChange = async (lng: string) => {
    await i18n.changeLanguage(lng)
    if (currentUser) {
      try {
        await api.updateProfile({ settings: { ...currentUser.settings, locale: lng } } as Partial<User>)
      } catch {
        // Ignore - localStorage is already updated by i18next
      }
    }
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <Globe className="w-3.5 h-3.5 text-gray-500" />
        {languages.map((lang, i) => (
          <span key={lang.code}>
            {i > 0 && <span className="text-gray-400 mx-0.5">/</span>}
            <button
              onClick={() => handleChange(lang.code)}
              className={`text-sm transition-colors ${
                i18n.language === lang.code
                  ? 'font-semibold text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {lang.label}
            </button>
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="w-4 h-4 text-gray-500" />
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            i18n.language === lang.code
              ? 'bg-blue-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
