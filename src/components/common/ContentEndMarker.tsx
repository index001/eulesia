import { CheckCircle } from 'lucide-react'

interface ContentEndMarkerProps {
  message?: string
}

export function ContentEndMarker({ message = "You're up to date" }: ContentEndMarkerProps) {
  return (
    <div className="py-8 text-center border-t border-gray-200 mt-4">
      <div className="flex items-center justify-center gap-2 text-gray-500">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        No more content to show
      </p>
    </div>
  )
}
