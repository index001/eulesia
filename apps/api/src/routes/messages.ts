import { Router, type Response } from 'express'
import { z } from 'zod'
import { eq, and, desc, or, sql, inArray } from 'drizzle-orm'
import { db, conversations, conversationParticipants, messages, users } from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'
import type { AuthenticatedRequest } from '../types/index.js'

const router = Router()

// Validation schemas
const createConversationSchema = z.object({
  participantIds: z.array(z.string().uuid()).min(1).max(10),
  name: z.string().max(255).optional(),
  initialMessage: z.string().min(1).max(5000)
})

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000)
})

// GET /messages/conversations - List user's conversations
router.get('/conversations', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id

  // Get user's conversations
  const userConversations = await db
    .select({
      conversation: conversations,
      participant: conversationParticipants
    })
    .from(conversationParticipants)
    .innerJoin(conversations, eq(conversationParticipants.conversationId, conversations.id))
    .where(eq(conversationParticipants.userId, userId))
    .orderBy(desc(conversations.updatedAt))

  // Get other participants and last message for each conversation
  const conversationDetails = await Promise.all(
    userConversations.map(async ({ conversation, participant }) => {
      // Get other participants
      const participants = await db
        .select({
          user: {
            id: users.id,
            name: users.name,
            avatarUrl: users.avatarUrl
          }
        })
        .from(conversationParticipants)
        .innerJoin(users, eq(conversationParticipants.userId, users.id))
        .where(eq(conversationParticipants.conversationId, conversation.id))

      // Get last message
      const [lastMessage] = await db
        .select({
          message: messages,
          sender: {
            id: users.id,
            name: users.name
          }
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(desc(messages.createdAt))
        .limit(1)

      // Count unread
      const [{ unreadCount }] = await db
        .select({ unreadCount: sql<number>`count(*)::int` })
        .from(messages)
        .where(and(
          eq(messages.conversationId, conversation.id),
          participant.lastReadAt
            ? sql`${messages.createdAt} > ${participant.lastReadAt}`
            : sql`true`
        ))

      return {
        ...conversation,
        participants: participants.map(p => p.user),
        lastMessage: lastMessage ? {
          ...lastMessage.message,
          sender: lastMessage.sender
        } : null,
        unreadCount
      }
    })
  )

  res.json({
    success: true,
    data: conversationDetails
  })
})

// GET /messages/conversations/:id - Get conversation messages
router.get('/conversations/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const { id: conversationId } = req.params
  const { before, limit = '50' } = req.query
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)))

  // Verify participation
  const [participation] = await db
    .select()
    .from(conversationParticipants)
    .where(and(
      eq(conversationParticipants.conversationId, conversationId),
      eq(conversationParticipants.userId, userId)
    ))
    .limit(1)

  if (!participation) {
    throw new AppError(403, 'Not a participant')
  }

  // Get conversation
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1)

  if (!conversation) {
    throw new AppError(404, 'Conversation not found')
  }

  // Get participants
  const participants = await db
    .select({
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl
      }
    })
    .from(conversationParticipants)
    .innerJoin(users, eq(conversationParticipants.userId, users.id))
    .where(eq(conversationParticipants.conversationId, conversationId))

  // Get messages
  let messagesQuery = db
    .select({
      message: messages,
      sender: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl
      }
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limitNum)

  const messageList = await messagesQuery

  // Mark as read
  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(and(
      eq(conversationParticipants.conversationId, conversationId),
      eq(conversationParticipants.userId, userId)
    ))

  res.json({
    success: true,
    data: {
      conversation,
      participants: participants.map(p => p.user),
      messages: messageList.map(({ message, sender }) => ({
        ...message,
        sender
      })).reverse() // Oldest first
    }
  })
})

// POST /messages/conversations - Start new conversation
router.post('/conversations', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const data = createConversationSchema.parse(req.body)

  // Can't message yourself only
  if (data.participantIds.length === 1 && data.participantIds[0] === userId) {
    throw new AppError(400, 'Cannot start conversation with yourself')
  }

  // Add current user to participants
  const allParticipants = [...new Set([userId, ...data.participantIds])]

  // For direct messages, check if conversation already exists
  if (allParticipants.length === 2) {
    // Find existing direct conversation
    const existing = await db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .innerJoin(conversations, and(
        eq(conversationParticipants.conversationId, conversations.id),
        eq(conversations.type, 'direct')
      ))
      .where(inArray(conversationParticipants.userId, allParticipants))
      .groupBy(conversationParticipants.conversationId)
      .having(sql`count(*) = 2`)

    if (existing.length > 0) {
      // Use existing conversation
      const conversationId = existing[0].conversationId

      // Add message
      await db.insert(messages).values({
        conversationId,
        senderId: userId,
        content: data.initialMessage
      })

      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId))

      return res.json({
        success: true,
        data: { conversationId, isNew: false }
      })
    }
  }

  // Create new conversation
  const type = allParticipants.length === 2 ? 'direct' : 'group'
  const [conversation] = await db
    .insert(conversations)
    .values({
      type,
      name: data.name
    })
    .returning()

  // Add participants
  await db.insert(conversationParticipants).values(
    allParticipants.map(participantId => ({
      conversationId: conversation.id,
      userId: participantId
    }))
  )

  // Add initial message
  await db.insert(messages).values({
    conversationId: conversation.id,
    senderId: userId,
    content: data.initialMessage
  })

  res.status(201).json({
    success: true,
    data: { conversationId: conversation.id, isNew: true }
  })
})

// POST /messages/conversations/:id - Send message
router.post('/conversations/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const { id: conversationId } = req.params
  const data = sendMessageSchema.parse(req.body)

  // Verify participation
  const [participation] = await db
    .select()
    .from(conversationParticipants)
    .where(and(
      eq(conversationParticipants.conversationId, conversationId),
      eq(conversationParticipants.userId, userId)
    ))
    .limit(1)

  if (!participation) {
    throw new AppError(403, 'Not a participant')
  }

  // Create message
  const [newMessage] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: userId,
      content: data.content
    })
    .returning()

  // Update conversation timestamp
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId))

  // Update sender's last read
  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(and(
      eq(conversationParticipants.conversationId, conversationId),
      eq(conversationParticipants.userId, userId)
    ))

  res.status(201).json({
    success: true,
    data: newMessage
  })
})

export default router
