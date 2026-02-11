import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { sanitizeContent } from '../../utils/sanitize'
import { LinkPreview } from './LinkPreview'

interface ContentWithPreviewsProps {
  html: string
  className?: string
}

export function ContentWithPreviews({ html, className }: ContentWithPreviewsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [previewTargets, setPreviewTargets] = useState<{ url: string; element: HTMLElement }[]>([])

  const sanitizedHtml = sanitizeContent(html)

  useEffect(() => {
    if (!containerRef.current) return

    const targets: { url: string; element: HTMLElement }[] = []
    const previewDivs = containerRef.current.querySelectorAll('.link-preview[data-url]')

    previewDivs.forEach((div) => {
      const url = div.getAttribute('data-url')
      if (url) {
        targets.push({ url, element: div as HTMLElement })
      }
    })

    setPreviewTargets(targets)
  }, [sanitizedHtml])

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      {previewTargets.map(({ url, element }) =>
        createPortal(<LinkPreview url={url} />, element)
      )}
    </>
  )
}
