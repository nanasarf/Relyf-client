export interface Image {
  id: number | string;
  ownerId: number | string;
  ownerType: string;
  url?: string;
  uploadedAt?: string;
}

export interface UploadImageResponse {
  id: number | string;
  url?: string;
  ownerId: number | string;
  ownerType: string;
}
