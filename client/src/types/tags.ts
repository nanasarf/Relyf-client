export interface Tag {
  id: number | string;
  name: string;
  count?: number;
}

export interface TagIdea {
  ideaId: number | string;
  tagId: number | string;
}

export interface AttachTagRequest {
  ideaId: number | string;
  tagId: number | string;
}

export interface GetIdeasByTagParams {
  tag: string;
  page?: number;
  size?: number;
}
