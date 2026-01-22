import { pgTable, uuid, varchar, text, boolean, timestamp, integer, jsonb, primaryKey, inet, index, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const userRoleEnum = pgEnum('user_role', ['citizen', 'institution', 'admin'])
export const institutionTypeEnum = pgEnum('institution_type', ['municipality', 'agency', 'ministry'])
export const identityLevelEnum = pgEnum('identity_level', ['basic', 'substantial', 'high'])
export const scopeEnum = pgEnum('scope', ['municipal', 'regional', 'national'])
export const clubMemberRoleEnum = pgEnum('club_member_role', ['member', 'moderator', 'admin'])
export const conversationTypeEnum = pgEnum('conversation_type', ['direct', 'group'])

// Municipalities
export const municipalities = pgTable('municipalities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  nameFi: varchar('name_fi', { length: 255 }),
  nameSv: varchar('name_sv', { length: 255 }),
  region: varchar('region', { length: 255 }),
  country: varchar('country', { length: 2 }).default('FI'),
  population: integer('population'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
})

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  role: userRoleEnum('role').default('citizen'),
  institutionType: institutionTypeEnum('institution_type'),
  institutionName: varchar('institution_name', { length: 255 }),
  municipalityId: uuid('municipality_id').references(() => municipalities.id),

  // Identity verification
  identityVerified: boolean('identity_verified').default(false),
  identityProvider: varchar('identity_provider', { length: 50 }),
  identityLevel: identityLevelEnum('identity_level').default('basic'),

  // Settings
  notificationReplies: boolean('notification_replies').default(true),
  notificationMentions: boolean('notification_mentions').default(true),
  notificationOfficial: boolean('notification_official').default(true),
  locale: varchar('locale', { length: 10 }).default('en'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_municipality_idx').on(table.municipalityId)
])

// Sessions
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('sessions_user_idx').on(table.userId),
  index('sessions_token_idx').on(table.tokenHash)
])

// Magic Links
export const magicLinks = pgTable('magic_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  used: boolean('used').default(false),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('magic_links_token_idx').on(table.tokenHash)
])

// Threads (Agora)
export const threads = pgTable('threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  contentHtml: text('content_html'),
  authorId: uuid('author_id').notNull().references(() => users.id),
  scope: scopeEnum('scope').notNull(),
  municipalityId: uuid('municipality_id').references(() => municipalities.id),
  institutionalContext: jsonb('institutional_context'),
  isPinned: boolean('is_pinned').default(false),
  isLocked: boolean('is_locked').default(false),
  replyCount: integer('reply_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('threads_scope_idx').on(table.scope),
  index('threads_municipality_idx').on(table.municipalityId),
  index('threads_author_idx').on(table.authorId),
  index('threads_created_idx').on(table.createdAt),
  index('threads_updated_idx').on(table.updatedAt)
])

// Thread Tags
export const threadTags = pgTable('thread_tags', {
  threadId: uuid('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
  tag: varchar('tag', { length: 100 }).notNull()
}, (table) => [
  primaryKey({ columns: [table.threadId, table.tag] })
])

// Comments
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id').references((): typeof comments => comments.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  contentHtml: text('content_html'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('comments_thread_idx').on(table.threadId),
  index('comments_parent_idx').on(table.parentId)
])

// Clubs
export const clubs = pgTable('clubs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  rules: text('rules').array(),
  category: varchar('category', { length: 100 }),
  creatorId: uuid('creator_id').notNull().references(() => users.id),
  memberCount: integer('member_count').default(1),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('clubs_slug_idx').on(table.slug),
  index('clubs_category_idx').on(table.category)
])

// Club Members
export const clubMembers = pgTable('club_members', {
  clubId: uuid('club_id').notNull().references(() => clubs.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: clubMemberRoleEnum('role').default('member'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow()
}, (table) => [
  primaryKey({ columns: [table.clubId, table.userId] }),
  index('club_members_user_idx').on(table.userId)
])

// Club Threads
export const clubThreads = pgTable('club_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id').notNull().references(() => clubs.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  contentHtml: text('content_html'),
  isPinned: boolean('is_pinned').default(false),
  isLocked: boolean('is_locked').default(false),
  replyCount: integer('reply_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('club_threads_club_idx').on(table.clubId)
])

// Club Comments
export const clubComments = pgTable('club_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().references(() => clubThreads.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id').references((): typeof clubComments => clubComments.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  contentHtml: text('content_html'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
})

// Conversations (Private Messaging)
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: conversationTypeEnum('type').default('direct'),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
})

// Conversation Participants
export const conversationParticipants = pgTable('conversation_participants', {
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lastReadAt: timestamp('last_read_at', { withTimezone: true })
}, (table) => [
  primaryKey({ columns: [table.conversationId, table.userId] })
])

// Messages
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('messages_conversation_idx').on(table.conversationId),
  index('messages_created_idx').on(table.createdAt)
])

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body'),
  link: varchar('link', { length: 500 }),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('notifications_user_idx').on(table.userId, table.read, table.createdAt)
])

// User Subscriptions
export const userSubscriptions = pgTable('user_subscriptions', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
  primaryKey({ columns: [table.userId, table.entityType, table.entityId] })
])

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  municipality: one(municipalities, {
    fields: [users.municipalityId],
    references: [municipalities.id]
  }),
  sessions: many(sessions),
  threads: many(threads),
  comments: many(comments),
  clubMemberships: many(clubMembers),
  notifications: many(notifications)
}))

export const threadsRelations = relations(threads, ({ one, many }) => ({
  author: one(users, {
    fields: [threads.authorId],
    references: [users.id]
  }),
  municipality: one(municipalities, {
    fields: [threads.municipalityId],
    references: [municipalities.id]
  }),
  comments: many(comments),
  tags: many(threadTags)
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  thread: one(threads, {
    fields: [comments.threadId],
    references: [threads.id]
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id]
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'commentReplies'
  }),
  replies: many(comments, { relationName: 'commentReplies' })
}))

export const clubsRelations = relations(clubs, ({ one, many }) => ({
  creator: one(users, {
    fields: [clubs.creatorId],
    references: [users.id]
  }),
  members: many(clubMembers),
  threads: many(clubThreads)
}))

export const clubMembersRelations = relations(clubMembers, ({ one }) => ({
  club: one(clubs, {
    fields: [clubMembers.clubId],
    references: [clubs.id]
  }),
  user: one(users, {
    fields: [clubMembers.userId],
    references: [users.id]
  })
}))

// Types for insertion
export type NewUser = typeof users.$inferInsert
export type User = typeof users.$inferSelect
export type NewThread = typeof threads.$inferInsert
export type Thread = typeof threads.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewClub = typeof clubs.$inferInsert
export type Club = typeof clubs.$inferSelect
export type NewMessage = typeof messages.$inferInsert
export type Message = typeof messages.$inferSelect
