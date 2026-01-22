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
    'a',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    code: ['class'],
    pre: ['class']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    })
  }
}

export function renderMarkdown(content: string): string {
  const html = marked(content) as string
  return sanitizeHtml(html, sanitizeOptions)
}
