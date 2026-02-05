import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true
})

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'strong', 'em', 'del', 's',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    code: ['class'],
    pre: ['class']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['https', 'http']  // Only allow http/https for images
  },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    }),
    img: (tagName, attribs) => {
      // Only allow images from our uploads (relative or absolute API URL)
      const src = attribs.src || ''
      const apiUrl = process.env.API_URL || 'http://localhost:3001'
      const isLocalUpload = src.startsWith('/uploads/')
      const isApiUpload = src.startsWith(`${apiUrl}/uploads/`)
      const isApiDomain = src.startsWith('https://api.eulesia.eu/uploads/')

      if (!isLocalUpload && !isApiUpload && !isApiDomain) {
        // Return empty to strip external images
        return { tagName: '', attribs: {} }
      }

      return {
        tagName,
        attribs: {
          ...attribs,
          loading: 'lazy',
          class: 'uploaded-image'
        }
      }
    }
  }
}

export function renderMarkdown(content: string): string {
  const html = marked(content) as string
  return sanitizeHtml(html, sanitizeOptions)
}
