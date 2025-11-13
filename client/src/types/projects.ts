// src/types/projects.ts
export type ProjectStep = {
  projectStepId: number
  stepNumber: number
  instruction: string
}

export type Project = {
  projectId: number
  ideaId?: number | null
  aiIdeaId?: number | null
  userId: number
  title: string
  description?: string | null
  status: string
  steps?: ProjectStep[]
  createdAtUtc: string
  // Social metrics (may be hydrated later)
  likeCount?: number
  commentCount?: number
  saveCount?: number
  isLiked?: boolean
  isSaved?: boolean
  imageUrl?: string
  tags?: string[]
  // User info for feed display (populated by feed query)
  _userInfo?: {
    userName?: string
    displayName?: string
    avatarUrl?: string
  }
}

export type CreateProjectRequest = {
  userId: number
  ideaId?: number | null
  aiIdeaId?: number | null
  title: string
  description?: string | null
}

export type UpsertStepsRequest = {
  steps: string[]
}

export type CreateProjectResponse = {
  projectId: number
  ideaId?: number | null
  aiIdeaId?: number | null
  userId: number
  title: string
  description?: string | null
  status: string
  imageUrl?: string | null  // Added to match backend response
}

export type Paged<T> = {
  results: T[]
  total: number
  skip: number
  take: number
}
