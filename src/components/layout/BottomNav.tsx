import { Landmark, Users, Home, MapPin, MessageSquare } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUnreadDmCount } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'

const allNavItems = [
  { to: '/agora', icon: Landmark, tKey: 'nav.agora', public: true },
  { to: '/clubs', icon: Users, tKey: 'nav.clubs', public: false },
  { to: '/messages', icon: MessageSquare, tKey: 'nav.messages', badge: 'dm' as const, public: false },
  { to: '/map', icon: MapPin, tKey: 'nav.map', public: true },
  { to: '/home', icon: Home, tKey: 'nav.home', public: false }
]

export function BottomNav() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const { data: dmUnread } = useUnreadDmCount()
  const unreadCount = dmUnread?.count ?? 0

  const navItems = currentUser ? allNavItems : allNavItems.filter(item => item.public)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)]" data-guide="bottomnav">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around">
          {navItems.map(({ to, icon: Icon, tKey, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center py-3 px-4 transition-colors relative ${
                  isActive
                    ? 'text-blue-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {badge === 'dm' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{t(tKey)}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
