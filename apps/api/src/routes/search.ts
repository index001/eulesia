/**
 * Search API Routes
 *
 * Federated search across users, threads, places, municipalities, and tags.
 */

import { Router, type Response } from 'express'
import { z } from 'zod'
import { search, searchUsers, searchThreads, searchPlaces, healthCheck } from '../services/search/index.js'
import { optionalAuthMiddleware } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import type { AuthenticatedRequest } from '../types/index.js'

const router = Router()

// Validation schemas
const searchSchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().min(1).max(20).default(5)
})

const threadSearchSchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().min(1).max(50).default(20),
  scope: z.enum(['municipal', 'regional', 'national']).optional(),
  municipalityId: z.string().uuid().optional(),
  tags: z.string().optional() // Comma-separated
})

/**
 * GET /search - Federated search across all indexes
 *
 * Returns users, threads, places, municipalities, and tags matching the query.
 * Results are typo-tolerant and ranked by relevance.
 */
router.get('/', optionalAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { q, limit } = searchSchema.parse(req.query)

  // Check if search is available
  const isHealthy = await healthCheck()
  if (!isHealthy) {
    res.status(503).json({
      success: false,
      error: 'Search service temporarily unavailable'
    })
    return
  }

  const results = await search(q, {
    limit,
    userId: req.user?.id
  })

  res.json({
    success: true,
    data: results
  })
}))

/**
 * GET /search/users - Search only users
 */
router.get('/users', asyncHandler(async (req, res: Response) => {
  const { q, limit } = searchSchema.parse(req.query)

  const isHealthy = await healthCheck()
  if (!isHealthy) {
    res.status(503).json({
      success: false,
      error: 'Search service temporarily unavailable'
    })
    return
  }

  const users = await searchUsers(q, limit)

  res.json({
    success: true,
    data: users
  })
}))

/**
 * GET /search/threads - Search only threads
 */
router.get('/threads', asyncHandler(async (req, res: Response) => {
  const params = threadSearchSchema.parse(req.query)

  const isHealthy = await healthCheck()
  if (!isHealthy) {
    res.status(503).json({
      success: false,
      error: 'Search service temporarily unavailable'
    })
    return
  }

  const threads = await searchThreads(params.q, {
    limit: params.limit,
    scope: params.scope,
    municipalityId: params.municipalityId,
    tags: params.tags?.split(',').map(t => t.trim())
  })

  res.json({
    success: true,
    data: threads
  })
}))

/**
 * GET /search/places - Search only places
 */
router.get('/places', asyncHandler(async (req, res: Response) => {
  const { q, limit } = searchSchema.parse(req.query)

  const isHealthy = await healthCheck()
  if (!isHealthy) {
    res.status(503).json({
      success: false,
      error: 'Search service temporarily unavailable'
    })
    return
  }

  const places = await searchPlaces(q, limit)

  res.json({
    success: true,
    data: places
  })
}))

/**
 * GET /search/health - Check search service health
 */
router.get('/health', asyncHandler(async (_req, res: Response) => {
  const isHealthy = await healthCheck()

  res.json({
    success: true,
    data: {
      status: isHealthy ? 'available' : 'unavailable'
    }
  })
}))

export default router
