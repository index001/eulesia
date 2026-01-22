import { Router } from 'express'
import authRoutes from './auth.js'
import userRoutes from './users.js'
import agoraRoutes from './agora.js'
import clubsRoutes from './clubs.js'
import messagesRoutes from './messages.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/agora', agoraRoutes)
router.use('/clubs', clubsRoutes)
router.use('/messages', messagesRoutes)

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
