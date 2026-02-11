import { Router, type Request, type Response } from 'express'
import { db, threads, clubs, clubThreads, municipalities, users } from '../db/index.js'
import { eq } from 'drizzle-orm'

const router = Router()

const SITE_NAME = 'Eulesia'
const DEFAULT_DESCRIPTION = 'Eurooppalainen kansalaisdemokratia-alusta'
const DEFAULT_IMAGE = '/og-default.png'

const BOT_PATTERNS = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|Discordbot|TelegramBot|Embedly|Pinterest|vkShare|Applebot/i

function isBot(req: Request): boolean {
  const ua = req.headers['user-agent'] || ''
  return BOT_PATTERNS.test(ua)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function stripMarkdown(text: string): string {
  return text
    .replace(/[#*_~`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 200)
}

function buildOgHtml(opts: {
  title: string
  description: string
  url: string
  type?: string
  image?: string
  siteName?: string
}): string {
  const {
    title,
    description,
    url,
    type = 'article',
    image,
    siteName = SITE_NAME
  } = opts

  const appUrl = process.env.APP_URL || 'https://eulesia.eu'
  const fullUrl = url.startsWith('http') ? url : `${appUrl}${url}`
  const imageUrl = image
    ? (image.startsWith('http') ? image : `${process.env.API_URL || appUrl}${image}`)
    : `${appUrl}${DEFAULT_IMAGE}`

  return `<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)} - ${escapeHtml(siteName)}</title>
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(fullUrl)}" />
  <meta property="og:type" content="${escapeHtml(type)}" />
  <meta property="og:site_name" content="${escapeHtml(siteName)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(fullUrl)}" />
</head>
<body></body>
</html>`
}

// Thread OG
router.get('/og/agora/thread/:threadId', async (req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || 'https://eulesia.eu'
  if (!isBot(req)) return res.redirect(`${appUrl}/agora/thread/${req.params.threadId}`)
  try {
    const [thread] = await db
      .select({
        title: threads.title,
        content: threads.content,
        scope: threads.scope
      })
      .from(threads)
      .where(eq(threads.id, req.params.threadId))
      .limit(1)

    if (!thread) {
      return res.status(200).send(buildOgHtml({
        title: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        url: `/agora/thread/${req.params.threadId}`
      }))
    }

    res.send(buildOgHtml({
      title: thread.title,
      description: stripMarkdown(thread.content),
      url: `/agora/thread/${req.params.threadId}`,
      type: 'article'
    }))
  } catch {
    res.status(200).send(buildOgHtml({
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: `/agora/thread/${req.params.threadId}`
    }))
  }
})

// Club OG
router.get('/og/clubs/:clubId', async (req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || 'https://eulesia.eu'
  if (!isBot(req)) return res.redirect(`${appUrl}/clubs/${req.params.clubId}`)
  try {
    const [club] = await db
      .select({
        name: clubs.name,
        description: clubs.description,
        coverImageUrl: clubs.coverImageUrl,
        memberCount: clubs.memberCount
      })
      .from(clubs)
      .where(eq(clubs.id, req.params.clubId))
      .limit(1)

    if (!club) {
      return res.status(200).send(buildOgHtml({
        title: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        url: `/clubs/${req.params.clubId}`
      }))
    }

    const desc = club.description
      ? stripMarkdown(club.description)
      : `${club.memberCount || 0} j\u00e4sent\u00e4`

    res.send(buildOgHtml({
      title: club.name,
      description: desc,
      url: `/clubs/${req.params.clubId}`,
      type: 'website',
      image: club.coverImageUrl || undefined
    }))
  } catch {
    res.status(200).send(buildOgHtml({
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: `/clubs/${req.params.clubId}`
    }))
  }
})

// Club thread OG
router.get('/og/clubs/:clubId/thread/:threadId', async (req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || 'https://eulesia.eu'
  if (!isBot(req)) return res.redirect(`${appUrl}/clubs/${req.params.clubId}/thread/${req.params.threadId}`)
  try {
    const [thread] = await db
      .select({
        title: clubThreads.title,
        content: clubThreads.content
      })
      .from(clubThreads)
      .where(eq(clubThreads.id, req.params.threadId))
      .limit(1)

    if (!thread) {
      return res.status(200).send(buildOgHtml({
        title: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        url: `/clubs/${req.params.clubId}/thread/${req.params.threadId}`
      }))
    }

    res.send(buildOgHtml({
      title: thread.title,
      description: stripMarkdown(thread.content),
      url: `/clubs/${req.params.clubId}/thread/${req.params.threadId}`,
      type: 'article'
    }))
  } catch {
    res.status(200).send(buildOgHtml({
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: `/clubs/${req.params.clubId}/thread/${req.params.threadId}`
    }))
  }
})

// Municipality OG
router.get('/og/kunnat/:municipalityId', async (req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || 'https://eulesia.eu'
  if (!isBot(req)) return res.redirect(`${appUrl}/kunnat/${req.params.municipalityId}`)
  try {
    const [municipality] = await db
      .select({
        name: municipalities.name,
        nameFi: municipalities.nameFi
      })
      .from(municipalities)
      .where(eq(municipalities.id, req.params.municipalityId))
      .limit(1)

    if (!municipality) {
      return res.status(200).send(buildOgHtml({
        title: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        url: `/kunnat/${req.params.municipalityId}`
      }))
    }

    const name = municipality.nameFi || municipality.name
    res.send(buildOgHtml({
      title: name,
      description: `${name} - keskustelu ja päätöksenteko`,
      url: `/kunnat/${req.params.municipalityId}`,
      type: 'place'
    }))
  } catch {
    res.status(200).send(buildOgHtml({
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: `/kunnat/${req.params.municipalityId}`
    }))
  }
})

// User profile OG
router.get('/og/user/:userId', async (req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || 'https://eulesia.eu'
  if (!isBot(req)) return res.redirect(`${appUrl}/user/${req.params.userId}`)
  try {
    const [user] = await db
      .select({
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role
      })
      .from(users)
      .where(eq(users.id, req.params.userId))
      .limit(1)

    if (!user) {
      return res.status(200).send(buildOgHtml({
        title: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        url: `/user/${req.params.userId}`
      }))
    }

    res.send(buildOgHtml({
      title: user.name,
      description: `${user.name} Eulesia-alustalla`,
      url: `/user/${req.params.userId}`,
      type: 'profile',
      image: user.avatarUrl || undefined
    }))
  } catch {
    res.status(200).send(buildOgHtml({
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: `/user/${req.params.userId}`
    }))
  }
})

export default router
