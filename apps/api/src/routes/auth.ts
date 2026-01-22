import { Router, type Response } from 'express'
import { z } from 'zod'
import { eq, and, gt } from 'drizzle-orm'
import { db, users, magicLinks, sessions } from '../db/index.js'
import { generateMagicLinkToken, generateSessionToken, hashToken } from '../utils/crypto.js'
import { emailService } from '../services/email.js'
import { authMiddleware } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'
import { env } from '../utils/env.js'
import type { AuthenticatedRequest } from '../types/index.js'

const router = Router()

// Validation schemas
const magicLinkSchema = z.object({
  email: z.string().email('Invalid email address')
})

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required')
})

// POST /auth/magic-link - Request a magic link
router.post('/magic-link', async (req, res: Response) => {
  const { email } = magicLinkSchema.parse(req.body)

  // Generate token
  const { token, hash } = generateMagicLinkToken()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Store magic link
  await db.insert(magicLinks).values({
    email: email.toLowerCase(),
    tokenHash: hash,
    expiresAt
  })

  // Send email
  await emailService.sendMagicLink(email, token)

  res.json({
    success: true,
    message: 'If an account exists, you will receive a login link'
  })
})

// GET /auth/verify/:token - Verify magic link and create session
router.get('/verify/:token', async (req, res: Response) => {
  const { token } = verifySchema.parse(req.params)
  const tokenHash = hashToken(token)

  // Find valid magic link
  const [magicLink] = await db
    .select()
    .from(magicLinks)
    .where(
      and(
        eq(magicLinks.tokenHash, tokenHash),
        eq(magicLinks.used, false),
        gt(magicLinks.expiresAt, new Date())
      )
    )
    .limit(1)

  if (!magicLink) {
    throw new AppError(400, 'Invalid or expired link')
  }

  // Mark as used
  await db
    .update(magicLinks)
    .set({ used: true })
    .where(eq(magicLinks.id, magicLink.id))

  // Find or create user
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, magicLink.email))
    .limit(1)

  if (!user) {
    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email: magicLink.email,
        name: magicLink.email.split('@')[0], // Temporary name
        identityProvider: 'magic_link',
        identityVerified: false,
        identityLevel: 'basic'
      })
      .returning()

    user = newUser
  }

  // Create session
  const { token: sessionToken, hash: sessionHash } = generateSessionToken()
  const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await db.insert(sessions).values({
    userId: user.id,
    tokenHash: sessionHash,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    expiresAt: sessionExpiresAt
  })

  // Set session cookie
  res.cookie('session', sessionToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
    expires: sessionExpiresAt
  })

  // Redirect to app
  res.redirect(`${env.APP_URL}/auth/callback?success=true`)
})

// POST /auth/logout - End session
router.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (req.sessionId) {
    await db.delete(sessions).where(eq(sessions.id, req.sessionId))
  }

  res.clearCookie('session')
  res.json({ success: true })
})

// GET /auth/me - Get current user
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!

  // Get municipality if set
  let municipality = null
  if (user.municipalityId) {
    const { municipalities } = await import('../db/index.js')
    const [muni] = await db
      .select()
      .from(municipalities)
      .where(eq(municipalities.id, user.municipalityId))
      .limit(1)
    municipality = muni
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      institutionType: user.institutionType,
      institutionName: user.institutionName,
      municipality,
      identityVerified: user.identityVerified,
      identityLevel: user.identityLevel,
      settings: {
        notificationReplies: user.notificationReplies,
        notificationMentions: user.notificationMentions,
        notificationOfficial: user.notificationOfficial,
        locale: user.locale
      },
      createdAt: user.createdAt
    }
  })
})

export default router
