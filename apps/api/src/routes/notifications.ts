import { Router, type Response } from 'express'
import { eq, and, desc, sql } from 'drizzle-orm'
import { db, notifications } from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import type { AuthenticatedRequest } from '../types/index.js'

const router = Router()

// GET /notifications — List user's notifications (newest first)
router.get('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const { limit = '20' } = req.query
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)))

  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limitNum)

  res.json({
    success: true,
    data: items.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt?.toISOString()
    }))
  })
}))

// GET /notifications/unread-count — Count of unread notifications
router.get('/unread-count', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.read, false)
    ))

  res.json({
    success: true,
    data: { count: result?.count ?? 0 }
  })
}))

// POST /notifications/:id/read — Mark single notification as read
router.post('/:id/read', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const { id } = req.params

  const [updated] = await db
    .update(notifications)
    .set({ read: true })
    .where(and(
      eq(notifications.id, id),
      eq(notifications.userId, userId)
    ))
    .returning()

  if (!updated) {
    throw new AppError(404, 'Notification not found')
  }

  res.json({ success: true, data: { read: true } })
}))

// POST /notifications/read-all — Mark all notifications as read
router.post('/read-all', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id

  await db
    .update(notifications)
    .set({ read: true })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.read, false)
    ))

  res.json({ success: true, data: { read: true } })
}))

// DELETE /notifications/:id — Delete a notification
router.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const { id } = req.params

  const [deleted] = await db
    .delete(notifications)
    .where(and(
      eq(notifications.id, id),
      eq(notifications.userId, userId)
    ))
    .returning()

  if (!deleted) {
    throw new AppError(404, 'Notification not found')
  }

  res.json({ success: true, data: { deleted: true } })
}))

export default router
