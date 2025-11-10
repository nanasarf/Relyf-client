export interface DropoffSite {
  id: number | string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  acceptedMaterials?: string[];
  phone?: string;
  hours?: string;
}

export interface Feedback {
  id?: number | string;
  subject: string;
  message: string;
  email?: string;
  rating?: number;
}

export interface SubmitFeedbackRequest {
  subject: string;
  message: string;
  email?: string;
  rating?: number;
}
