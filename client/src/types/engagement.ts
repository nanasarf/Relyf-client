export interface Reaction {
  id: number | string;
  ideaId: number | string;
  userId: number | string;
  type?: string;
  createdAt?: string;
}

export interface ReactionCount {
  ideaId: number | string;
  count: number;
}

export interface CreateReactionRequest {
  ideaId: number | string;
  type?: string;
}

export interface Save {
  id?: number | string;
  ideaId: number | string;
  userId?: number | string;
  title?: string;
  preview?: string;
  imageUrl?: string;
  tags?: string[];
  createdAt?: string;
  savedAtUtc?: string;
}

export interface SaveCount {
  ideaId: number | string;
  count: number;
}

export interface CreateSaveRequest {
  ideaId: number | string;
}
