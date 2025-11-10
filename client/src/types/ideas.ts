export interface Idea {
  id: number | string;
  title?: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  imageUrl?: string;
  userId?: number | string;
  displayName?: string;
  userName?: string;
}

export interface IdeaStats {
  id: number | string;
  views?: number;
  saves?: number;
  reactions?: number;
}

export interface GenerateIdeaRequest {
  prompt: string;
}

export interface GenerateIdeaResponse {
  id: number | string;
  title?: string;
  description?: string;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  size?: number;
}

export interface IdeaSearchParams {
  query: string;
  page?: number;
  size?: number;
}

export interface GetIdeasParams {
  page?: number;
  size?: number;
}
