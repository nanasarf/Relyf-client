// src/types/projects.ts
export type ProjectStep = {
  projectStepId: number
  stepNumber: number
  instruction: string
}

export type Project = {
  projectId: number
  ideaId?: number | null
  userId: number
  title: string
  description?: string | null
  status: string
  steps?: ProjectStep[]
  // Social metrics (may be hydrated later)
  likeCount?: number
  commentCount?: number
  saveCount?: number
  isLiked?: boolean
  isSaved?: boolean
  imageUrl?: string
  tags?: string[]
}

export type CreateProjectRequest = {
  ideaId?: number | null
  title: string
  description?: string | null
  // steps optional in initial create; can be upserted later
  steps?: string[]
}

export type CreateProjectResponse = {
  projectId: number
  ideaId?: number | null
  userId: number
  title: string
  description?: string | null
  status: string
}

export type Paged<T> = {
  results: T[]
  total: number
  skip: number
  take: number
}
