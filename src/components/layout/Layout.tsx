import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
  showFooter?: boolean
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pt-14 pb-20">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {showFooter && <Footer />}

      <BottomNav />
    </div>
  )
}
