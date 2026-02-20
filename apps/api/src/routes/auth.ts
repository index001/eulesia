import { Router, type Response } from 'express'
import { z } from 'zod'
import { eq, and, gt, or, lt } from 'drizzle-orm'
import * as argon2 from 'argon2'
import expressSession from 'express-session'
import { db, users, magicLinks, sessions, inviteCodes, siteSettings, ftnPendingRegistrations } from '../db/index.js'
import { generateMagicLinkToken, generateSessionToken, generateToken, hashToken } from '../utils/crypto.js'
import { emailService } from '../services/email.js'
import { authMiddleware } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'
import { env } from '../utils/env.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { getSessionCookieOptions } from '../utils/cookies.js'
import { indexUser } from '../services/search/meilisearch.js'
import type { AuthenticatedRequest } from '../types/index.js'

const router = Router()

// Validation schemas
const magicLinkSchema = z.object({
  email: z.string().email('Invalid email address')
})

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required')
})

const registerSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2).max(255),
  ftnToken: z.string().optional()
})

const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required')
})

// ============================================
// FTN (Finnish Trust Network) via Idura Verify
// ============================================

// Only initialize FTN if credentials and JWKS are configured
if (process.env.IDURA_DOMAIN && process.env.IDURA_CLIENT_ID && process.env.IDURA_JWKS) {
  // express-session middleware for FTN routes only (needed for state/nonce during OIDC flow)
  const ftnSession = expressSession({
    secret: process.env.SESSION_SECRET || 'ftn-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 5 * 60 * 1000, secure: env.NODE_ENV === 'production', sameSite: 'lax' }
  })

  // Apply session middleware only to FTN routes
  router.use('/ftn', ftnSession)

  // Parse JWKS from environment
  let ftnJwks: { keys: any[] }
  try {
    ftnJwks = JSON.parse(process.env.IDURA_JWKS)
    console.log('FTN: JWKS loaded, keys:', ftnJwks.keys.map(k => `${k.kid} (${k.use})`).join(', '))
  } catch (e) {
    console.error('FTN: Failed to parse IDURA_JWKS:', e)
    ftnJwks = { keys: [] }
  }

  // Lazy import ftn service
  import('../services/ftn.js').then(({ createFtnRoutes }) => {
    const ftnConfig = {
      domain: process.env.IDURA_DOMAIN!,
      clientId: process.env.IDURA_CLIENT_ID!,
      callbackUrl: process.env.IDURA_CALLBACK_URL || `${env.API_URL}/api/v1/auth/ftn/callback`,
      appUrl: env.APP_URL,
      jwks: ftnJwks,
    }

    const ftn = createFtnRoutes(ftnConfig)

    // GET /auth/ftn/start - Begin FTN authentication
    router.get('/ftn/start', asyncHandler(async (req, res) => {
      await ftn.handleStart(req, res)
    }))

    // GET /auth/ftn/callback - Handle Idura callback with authorization code
    router.get('/ftn/callback', asyncHandler(async (req, res: Response) => {
      const result = await ftn.handleCallback(req, res)
      if (!result) return // Error already handled with redirect

      const { claims, inviteCode } = result

      // Check for duplicate identity (one-person-one-account)
      const [existing] = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.rpSubject, claims.sub))
        .limit(1)

      if (existing) {
        return res.redirect(`${env.APP_URL}/?ftn_error=duplicate_identity`)
      }

      // Create temporary token to bridge claims to registration form
      const ftnToken = generateToken(32)

      await db.insert(ftnPendingRegistrations).values({
        token: hashToken(ftnToken),
        givenName: claims.given_name,
        familyName: claims.family_name,
        sub: claims.sub,
        country: claims.country || 'FI',
        inviteCode: inviteCode || null,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      })

      // Clean up expired pending registrations (housekeeping)
      await db.delete(ftnPendingRegistrations)
        .where(lt(ftnPendingRegistrations.expiresAt, new Date()))
        .catch(() => {}) // Non-critical

      // Redirect to registration form with FTN token and name
      const params = new URLSearchParams({
        ftn: ftnToken,
        firstName: claims.given_name,
        lastName: claims.family_name,
        ...(inviteCode ? { invite: inviteCode } : {}),
      })
      res.redirect(`${env.APP_URL}/?${params.toString()}`)
    }))

    console.log('FTN: Routes registered (private_key_jwt + JAR + JWE)')
  }).catch((err) => {
    console.error('FTN: Failed to initialize:', err)
  })
} else {
  console.log('FTN: Disabled (IDURA_DOMAIN, IDURA_CLIENT_ID, or IDURA_JWKS not set)')
}

// GET /auth/ftn/error - Handle FTN authentication errors
router.get('/ftn/error', (req, res) => {
  const errorDesc = req.query.error_description || req.query.error || 'ftn_failed'
  res.redirect(`${env.APP_URL}/?ftn_error=${encodeURIComponent(String(errorDesc))}`)
})

// POST /auth/magic-link - Request a magic link
router.post('/magic-link', asyncHandler(async (req, res: Response) => {
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

  // In development, return the login URL directly for easy testing
  if (env.NODE_ENV === 'development') {
    const loginUrl = `${env.API_URL}/api/v1/auth/verify/${token}`
    res.json({
      success: true,
      message: 'If an account exists, you will receive a login link',
      // DEV ONLY - login URL for testing
      _dev: {
        loginUrl,
        note: 'This field only appears in development mode'
      }
    })
    return
  }

  res.json({
    success: true,
    message: 'If an account exists, you will receive a login link'
  })
}))

// POST /auth/register - Register with invite code, username and password
// Optionally accepts ftnToken for strong authentication via FTN
router.post('/register', asyncHandler(async (req, res: Response) => {
  const { inviteCode, username, password, name, ftnToken } = registerSchema.parse(req.body)

  // Check if registration is open
  const [regSetting] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, 'registration_open'))
    .limit(1)
  if (regSetting && regSetting.value === 'false') {
    throw new AppError(403, 'Registration is currently closed')
  }

  // Resolve FTN claims if ftnToken provided (strong authentication)
  let ftnClaims: { givenName: string; familyName: string; sub: string; country: string | null } | null = null
  if (ftnToken) {
    const [pending] = await db.select()
      .from(ftnPendingRegistrations)
      .where(and(
        eq(ftnPendingRegistrations.token, hashToken(ftnToken)),
        gt(ftnPendingRegistrations.expiresAt, new Date())
      ))
      .limit(1)

    if (!pending) {
      throw new AppError(400, 'Invalid or expired FTN token. Please authenticate again.')
    }

    // Check duplicate identity
    const [existingIdentity] = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.rpSubject, pending.sub))
      .limit(1)

    if (existingIdentity) {
      throw new AppError(400, 'This identity is already linked to another account')
    }

    ftnClaims = {
      givenName: pending.givenName,
      familyName: pending.familyName,
      sub: pending.sub,
      country: pending.country,
    }

    // Clean up used FTN pending registration
    await db.delete(ftnPendingRegistrations)
      .where(eq(ftnPendingRegistrations.token, hashToken(ftnToken)))
  }

  // Hash password before transaction (CPU-intensive work outside tx)
  const passwordHash = await argon2.hash(password)

  // Use transaction to prevent race conditions on invite code + username
  const newUser = await db.transaction(async (tx) => {
    // Validate invite code (inside tx for atomicity)
    const [invite] = await tx
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.code, inviteCode.toUpperCase()))
      .limit(1)

    if (!invite) {
      throw new AppError(400, 'Invalid invite code')
    }

    if (invite.status !== 'available') {
      throw new AppError(400, 'Invite code has already been used')
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      throw new AppError(400, 'Invite code has expired')
    }

    // Check if username already exists
    const [existing] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1)

    if (existing) {
      throw new AppError(400, 'Username already exists')
    }

    // Create user — with FTN strong auth data if available
    const [created] = await tx
      .insert(users)
      .values({
        username: username.toLowerCase(),
        passwordHash,
        name: ftnClaims ? `${ftnClaims.givenName} ${ftnClaims.familyName}` : name,
        invitedBy: invite.createdBy,
        inviteCodesRemaining: 5,
        identityProvider: ftnClaims ? 'ftn' : 'invite',
        identityVerified: !!ftnClaims,
        identityLevel: ftnClaims ? 'substantial' : 'basic',
        ...(ftnClaims ? {
          verifiedName: `${ftnClaims.givenName} ${ftnClaims.familyName}`,
          rpSubject: ftnClaims.sub,
          identityIssuer: 'idura_ftn',
          identityVerifiedAt: new Date(),
        } : {})
      })
      .returning()

    // Mark invite code as used (atomic with user creation)
    await tx
      .update(inviteCodes)
      .set({
        usedBy: created.id,
        status: 'used',
        usedAt: new Date()
      })
      .where(eq(inviteCodes.id, invite.id))

    return created
  })

  // Index new user in Meilisearch (outside tx — not critical)
  try {
    await indexUser({
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      role: (newUser.role as 'citizen' | 'institution' | 'admin') || 'citizen',
      avatarUrl: newUser.avatarUrl || undefined,
      institutionType: newUser.institutionType || undefined,
      institutionName: newUser.institutionName || undefined,
      createdAt: newUser.createdAt?.toISOString() || new Date().toISOString()
    })
  } catch (err) {
    console.error('Failed to index new user in Meilisearch:', err)
  }

  // Create session
  const { token: sessionToken, hash: sessionHash } = generateSessionToken()
  const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await db.insert(sessions).values({
    userId: newUser.id,
    tokenHash: sessionHash,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    expiresAt: sessionExpiresAt
  })

  // Set session cookie
  res.cookie('session', sessionToken, {
    ...getSessionCookieOptions(req),
    expires: sessionExpiresAt
  })

  res.status(201).json({
    success: true,
    data: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      inviteCodesRemaining: newUser.inviteCodesRemaining
    }
  })
}))

// POST /auth/login - Login with username/email and password
router.post('/login', asyncHandler(async (req, res: Response) => {
  const { username, password } = loginSchema.parse(req.body)

  // Find user by username or email
  const [user] = await db
    .select()
    .from(users)
    .where(or(
      eq(users.username, username.toLowerCase()),
      eq(users.email, username.toLowerCase())
    ))
    .limit(1)

  if (!user || !user.passwordHash) {
    res.status(401).json({ success: false, error: 'Invalid credentials' })
    return
  }

  // Verify password
  const validPassword = await argon2.verify(user.passwordHash, password)

  if (!validPassword) {
    res.status(401).json({ success: false, error: 'Invalid credentials' })
    return
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
    ...getSessionCookieOptions(req),
    expires: sessionExpiresAt
  })

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    }
  })
}))

// GET /auth/verify/:token - Verify magic link and create session
router.get('/verify/:token', asyncHandler(async (req, res: Response) => {
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
    res.status(400).json({ success: false, error: 'Invalid or expired link' })
    return
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
    // Create new user with generated username from email
    const baseUsername = magicLink.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
    const uniqueSuffix = Date.now().toString(36).slice(-4)
    const [newUser] = await db
      .insert(users)
      .values({
        email: magicLink.email,
        username: `${baseUsername}_${uniqueSuffix}`,
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
    ...getSessionCookieOptions(req),
    expires: sessionExpiresAt
  })

  // Redirect to app
  res.redirect(`${env.APP_URL}/auth/callback?success=true`)
}))

// POST /auth/logout - End session
router.post('/logout', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.sessionId) {
    await db.delete(sessions).where(eq(sessions.id, req.sessionId))
  }

  res.clearCookie('session', getSessionCookieOptions(req))
  res.json({ success: true })
}))

// GET /auth/me - Get current user
router.get('/me', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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
      onboardingCompletedAt: user.onboardingCompletedAt,
      createdAt: user.createdAt
    }
  })
}))

export default router
