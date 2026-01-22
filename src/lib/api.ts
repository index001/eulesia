const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include' // Include cookies
    })

    const data: ApiResponse<T> = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Request failed')
    }

    return data.data as T
  }

  // Auth
  async requestMagicLink(email: string): Promise<{ message: string }> {
    return this.request('/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' })
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/auth/me')
  }

  // Users
  async getUser(id: string): Promise<User> {
    return this.request(`/users/${id}`)
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async exportData(): Promise<unknown> {
    return this.request('/users/me/data')
  }

  // Agora - Threads
  async getThreads(params?: ThreadFilters): Promise<PaginatedResponse<Thread>> {
    const searchParams = new URLSearchParams()
    if (params?.scope) searchParams.set('scope', params.scope)
    if (params?.municipalityId) searchParams.set('municipalityId', params.municipalityId)
    if (params?.tags?.length) searchParams.set('tags', params.tags.join(','))
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/agora/threads${query ? `?${query}` : ''}`)
  }

  async getThread(id: string): Promise<ThreadWithComments> {
    return this.request(`/agora/threads/${id}`)
  }

  async createThread(data: CreateThreadData): Promise<Thread> {
    return this.request('/agora/threads', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async addComment(threadId: string, data: CreateCommentData): Promise<Comment> {
    return this.request(`/agora/threads/${threadId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getTags(): Promise<{ tag: string; count: number }[]> {
    return this.request('/agora/tags')
  }

  // Clubs
  async getClubs(params?: ClubFilters): Promise<PaginatedResponse<Club>> {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/clubs${query ? `?${query}` : ''}`)
  }

  async getClub(id: string): Promise<ClubWithThreads> {
    return this.request(`/clubs/${id}`)
  }

  async createClub(data: CreateClubData): Promise<Club> {
    return this.request('/clubs', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async joinClub(clubId: string): Promise<void> {
    await this.request(`/clubs/${clubId}/join`, { method: 'POST' })
  }

  async leaveClub(clubId: string): Promise<void> {
    await this.request(`/clubs/${clubId}/leave`, { method: 'POST' })
  }

  async createClubThread(clubId: string, data: CreateClubThreadData): Promise<ClubThread> {
    return this.request(`/clubs/${clubId}/threads`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getClubThread(clubId: string, threadId: string): Promise<ClubThreadWithComments> {
    return this.request(`/clubs/${clubId}/threads/${threadId}`)
  }

  async addClubComment(clubId: string, threadId: string, data: CreateCommentData): Promise<ClubComment> {
    return this.request(`/clubs/${clubId}/threads/${threadId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getClubCategories(): Promise<{ category: string; count: number }[]> {
    return this.request('/clubs/meta/categories')
  }

  // Messages
  async getConversations(): Promise<Conversation[]> {
    return this.request('/messages/conversations')
  }

  async getConversation(id: string): Promise<ConversationWithMessages> {
    return this.request(`/messages/conversations/${id}`)
  }

  async startConversation(data: StartConversationData): Promise<{ conversationId: string; isNew: boolean }> {
    return this.request('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return this.request(`/messages/conversations/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  }
}

// Types
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: 'citizen' | 'institution' | 'admin'
  institutionType?: 'municipality' | 'agency' | 'ministry'
  institutionName?: string
  municipality?: Municipality
  identityVerified: boolean
  identityLevel: 'basic' | 'substantial' | 'high'
  settings?: {
    notificationReplies: boolean
    notificationMentions: boolean
    notificationOfficial: boolean
    locale: string
  }
  createdAt: string
}

export interface Municipality {
  id: string
  name: string
  nameFi?: string
  nameSv?: string
  region?: string
}

export interface Thread {
  id: string
  title: string
  content: string
  contentHtml?: string
  scope: 'municipal' | 'regional' | 'national'
  tags: string[]
  author: UserSummary
  municipality?: Municipality
  institutionalContext?: InstitutionalContext
  replyCount: number
  createdAt: string
  updatedAt: string
}

export interface ThreadWithComments extends Thread {
  comments: Comment[]
}

export interface Comment {
  id: string
  content: string
  contentHtml?: string
  author: UserSummary
  parentId?: string
  createdAt: string
}

export interface UserSummary {
  id: string
  name: string
  avatarUrl?: string
  role: 'citizen' | 'institution' | 'admin'
  institutionType?: string
  institutionName?: string
}

export interface InstitutionalContext {
  docs?: { title: string; url: string }[]
  timeline?: { date: string; event: string }[]
  faq?: { q: string; a: string }[]
  contact?: string
}

export interface Club {
  id: string
  name: string
  slug: string
  description?: string
  rules?: string[]
  category?: string
  memberCount: number
  creator: UserSummary
  isMember: boolean
  createdAt: string
}

export interface ClubWithThreads extends Club {
  moderators: UserSummary[]
  threads: ClubThread[]
  memberRole?: string
}

export interface ClubThread {
  id: string
  title: string
  content: string
  contentHtml?: string
  author: UserSummary
  isPinned: boolean
  replyCount: number
  createdAt: string
  updatedAt: string
}

export interface ClubThreadWithComments extends ClubThread {
  comments: ClubComment[]
}

export interface ClubComment extends Comment {}

export interface Conversation {
  id: string
  type: 'direct' | 'group'
  name?: string
  participants: UserSummary[]
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

export interface Message {
  id: string
  content: string
  sender: UserSummary
  createdAt: string
}

// Filter types
export interface ThreadFilters {
  scope?: 'municipal' | 'regional' | 'national'
  municipalityId?: string
  tags?: string[]
  page?: number
  limit?: number
}

export interface ClubFilters {
  category?: string
  search?: string
  page?: number
  limit?: number
}

// Create types
export interface CreateThreadData {
  title: string
  content: string
  scope: 'municipal' | 'regional' | 'national'
  municipalityId?: string
  tags?: string[]
  institutionalContext?: InstitutionalContext
}

export interface CreateCommentData {
  content: string
  parentId?: string
}

export interface CreateClubData {
  name: string
  slug: string
  description?: string
  rules?: string[]
  category?: string
}

export interface CreateClubThreadData {
  title: string
  content: string
}

export interface StartConversationData {
  participantIds: string[]
  name?: string
  initialMessage: string
}

// Export singleton instance
export const api = new ApiClient(API_URL)
